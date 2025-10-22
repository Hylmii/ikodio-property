import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const propertyId = searchParams.get('propertyId');
    const month = searchParams.get('month'); // Format: YYYY-MM
    const roomId = searchParams.get('roomId');

    if (!propertyId) {
      return NextResponse.json(
        { success: false, error: 'Property ID wajib diisi' },
        { status: 400 }
      );
    }

    // Check if property belongs to tenant
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, error: 'Property tidak ditemukan' },
        { status: 404 }
      );
    }

    if (property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Property tidak dimiliki oleh Anda' },
        { status: 403 }
      );
    }

    // Parse month or use current month
    const targetDate = month ? new Date(month + '-01') : new Date();
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);

    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    // Get all rooms for the property
    const roomsWhere: any = { propertyId };
    if (roomId) {
      roomsWhere.id = roomId;
    }

    const rooms = await prisma.room.findMany({
      where: roomsWhere,
      select: {
        id: true,
        name: true,
      },
    });

    // Get all bookings for the property in the month
    const bookings = await prisma.booking.findMany({
      where: {
        room: {
          propertyId,
          ...(roomId && { id: roomId }),
        },
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
        OR: [
          {
            checkInDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            checkOutDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { checkInDate: { lte: startDate } },
              { checkOutDate: { gte: endDate } },
            ],
          },
        ],
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Build calendar data
    const calendarData = daysInMonth.map((day) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Find bookings that overlap with this day
      const dayBookings = bookings.filter((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return day >= checkIn && day < checkOut;
      });

      // Group by room
      const roomAvailability = rooms.map((room) => {
        const roomBooking = dayBookings.find((b) => b.room.id === room.id);
        
        return {
          roomId: room.id,
          roomName: room.name,
          isAvailable: !roomBooking,
          booking: roomBooking
            ? {
                bookingNumber: roomBooking.bookingNumber,
                userName: roomBooking.user.name,
                checkIn: roomBooking.checkInDate,
                checkOut: roomBooking.checkOutDate,
                status: roomBooking.status,
              }
            : null,
        };
      });

      return {
        date: dateStr,
        dayOfWeek: format(day, 'EEEE'),
        rooms: roomAvailability,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        propertyId,
        propertyName: property.name,
        month: format(startDate, 'MMMM yyyy'),
        calendar: calendarData,
      },
    });
  } catch (error) {
    console.error('Get properties report error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil properties report' },
      { status: 500 }
    );
  }
}

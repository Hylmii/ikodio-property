import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

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
    const groupBy = searchParams.get('groupBy') || 'property';
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Invalid date format. Use YYYY-MM-DD' },
          { status: 400 }
        );
      }
      
      if (start > end) {
        return NextResponse.json(
          { success: false, error: 'startDate must be before endDate' },
          { status: 400 }
        );
      }
    }

    // Build WHERE clause correctly
    const where: any = {
      room: {
        property: {
          tenantId: session.user.id, // Filter by tenant through relationship
          ...(propertyId && { id: propertyId }) // Optional property filter
        }
      },
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
    };

    // Add date filters with correct field names
    if (startDate) {
      where.checkInDate = {
        gte: startOfDay(new Date(startDate)),
      };
    }

    if (endDate) {
      where.checkOutDate = {
        lte: endOfDay(new Date(endDate)),
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary
    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + Number(booking.totalPrice), 
      0
    );
    const totalBookings = bookings.length;
    const averageBookingValue = totalBookings > 0 
      ? totalRevenue / totalBookings 
      : 0;

    // Group data based on groupBy parameter
    let reportData: any = {};

    if (groupBy === 'property') {
      reportData = groupByProperty(bookings);
    } else if (groupBy === 'transaction') {
      reportData = groupByTransaction(bookings);
    } else if (groupBy === 'user') {
      reportData = groupByUser(bookings);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid groupBy value. Use: property, transaction, or user' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalBookings,
          averageBookingValue,
        },
        groupBy,
        reportData,
      },
    });
  } catch (error) {
    // Error logged but not exposed to client
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil sales report' },
      { status: 500 }
    );
  }
}

// Helper function: Group by property (under 15 lines)
function groupByProperty(bookings: any[]) {
  const grouped = bookings.reduce((acc: any, booking) => {
    const propertyId = booking.room.property.id;
    const propertyName = booking.room.property.name;

    if (!acc[propertyId]) {
      acc[propertyId] = {
        propertyId,
        propertyName,
        totalBookings: 0,
        totalRevenue: 0,
        bookings: [],
      };
    }

    acc[propertyId].totalBookings += 1;
    acc[propertyId].totalRevenue += Number(booking.totalPrice);
    acc[propertyId].bookings.push({
      bookingNumber: booking.bookingNumber,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      guests: booking.numberOfGuests,
      finalPrice: Number(booking.totalPrice),
      status: booking.status,
    });

    return acc;
  }, {});

  return Object.values(grouped);
}

// Helper function: Group by transaction (under 15 lines)
function groupByTransaction(bookings: any[]) {
  return bookings.map((booking) => ({
    bookingId: booking.id,
    bookingNumber: booking.bookingNumber,
    propertyName: booking.room.property.name,
    roomName: booking.room.name,
    userName: booking.user.name,
    userEmail: booking.user.email,
    checkIn: booking.checkInDate,
    checkOut: booking.checkOutDate,
    guests: booking.numberOfGuests,
    finalPrice: Number(booking.totalPrice),
    status: booking.status,
    createdAt: booking.createdAt,
  }));
}

// Helper function: Group by user (under 15 lines)
function groupByUser(bookings: any[]) {
  const grouped = bookings.reduce((acc: any, booking) => {
    const userId = booking.user.id;
    const userName = booking.user.name;
    const userEmail = booking.user.email;

    if (!acc[userId]) {
      acc[userId] = {
        userId,
        userName,
        userEmail,
        totalBookings: 0,
        totalRevenue: 0,
        bookings: [],
      };
    }

    acc[userId].totalBookings += 1;
    acc[userId].totalRevenue += Number(booking.totalPrice);
    acc[userId].bookings.push({
      bookingNumber: booking.bookingNumber,
      propertyName: booking.room.property.name,
      checkIn: booking.checkInDate,
      checkOut: booking.checkOutDate,
      finalPrice: Number(booking.totalPrice),
      status: booking.status,
    });

    return acc;
  }, {});

  return Object.values(grouped);
}
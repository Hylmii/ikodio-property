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
    const groupBy = searchParams.get('groupBy') || 'property'; // property | transaction | user
    const propertyId = searchParams.get('propertyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {
      tenantId: session.user.id,
      status: {
        in: ['CONFIRMED', 'COMPLETED'],
      },
    };

    if (propertyId) {
      where.room = {
        propertyId,
      };
    }

    if (startDate) {
      where.checkIn = {
        gte: startOfDay(new Date(startDate)),
      };
    }

    if (endDate) {
      where.checkOut = {
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

    // Calculate total revenue
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalPrice), 0);
    const totalBookings = bookings.length;

    // Group by logic
    let reportData: any = {};

    if (groupBy === 'property') {
      // Group by property
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

      reportData = Object.values(grouped);
    } else if (groupBy === 'transaction') {
      // Group by transaction/booking
      reportData = bookings.map((booking) => ({
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
    } else if (groupBy === 'user') {
      // Group by user
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

      reportData = Object.values(grouped);
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalBookings,
          averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        },
        groupBy,
        reportData,
      },
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil sales report' },
      { status: 500 }
    );
  }
}

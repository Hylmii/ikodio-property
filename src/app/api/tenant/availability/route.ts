import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth/auth.config';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const roomId = searchParams.get('roomId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!propertyId || !startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Property ID, start date, and end date are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // Verify property belongs to tenant
    const property = await prisma.property.findFirst({
      where: {
        id: propertyId,
        tenantId: session.user.id,
      },
      include: {
        rooms: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found or access denied' },
        { status: 404 }
      );
    }

    // Build where clause for bookings
    const bookingsWhere: any = {
      room: {
        propertyId: propertyId,
      },
      status: {
        in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
      },
      OR: [
        {
          AND: [
            { checkInDate: { lte: endDate } },
            { checkOutDate: { gte: startDate } },
          ],
        },
      ],
    };

    if (roomId) {
      bookingsWhere.roomId = roomId;
    }

    // Get all bookings in date range
    const bookings = await prisma.booking.findMany({
      where: bookingsWhere,
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        checkInDate: 'asc',
      },
    });

    // Generate availability for each day
    const availability = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateToCheck = new Date(currentDate);
      dateToCheck.setHours(0, 0, 0, 0);

      // Check if there are any bookings for this date
      const dayBookings = bookings.filter((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        checkIn.setHours(0, 0, 0, 0);
        checkOut.setHours(0, 0, 0, 0);

        return dateToCheck >= checkIn && dateToCheck < checkOut;
      });

      const checkInBookings = bookings.filter((booking) => {
        const checkIn = new Date(booking.checkInDate);
        checkIn.setHours(0, 0, 0, 0);
        return dateToCheck.getTime() === checkIn.getTime();
      });

      const checkOutBookings = bookings.filter((booking) => {
        const checkOut = new Date(booking.checkOutDate);
        checkOut.setHours(0, 0, 0, 0);
        return dateToCheck.getTime() === checkOut.getTime();
      });

      let status: 'available' | 'booked' | 'checkin' | 'checkout' = 'available';
      let bookingId: string | undefined;
      let guestName: string | undefined;

      if (checkInBookings.length > 0) {
        status = 'checkin';
        bookingId = checkInBookings[0].id;
        guestName = checkInBookings[0].user.name;
      } else if (checkOutBookings.length > 0) {
        status = 'checkout';
        bookingId = checkOutBookings[0].id;
        guestName = checkOutBookings[0].user.name;
      } else if (dayBookings.length > 0) {
        status = 'booked';
        bookingId = dayBookings[0].id;
        guestName = dayBookings[0].user.name;
      }

      availability.push({
        date: dateToCheck.toISOString(),
        status,
        bookingId,
        guestName,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      availability,
      property: {
        id: property.id,
        name: property.name,
      },
    });
  } catch (error) {
    console.error('Error fetching availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    );
  }
}

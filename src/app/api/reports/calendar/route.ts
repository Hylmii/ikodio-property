import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'TENANT') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get('propertyId');
    const roomId = searchParams.get('roomId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validation
    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'propertyId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    // Verify property ownership
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { tenantId: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    if (start > end) {
      return NextResponse.json(
        { error: 'startDate must be before endDate' },
        { status: 400 }
      );
    }

    // Get rooms for the property
    const rooms = await prisma.room.findMany({
      where: {
        propertyId,
        ...(roomId && { id: roomId }),
      },
      include: {
        peakSeasonRates: {
          where: {
            OR: [
              {
                startDate: { lte: end },
                endDate: { gte: start },
              },
            ],
          },
        },
      },
    });

    if (rooms.length === 0) {
      return NextResponse.json(
        { error: 'No rooms found for this property' },
        { status: 404 }
      );
    }

    // Get all bookings for these rooms in the date range
    const roomIds = rooms.map(r => r.id);
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: { in: roomIds },
        OR: [
          {
            AND: [
              { checkInDate: { lte: end } },
              { checkOutDate: { gte: start } },
            ],
          },
        ],
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
      },
      select: {
        id: true,
        roomId: true,
        checkInDate: true,
        checkOutDate: true,
        numberOfGuests: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
    // Generate calendar data
    const calendarData = generateCalendar(rooms, bookings, start, end);

    return NextResponse.json({
      success: true,
      data: {
        calendar: calendarData,
        filters: {
          propertyId,
          roomId: roomId || 'all',
          startDate: startDate,
          endDate: endDate,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
// Helper: Generate calendar for date range (under 15 lines)
function generateCalendar(
  rooms: any[], 
  bookings: any[], 
  startDate: Date, 
  endDate: Date
) {
  const calendar: any[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const roomAvailability = rooms.map(room => 
      getRoomStatusForDate(room, bookings, new Date(currentDate))
    );

    calendar.push({
      date: dateStr,
      rooms: roomAvailability,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }
  return calendar;
}

// Helper: Get room status for specific date (under 15 lines)
function getRoomStatusForDate(room: any, bookings: any[], date: Date) {
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  // Find bookings for this room on this date
  const roomBookings = bookings.filter(booking => {
    if (booking.roomId !== room.id) return false;
    
    const checkIn = new Date(booking.checkInDate);
    const checkOut = new Date(booking.checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);
    
    return dateOnly >= checkIn && dateOnly < checkOut;
  });

  const isBooked = roomBookings.length > 0;
  // Get price for this date
  const priceInfo = getPriceForDate(room, date);

  return {
    roomId: room.id,
    roomName: room.name,
    isAvailable: !isBooked,
    price: priceInfo.price,
    isPeakSeason: priceInfo.isPeakSeason,
    bookings: roomBookings.map(b => ({
      bookingId: b.id,
      guestName: b.user.name,
      guests: b.numberOfGuests,
    })),
  };
}

function getPriceForDate(room: any, date: Date) {
  let price = Number(room.basePrice);
  let isPeakSeason = false;

  const peakSeasonRate = room.peakSeasonRates.find((rate: any) => {
    const startPeak = new Date(rate.startDate);
    const endPeak = new Date(rate.endDate);
    return date >= startPeak && date <= endPeak;
  });

  if (peakSeasonRate) {
    isPeakSeason = true;
    price = Number(peakSeasonRate.priceValue);
  }

  return {
    price: Math.round(price),
    isPeakSeason,
  };
}
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
    const roomId = searchParams.get('roomId');
    const year = parseInt(searchParams.get('year') || '');
    const month = parseInt(searchParams.get('month') || '');

    if (!roomId || !year || !month) {
      return NextResponse.json(
        { error: 'roomId, year, and month are required' },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        property: {
          select: {
            tenantId: true,
          },
        },
        peakSeasonRates: {
          where: {
            OR: [
              {
                startDate: {
                  lte: new Date(year, month, 0),
                },
                endDate: {
                  gte: new Date(year, month - 1, 1),
                },
              },
            ],
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.property.tenantId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const bookings = await prisma.booking.findMany({
      where: {
        roomId,
        OR: [
          {
            AND: [
              { checkInDate: { lte: endDate } },
              { checkOutDate: { gte: startDate } },
            ],
          },
        ],
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
      },
      select: {
        checkInDate: true,
        checkOutDate: true,
      },
    });

    const daysInMonth = endDate.getDate();
    const calendarData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day);
      
      const isBooked = bookings.some(booking => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return currentDate >= checkIn && currentDate < checkOut;
      });

      let price = Number(room.basePrice);
      let isPeakSeason = false;

      const peakSeasonRate = room.peakSeasonRates.find(rate => {
        const startPeak = new Date(rate.startDate);
        const endPeak = new Date(rate.endDate);
        return currentDate >= startPeak && currentDate <= endPeak;
      });

      if (peakSeasonRate) {
        isPeakSeason = true;
        price = Number(peakSeasonRate.priceValue);
      }

      calendarData.push({
        date: currentDate.toISOString(),
        isAvailable: !isBooked,
        price: Math.round(price),
        isPeakSeason,
        bookings: isBooked ? bookings.filter(b => {
          const checkIn = new Date(b.checkInDate);
          const checkOut = new Date(b.checkOutDate);
          return currentDate >= checkIn && currentDate < checkOut;
        }) : [],
      });
    }

    return NextResponse.json({
      success: true,
      data: calendarData,
    });
  } catch (error) {
    console.error('Error fetching calendar:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

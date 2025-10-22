import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = req.nextUrl.searchParams;
    const monthParam = searchParams.get('month');

    if (!monthParam) {
      return NextResponse.json(
        { success: false, error: 'Month parameter is required' },
        { status: 400 }
      );
    }

    const selectedDate = new Date(monthParam);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Get first and last day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Get room to verify it exists
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        peakSeasonRates: {
          where: {
            OR: [
              {
                AND: [
                  { startDate: { lte: lastDay } },
                  { endDate: { gte: firstDay } },
                ],
              },
            ],
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room not found' },
        { status: 404 }
      );
    }

    // Get all bookings for this room in the selected month
    const bookings = await prisma.booking.findMany({
      where: {
        roomId: id,
        OR: [
          {
            AND: [
              { checkInDate: { lte: lastDay } },
              { checkOutDate: { gte: firstDay } },
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

    // Create calendar data
    const daysInMonth = lastDay.getDate();
    const calendarData: any = {};

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      const dateStr = currentDate.toISOString().split('T')[0];

      // Check if date is booked
      const isBooked = bookings.some((booking) => {
        const checkIn = new Date(booking.checkInDate);
        const checkOut = new Date(booking.checkOutDate);
        return currentDate >= checkIn && currentDate < checkOut;
      });

      // Calculate price for this date
      let price = Number(room.basePrice);
      let isPeakSeason = false;

      // Check if date falls in peak season
      const peakRate = room.peakSeasonRates.find((rate) => {
        const startDate = new Date(rate.startDate);
        const endDate = new Date(rate.endDate);
        return currentDate >= startDate && currentDate <= endDate;
      });

      if (peakRate) {
        isPeakSeason = true;
        if (peakRate.priceType === 'PERCENTAGE') {
          const percentage = Number(peakRate.priceValue);
          price = Number(room.basePrice) + (Number(room.basePrice) * percentage) / 100;
        } else if (peakRate.priceType === 'FIXED') {
          price = Number(room.basePrice) + Number(peakRate.priceValue);
        }
      }

      calendarData[dateStr] = {
        price,
        available: !isBooked,
        isPeakSeason,
        peakSeasonPercentage: peakRate && peakRate.priceType === 'PERCENTAGE' ? Number(peakRate.priceValue) : 0,
      };
    }

    return NextResponse.json({
      success: true,
      data: calendarData,
      basePrice: Number(room.basePrice),
    });
  } catch (error) {
    console.error('Get calendar error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

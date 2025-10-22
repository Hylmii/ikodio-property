import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    if (!startDateParam || !endDateParam) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const startDate = new Date(startDateParam);
    const endDate = new Date(endDateParam);

    // Get room details
    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        id: true,
        basePrice: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Get peak season rates for this room within date range
    const peakSeasonRates = await prisma.peakSeasonRate.findMany({
      where: {
        roomId: id,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
            ],
          },
        ],
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Generate prices for each day
    const prices = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateToCheck = new Date(currentDate);
      dateToCheck.setHours(0, 0, 0, 0);

      // Check if this date falls within any peak season
      const peakRate = peakSeasonRates.find((rate) => {
        const rateStart = new Date(rate.startDate);
        const rateEnd = new Date(rate.endDate);
        rateStart.setHours(0, 0, 0, 0);
        rateEnd.setHours(0, 0, 0, 0);

        return dateToCheck >= rateStart && dateToCheck <= rateEnd;
      });

      let finalPrice = Number(room.basePrice);

      if (peakRate) {
        if (peakRate.priceType === 'FIXED') {
          finalPrice = Number(peakRate.priceValue);
        } else if (peakRate.priceType === 'PERCENTAGE') {
          const percentage = Number(peakRate.priceValue);
          finalPrice = Number(room.basePrice) * (1 + percentage / 100);
        }
      } else {
        // Apply weekend pricing (20% increase) if no peak season
        const dayOfWeek = dateToCheck.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend) {
          finalPrice = Number(room.basePrice) * 1.2;
        }
      }

      prices.push({
        date: dateToCheck.toISOString(),
        price: Math.round(finalPrice),
        isWeekend: dateToCheck.getDay() === 0 || dateToCheck.getDay() === 6,
        isPeakSeason: !!peakRate,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      prices,
      basePrice: Number(room.basePrice),
    });
  } catch (error) {
    console.error('Error fetching room prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch room prices' },
      { status: 500 }
    );
  }
}

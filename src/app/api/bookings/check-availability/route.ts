import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomId, checkIn, checkOut, numberOfGuests } = body;

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    // Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        peakSeasonRates: {
          where: {
            OR: [
              {
                AND: [
                  { startDate: { lte: checkOutDate } },
                  { endDate: { gte: checkInDate } },
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

    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        roomId,
        OR: [
          {
            AND: [
              { checkInDate: { lt: checkOutDate } },
              { checkOutDate: { gt: checkInDate } },
            ],
          },
        ],
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
      },
    });

    // Calculate required room count based on capacity
    const guestCount = numberOfGuests || 1;
    const roomCount = Math.ceil(guestCount / room.capacity);

    // Hitung total kamar yang sudah di-booking untuk periode ini
    const totalBookedRooms = overlappingBookings.reduce((sum, booking) => sum + (booking.roomCount || 1), 0);
    const maxRoomsPerType = 100; // Limit 100 kamar per room type
    const availableRooms = maxRoomsPerType - totalBookedRooms;

    // Check if enough rooms are available
    const available = availableRooms >= roomCount;

    if (!available) {
      return NextResponse.json({
        success: true,
        available: false,
        message: `Not enough rooms available for ${guestCount} guests. Need ${roomCount} rooms but only ${availableRooms} available.`,
      });
    }

    // Calculate price breakdown
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const basePrice = Number(room.basePrice);
    const subtotal = basePrice * nights * roomCount; // Multiply by room count

    // Check for peak season rates
    let peakSeasonAdjustment = 0;
    let peakSeasonPercentage = 0;

    if (room.peakSeasonRates.length > 0) {
      // Use the first matching peak season rate
      const peakRate = room.peakSeasonRates[0];
      
      if (peakRate.priceType === 'PERCENTAGE') {
        peakSeasonPercentage = Number(peakRate.priceValue);
        peakSeasonAdjustment = (subtotal * peakSeasonPercentage) / 100;
      } else if (peakRate.priceType === 'FIXED') {
        peakSeasonAdjustment = Number(peakRate.priceValue) * nights;
      }
    }

    const total = subtotal + peakSeasonAdjustment;

    return NextResponse.json({
      success: true,
      available: true,
      priceBreakdown: {
        basePrice,
        nights,
        subtotal,
        peakSeasonAdjustment,
        peakSeasonPercentage,
        total,
        roomCount,
      },
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

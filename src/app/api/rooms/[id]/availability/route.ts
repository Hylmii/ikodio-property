import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateDuration } from '@/lib/utils/helpers';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const searchParams = req.nextUrl.searchParams;
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Check-in dan check-out date wajib diisi' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      return NextResponse.json(
        { success: false, error: 'Check-out date harus setelah check-in date' },
        { status: 400 }
      );
    }

    if (checkInDate < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Check-in date tidak boleh di masa lalu' },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
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
        { success: false, error: 'Room tidak ditemukan' },
        { status: 404 }
      );
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId: id,
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
        OR: [
          {
            AND: [
              { checkInDate: { lte: checkOutDate } },
              { checkOutDate: { gte: checkInDate } },
            ],
          },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json({
        success: true,
        data: {
          available: false,
          room: {
            id: room.id,
            name: room.name,
            property: room.property,
          },
          message: 'Room tidak tersedia untuk tanggal yang dipilih',
        },
      });
    }

    const duration = calculateDuration(checkInDate, checkOutDate);
    
    let totalPrice = 0;
    const priceBreakdown = [];

    let currentDate = new Date(checkInDate);
    while (currentDate < checkOutDate) {
      let dayPrice = Number(room.basePrice);
      
      const applicableRates = room.peakSeasonRates.filter(rate => {
        const rateStart = new Date(rate.startDate);
        const rateEnd = new Date(rate.endDate);
        return currentDate >= rateStart && currentDate <= rateEnd;
      });

      if (applicableRates.length > 0) {
        applicableRates.forEach(rate => {
          if (rate.priceType === 'FIXED') {
            dayPrice = Number(rate.priceValue);
          } else if (rate.priceType === 'PERCENTAGE') {
            dayPrice = dayPrice + (dayPrice * Number(rate.priceValue) / 100);
          }
        });
      }

      priceBreakdown.push({
        date: currentDate.toISOString().split('T')[0],
        price: dayPrice,
        isSpecialPrice: applicableRates.length > 0,
        reason: applicableRates.length > 0 ? applicableRates[0].reason : null,
      });

      totalPrice += dayPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: {
        available: true,
        room: {
          id: room.id,
          name: room.name,
          basePrice: Number(room.basePrice),
          capacity: room.capacity,
          property: room.property,
        },
        booking: {
          checkInDate: checkInDate.toISOString(),
          checkOutDate: checkOutDate.toISOString(),
          duration,
          totalPrice,
          averagePricePerNight: totalPrice / duration,
          priceBreakdown,
        },
      },
    });
  } catch (error) {
    console.error('Check availability error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengecek availability' },
      { status: 500 }
    );
  }
}

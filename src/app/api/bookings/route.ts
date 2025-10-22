import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { bookingSchema } from '@/lib/validations/schemas';
import { generateBookingNumber, calculateDuration } from '@/lib/utils/helpers';
import { createMidtransTransaction } from '@/lib/midtrans';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const where: any = {
      userId: session.user.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.bookingNumber = { contains: search, mode: 'insensitive' };
    }

    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          room: {
            include: {
              property: {
                select: {
                  id: true,
                  name: true,
                  city: true,
                  images: true,
                },
              },
            },
          },
          review: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!session.user.isVerified) {
      return NextResponse.json(
        { success: false, error: 'Email Anda belum diverifikasi' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    const validationData = {
      ...body,
      checkInDate: new Date(body.checkInDate),
      checkOutDate: new Date(body.checkOutDate),
    };

    const validation = bookingSchema.safeParse(validationData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { roomId, checkInDate, checkOutDate, numberOfGuests } = validation.data;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            tenantId: true,
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

    if (numberOfGuests > room.capacity) {
      return NextResponse.json(
        { success: false, error: `Jumlah tamu melebihi kapasitas room (max ${room.capacity} orang)` },
        { status: 400 }
      );
    }

    const existingBookings = await prisma.booking.findMany({
      where: {
        roomId,
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
      return NextResponse.json(
        { success: false, error: 'Room tidak tersedia untuk tanggal yang dipilih' },
        { status: 400 }
      );
    }

    const duration = calculateDuration(checkInDate, checkOutDate);
    
    let totalPrice = 0;
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

      totalPrice += dayPrice;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const bookingNumber = generateBookingNumber();
    const paymentDeadline = new Date(Date.now() + 60 * 60 * 1000); // 1 jam dari sekarang

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        userId: session.user.id,
        roomId,
        tenantId: room.property.tenantId,
        checkInDate,
        checkOutDate,
        duration,
        numberOfGuests,
        totalPrice,
        paymentDeadline,
        status: 'WAITING_PAYMENT',
      },
      include: {
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibuat. Silakan upload bukti pembayaran dalam 1 jam.',
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat booking' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { peakSeasonRateSchema } from '@/lib/validations/schemas';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { success: false, error: 'Room ID wajib diisi' },
        { status: 400 }
      );
    }

    const rates = await prisma.peakSeasonRate.findMany({
      where: { roomId },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: rates,
    });
  } catch (error) {
    console.error('Get peak season rates error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil peak season rates' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    const validationData = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    };

    const validation = peakSeasonRateSchema.safeParse(validationData);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { roomId, startDate, endDate, priceType, priceValue, reason } = validation.data;

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        property: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { success: false, error: 'Room tidak ditemukan' },
        { status: 404 }
      );
    }

    if (room.property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk room ini' },
        { status: 403 }
      );
    }

    const overlappingRates = await prisma.peakSeasonRate.findMany({
      where: {
        roomId,
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } },
            ],
          },
        ],
      },
    });

    if (overlappingRates.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Terdapat peak season rate yang overlap dengan tanggal yang dipilih' },
        { status: 400 }
      );
    }

    const rate = await prisma.peakSeasonRate.create({
      data: {
        roomId,
        startDate,
        endDate,
        priceType,
        priceValue,
        reason,
      },
      include: {
        room: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Peak season rate berhasil dibuat',
      data: rate,
    });
  } catch (error) {
    console.error('Create peak season rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat peak season rate' },
      { status: 500 }
    );
  }
}

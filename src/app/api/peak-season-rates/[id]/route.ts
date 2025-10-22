import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { peakSeasonRateSchema } from '@/lib/validations/schemas';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rate = await prisma.peakSeasonRate.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!rate) {
      return NextResponse.json(
        { success: false, error: 'Peak season rate tidak ditemukan' },
        { status: 404 }
      );
    }

    if (rate.room.property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk mengubah peak season rate ini' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    const validationData = {
      ...body,
      roomId: rate.roomId,
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

    const { startDate, endDate, priceType, priceValue, reason } = validation.data;

    const overlappingRates = await prisma.peakSeasonRate.findMany({
      where: {
        roomId: rate.roomId,
        id: { not: id },
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

    const updatedRate = await prisma.peakSeasonRate.update({
      where: { id },
      data: {
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
      message: 'Peak season rate berhasil diupdate',
      data: updatedRate,
    });
  } catch (error) {
    console.error('Update peak season rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupdate peak season rate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const rate = await prisma.peakSeasonRate.findUnique({
      where: { id },
      include: {
        room: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!rate) {
      return NextResponse.json(
        { success: false, error: 'Peak season rate tidak ditemukan' },
        { status: 404 }
      );
    }

    if (rate.room.property.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk menghapus peak season rate ini' },
        { status: 403 }
      );
    }

    await prisma.peakSeasonRate.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Peak season rate berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete peak season rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus peak season rate' },
      { status: 500 }
    );
  }
}

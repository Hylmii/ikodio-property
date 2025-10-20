import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { roomSchema } from '@/lib/validations/schemas';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const room = await prisma.room.findUnique({
      where: { id: params.id },
      include: {
        property: {
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        peakSeasonRates: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
          orderBy: {
            startDate: 'asc',
          },
        },
        _count: {
          select: {
            bookings: true,
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

    return NextResponse.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengambil room' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: params.id },
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
        { success: false, error: 'Anda tidak memiliki akses untuk mengubah room ini' },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    const validation = roomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, basePrice, capacity } = validation.data;
    const images = body.images || room.images;

    const updatedRoom = await prisma.room.update({
      where: { id: params.id },
      data: {
        name,
        description,
        basePrice,
        capacity,
        images,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Room berhasil diupdate',
      data: updatedRoom,
    });
  } catch (error) {
    console.error('Update room error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengupdate room' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'TENANT') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: params.id },
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
        { success: false, error: 'Anda tidak memiliki akses untuk menghapus room ini' },
        { status: 403 }
      );
    }

    const activeBookings = await prisma.booking.count({
      where: {
        roomId: params.id,
        status: {
          in: ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'],
        },
      },
    });

    if (activeBookings > 0) {
      return NextResponse.json(
        { success: false, error: 'Room tidak dapat dihapus karena masih memiliki booking aktif' },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Room berhasil dihapus',
    });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat menghapus room' },
      { status: 500 }
    );
  }
}

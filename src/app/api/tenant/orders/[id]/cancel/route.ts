import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';

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

    const body = await req.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Alasan cancel wajib diisi' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        room: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if booking belongs to tenant's property
    if (booking.tenantId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Order tidak dimiliki oleh Anda' },
        { status: 403 }
      );
    }

    // Tenant can only cancel before user uploads payment proof
    if (booking.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: 'Hanya booking dengan status WAITING_PAYMENT yang dapat dicancel oleh tenant' },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        room: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                city: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Booking berhasil dicancel oleh tenant. Alasan: ${reason}`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat cancel booking' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Anda tidak memiliki akses untuk booking ini' },
        { status: 403 }
      );
    }

    if (booking.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: 'Booking hanya dapat dibatalkan sebelum upload bukti pembayaran' },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancellationReason: 'USER_CANCELLED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dibatalkan',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membatalkan booking' },
      { status: 500 }
    );
  }
}

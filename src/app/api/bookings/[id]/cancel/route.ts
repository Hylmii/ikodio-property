import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
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

    // Allow cancellation for WAITING_PAYMENT and WAITING_CONFIRMATION
    const cancellableStatuses = ['WAITING_PAYMENT', 'WAITING_CONFIRMATION'];
    if (!cancellableStatuses.includes(booking.status)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Booking tidak dapat dibatalkan. Silakan hubungi tenant untuk pembatalan.' 
        },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
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
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membatalkan booking' },
      { status: 500 }
    );
  }
}
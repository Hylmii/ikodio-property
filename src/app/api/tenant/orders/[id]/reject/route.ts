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
        { success: false, error: 'Alasan reject wajib diisi' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
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

    // Check if status is WAITING_CONFIRMATION
    if (booking.status !== 'WAITING_CONFIRMATION') {
      return NextResponse.json(
        { success: false, error: 'Hanya booking dengan status WAITING_CONFIRMATION yang dapat direject' },
        { status: 400 }
      );
    }

    // Update booking status back to WAITING_PAYMENT and set new deadline
    const newPaymentDeadline = new Date();
    newPaymentDeadline.setHours(newPaymentDeadline.getHours() + 1);

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'WAITING_PAYMENT',
        paymentProof: null,
        paymentUploadedAt: null,
        paymentDeadline: newPaymentDeadline,
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
      message: `Payment direject. Booking dikembalikan ke status WAITING_PAYMENT. Alasan: ${reason}`,
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Reject payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat reject payment' },
      { status: 500 }
    );
  }
}

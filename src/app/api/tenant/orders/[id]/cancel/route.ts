import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

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
        { success: false, error: 'Alasan pembatalan wajib diisi' },
        { status: 400 }
      );
    }

    const booking = await getBookingWithDetails(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking tidak ditemukan' },
        { status: 404 }
      );
    }

    validateTenantOwnership(booking, session.user.id);
    validateCancellableStatus(booking.status);

    const updatedBooking = await cancelBooking(id, reason);
    await sendCancellationEmail(booking, reason);

    return NextResponse.json({
      success: true,
      message: 'Order berhasil dibatalkan',
      data: updatedBooking,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membatalkan order' },
      { status: 500 }
    );
  }
}

async function getBookingWithDetails(id: string) {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      room: {
        include: {
          property: true,
        },
      },
    },
  });
}

function validateTenantOwnership(booking: any, tenantId: string) {
  if (booking.tenantId !== tenantId) {
    throw new ValidationError('Order tidak dimiliki oleh Anda', 403);
  }
}

function validateCancellableStatus(status: string) {
  const cancellableStatuses = ['WAITING_PAYMENT', 'WAITING_CONFIRMATION', 'CONFIRMED'];
  if (!cancellableStatuses.includes(status)) {
    throw new ValidationError(
      'Order tidak dapat dibatalkan pada status ini',
      400
    );
  }
}

async function cancelBooking(id: string, reason: string) {
  return await prisma.booking.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      cancellationReason: 'TENANT_CANCELLED',
    },
  });
}

async function sendCancellationEmail(booking: any, reason: string) {
  try {
    await sendEmail({
      to: booking.user.email,
      subject: 'Pesanan Dibatalkan oleh Tenant',
      html: generateEmailHtml(booking, reason),
    });
  } catch (emailError) {
    // Log but don't fail the request
  }
}

function generateEmailHtml(booking: any, reason: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Pesanan Dibatalkan</h2>
      <p>Halo ${booking.user.name},</p>
      <p>Pesanan Anda telah dibatalkan oleh tenant.</p>
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Properti:</strong> ${booking.room.property.name}</p>
        <p><strong>Kamar:</strong> ${booking.room.name}</p>
        <p><strong>Nomor Booking:</strong> ${booking.bookingNumber}</p>
        <p><strong>Alasan Pembatalan:</strong> ${reason}</p>
      </div>
      <p>Jika Anda memiliki pertanyaan, silakan hubungi tenant.</p>
      <p>Terima kasih,<br>Tim ${process.env.APP_NAME || 'Ikodio Property'}</p>
    </div>
  `;
}

class ValidationError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ValidationError';
  }
}
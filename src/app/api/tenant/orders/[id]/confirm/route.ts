import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { sendBookingTicketEmail } from '@/lib/email/templates';
import { formatPrice } from '@/lib/utils/formatPrice';
import { formatDate } from '@/lib/utils/formatDate';

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

    const booking = await prisma.booking.findUnique({
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
        { success: false, error: 'Hanya booking dengan status WAITING_CONFIRMATION yang dapat dikonfirmasi' },
        { status: 400 }
      );
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: 'CONFIRMED',
        confirmationEmailSent: true,
      },
      include: {
        user: true,
        room: {
          include: {
            property: true,
          },
        },
      },
    });

    // Send beautiful e-ticket email
    try {
      await sendBookingTicketEmail(
        updatedBooking.user.email,
        updatedBooking.user.name || 'User',
        updatedBooking.bookingNumber,
        updatedBooking.room.property.name,
        updatedBooking.room.name,
        formatDate(updatedBooking.checkInDate),
        formatDate(updatedBooking.checkOutDate),
        formatPrice(Number(updatedBooking.totalPrice)),
        updatedBooking.numberOfGuests,
        updatedBooking.room.property.address
      );
    } catch (emailError) {
      console.error('Failed to send booking ticket email:', emailError);
      // Don't fail confirmation if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dikonfirmasi',
      data: updatedBooking,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengkonfirmasi payment' },
      { status: 500 }
    );
  }
}

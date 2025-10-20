import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmail } from '@/lib/email/templates';

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

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
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
      where: { id: params.id },
      data: {
        status: 'CONFIRMED',
        confirmationSentAt: new Date(),
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

    // Send confirmation email
    if (!updatedBooking.confirmationSentAt) {
      await sendBookingConfirmationEmail(
        updatedBooking.user.email,
        updatedBooking.user.name || 'User',
        {
          bookingNumber: updatedBooking.bookingNumber,
          propertyName: updatedBooking.room.property.name,
          roomName: updatedBooking.room.name,
          checkIn: updatedBooking.checkIn,
          checkOut: updatedBooking.checkOut,
          guests: updatedBooking.guests,
          totalPrice: updatedBooking.finalPrice,
        }
      );

      await prisma.booking.update({
        where: { id: params.id },
        data: { confirmationSentAt: new Date() },
      });
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

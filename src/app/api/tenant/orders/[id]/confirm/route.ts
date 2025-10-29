import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { sendBookingConfirmationEmail } from '@/lib/email/templates';

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
        confirmedAt: new Date(),
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

    // Send confirmation email with correct parameters
    try {
      const propertyRules = 'Harap patuhi aturan properti yang berlaku.';
      
      await sendBookingConfirmationEmail(
        updatedBooking.user.email,
        updatedBooking.user.name || 'Guest',
        updatedBooking.bookingNumber,
        updatedBooking.room.property.name,
        updatedBooking.room.name,
        updatedBooking.checkInDate.toLocaleDateString('id-ID'),
        updatedBooking.checkOutDate.toLocaleDateString('id-ID'),
        `Rp ${Number(updatedBooking.totalPrice).toLocaleString('id-ID')}`,
        propertyRules
      );

      // Mark email as sent
      await prisma.booking.update({
        where: { id },
        data: { confirmationEmailSent: true },
      });
    } catch (emailError) {
      // Email error shouldn't fail the confirmation
    }

    return NextResponse.json({
      success: true,
      message: 'Booking berhasil dikonfirmasi',
      data: updatedBooking,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat mengkonfirmasi payment' },
      { status: 500 }
    );
  }
}
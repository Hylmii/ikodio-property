import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { createMidtransTransaction } from '@/lib/midtrans';

export async function POST(
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

    const bookingId = params.id;

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    // Verify ownership
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Anda tidak memiliki akses ke booking ini' },
        { status: 403 }
      );
    }

    // Check if booking is still waiting for payment
    if (booking.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: `Booking tidak dalam status WAITING_PAYMENT (status: ${booking.status})` },
        { status: 400 }
      );
    }

    // Check if payment deadline has passed
    if (new Date() > booking.paymentDeadline) {
      // Update booking to CANCELLED
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json(
        { success: false, error: 'Payment deadline telah lewat. Booking dibatalkan.' },
        { status: 400 }
      );
    }

    // Calculate nights
    const nights = Math.ceil(
      (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    // Validate Midtrans credentials
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    if (!serverKey || !clientKey || serverKey.includes('YOUR_SERVER_KEY') || clientKey.includes('YOUR_CLIENT_KEY')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Midtrans credentials not configured. Please set up your Midtrans account and update the .env file with valid keys.',
          details: 'MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY must be set with valid values from https://dashboard.sandbox.midtrans.com/'
        },
        { status: 500 }
      );
    }

    // Create Midtrans transaction
    const midtransResult = await createMidtransTransaction({
      orderId: booking.bookingNumber,
      grossAmount: Number(booking.totalPrice),
      customerDetails: {
        firstName: booking.user.name || 'Guest',
        email: booking.user.email,
        phone: session.user.email || '', // Using email as fallback if phone not available
      },
      itemDetails: [
        {
          id: booking.room.id,
          price: Math.round(Number(booking.totalPrice) / nights),
          quantity: nights,
          name: `${booking.room.name} - ${booking.room.property.name}`,
        },
      ],
    });

    if (!midtransResult.success) {
      console.error('Midtrans transaction failed:', midtransResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gagal membuat transaksi Midtrans',
          details: midtransResult.error,
        },
        { status: 500 }
      );
    }

    // Save Midtrans token to booking (optional - for tracking)
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        // You might want to add a midtransToken field to your Booking model
        // midtransToken: midtransResult.token,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Midtrans payment created successfully',
      data: {
        token: midtransResult.token,
        redirectUrl: midtransResult.redirectUrl,
        bookingNumber: booking.bookingNumber,
      },
    });
  } catch (error) {
    console.error('Create Midtrans payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat payment' },
      { status: 500 }
    );
  }
}

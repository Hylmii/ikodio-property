import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import { createMidtransTransaction } from '@/lib/midtrans';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'USER') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id: bookingId } = await params;

    // Get booking details with relationships
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

    // Verify user owns this booking
    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Anda tidak memiliki akses ke booking ini' 
        },
        { status: 403 }
      );
    }

    // Check booking status
    if (booking.status !== 'WAITING_PAYMENT') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Booking tidak dalam status WAITING_PAYMENT (status: ${booking.status})` 
        },
        { status: 400 }
      );
    }

    // Check payment deadline
    if (new Date() > booking.paymentDeadline) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: 'PAYMENT_TIMEOUT',
        },
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment deadline telah lewat. Booking dibatalkan.' 
        },
        { status: 400 }
      );
    }

    // Calculate nights for item details
    const nights = Math.ceil(
      (booking.checkOutDate.getTime() - booking.checkInDate.getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    // Validate Midtrans credentials
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const clientKey = process.env.MIDTRANS_CLIENT_KEY;

    if (
      !serverKey || 
      !clientKey || 
      serverKey.includes('YOUR_SERVER_KEY') || 
      clientKey.includes('YOUR_CLIENT_KEY')
    ) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Midtrans credentials not configured',
          details: 'Please set up MIDTRANS_SERVER_KEY and MIDTRANS_CLIENT_KEY in .env'
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
        phone: session.user.email || '',
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gagal membuat transaksi Midtrans',
          details: midtransResult.error,
        },
        { status: 500 }
      );
    }

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
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat membuat payment' },
      { status: 500 }
    );
  }
}
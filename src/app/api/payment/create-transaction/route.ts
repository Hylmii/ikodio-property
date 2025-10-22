import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth.config';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Midtrans configuration
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_API_URL = MIDTRANS_IS_PRODUCTION
  ? 'https://app.midtrans.com/snap/v1/transactions'
  : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { bookingId, amount } = await req.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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

    if (booking.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Create transaction ID
    const orderId = `ORDER-${bookingId}-${Date.now()}`;

    // Prepare Midtrans transaction data
    const transactionData = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: booking.user.name,
        email: booking.user.email,
        phone: booking.user.phone || '',
      },
      item_details: [
        {
          id: booking.roomId,
          price: amount,
          quantity: 1,
          name: `${booking.room.property.name} - ${booking.room.name}`,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/transactions?payment=success`,
      },
    };

    // Call Midtrans API
    const response = await fetch(MIDTRANS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64')}`,
      },
      body: JSON.stringify(transactionData),
    });

    const midtransResponse = await response.json();

    if (!response.ok) {
      throw new Error(midtransResponse.error_messages?.[0] || 'Failed to create transaction');
    }

    // Store transaction in database
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentProof: orderId, // Store order ID for reference
      },
    });

    return NextResponse.json({
      success: true,
      token: midtransResponse.token,
      redirectUrl: midtransResponse.redirect_url,
    });
  } catch (error: any) {
    console.error('Create payment transaction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan saat membuat transaksi' },
      { status: 500 }
    );
  }
}

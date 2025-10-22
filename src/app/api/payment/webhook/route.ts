import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';

function verifySignature(orderId: string, statusCode: string, grossAmount: string, serverKey: string, signatureKey: string): boolean {
  const hash = crypto
    .createHash('sha512')
    .update(`${orderId}${statusCode}${grossAmount}${serverKey}`)
    .digest('hex');
  return hash === signatureKey;
}

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();

    const {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
      gross_amount,
      signature_key,
    } = notification;

    // Verify signature
    const isValid = verifySignature(
      order_id,
      status_code,
      gross_amount,
      MIDTRANS_SERVER_KEY,
      signature_key
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 403 }
      );
    }

    // Extract booking ID from order_id (format: ORDER-{bookingId}-{timestamp})
    const bookingId = order_id.split('-')[1];

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    // Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status based on transaction status
    let newStatus = booking.status;

    if (transaction_status === 'capture') {
      if (fraud_status === 'accept') {
        newStatus = 'CONFIRMED';
      }
    } else if (transaction_status === 'settlement') {
      newStatus = 'CONFIRMED';
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'CANCELLED';
    } else if (transaction_status === 'pending') {
      newStatus = 'WAITING_CONFIRMATION';
    }

    // Update booking in database
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: newStatus,
        paymentProof: order_id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification processed',
    });
  } catch (error: any) {
    console.error('Payment webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

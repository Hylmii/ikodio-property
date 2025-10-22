import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkTransactionStatus } from '@/lib/midtrans';
import crypto from 'crypto';

// Verify Midtrans signature
function verifySignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): boolean {
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

    console.log('Midtrans notification received:', {
      order_id,
      transaction_status,
      fraud_status,
      status_code,
    });

    // Verify signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
    const isValidSignature = verifySignature(
      order_id,
      status_code,
      gross_amount,
      serverKey,
      signature_key
    );

    if (!isValidSignature) {
      console.error('Invalid Midtrans signature');
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get transaction status from Midtrans (for additional verification)
    const transactionStatus = await checkTransactionStatus(order_id);
    
    // Find booking by booking number
    const booking = await prisma.booking.findFirst({
      where: { bookingNumber: order_id },
    });

    if (!booking) {
      console.error('Booking not found:', order_id);
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Update booking status based on transaction status
    let newStatus = booking.status;
    
    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept') {
        newStatus = 'WAITING_CONFIRMATION';
        console.log('Payment successful, updating to WAITING_CONFIRMATION');
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'WAITING_PAYMENT';
      console.log('Payment pending');
    } else if (transaction_status === 'deny' || transaction_status === 'expire' || transaction_status === 'cancel') {
      newStatus = 'CANCELLED';
      console.log('Payment denied/expired/cancelled, updating to CANCELLED');
    }

    // Update booking
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: newStatus,
        // You might want to add these fields to your Booking model:
        // paymentMethod: 'MIDTRANS',
        // transactionId: transactionStatus.transaction_id,
        // paymentStatus: transaction_status,
      },
    });

    console.log('Booking updated:', {
      bookingId: booking.id,
      oldStatus: booking.status,
      newStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'Notification processed successfully',
    });
  } catch (error) {
    console.error('Midtrans notification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkTransactionStatus } from '@/lib/midtrans';
import { sendBookingConfirmationEmail } from '@/lib/email/templates';
import crypto from 'crypto';

// Verify Midtrans signature for security
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
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Get transaction status from Midtrans for verification
    const transactionStatus = await checkTransactionStatus(order_id);
    
    // Find booking by booking number
    const booking = await prisma.booking.findFirst({
      where: { bookingNumber: order_id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Determine new booking status based on transaction status
    let newStatus = booking.status;
    let shouldSendEmail = false;
    
    if (
      transaction_status === 'capture' || 
      transaction_status === 'settlement'
    ) {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'CONFIRMED';
        shouldSendEmail = true;
      }
    } else if (transaction_status === 'pending') {
      newStatus = 'WAITING_PAYMENT';
    } else if (
      transaction_status === 'deny' || 
      transaction_status === 'expire' || 
      transaction_status === 'cancel'
    ) {
      newStatus = 'CANCELLED';
    }

    // Update booking in database
    const updateData: any = {
      status: newStatus,
    };

    // Add confirmation timestamp if confirmed
    if (newStatus === 'CONFIRMED' && booking.status !== 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    }

    // Add cancellation info if cancelled
    if (newStatus === 'CANCELLED' && booking.status !== 'CANCELLED') {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = 'PAYMENT_TIMEOUT';
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: updateData,
      include: {
        user: true,
        room: {
          include: {
            property: true,
          },
        },
      },
    });

    // Send confirmation email if payment successful
    if (shouldSendEmail && newStatus === 'CONFIRMED') {
      try {
        const propertyRules =  'Harap patuhi aturan properti yang berlaku.';
        
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
          where: { id: booking.id },
          data: { confirmationEmailSent: true },
        });
      } catch (emailError) {
        // Email error shouldn't fail the webhook
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Notification processed successfully',
      data: {
        bookingId: booking.id,
        oldStatus: booking.status,
        newStatus,
        emailSent: shouldSendEmail,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
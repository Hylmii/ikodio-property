import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    const expiredBookings = await prisma.booking.findMany({
      where: {
        status: 'WAITING_PAYMENT',
        paymentDeadline: {
          lt: now,
        },
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

    const results = [];

    for (const booking of expiredBookings) {
      try {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        await sendEmail({
          to: booking.user.email,
          subject: 'Pesanan Dibatalkan - Batas Waktu Pembayaran Terlewati',
          template: 'booking-cancelled',
          data: {
            userName: booking.user.name,
            propertyName: booking.room.property.name,
            roomName: booking.room.name,
            bookingId: booking.id,
            reason: 'Batas waktu pembayaran telah terlewati',
          },
        });

        results.push({
          bookingId: booking.id,
          status: 'cancelled',
        });
      } catch (error) {
        console.error(`Error cancelling booking ${booking.id}:`, error);
        results.push({
          bookingId: booking.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredBookings.length} expired bookings`,
      results,
    });
  } catch (error) {
    console.error('Error in auto-cancel cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

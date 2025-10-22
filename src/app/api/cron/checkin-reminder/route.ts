import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: 'CONFIRMED',
        checkInDate: {
          gte: tomorrow,
          lte: endOfTomorrow,
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

    for (const booking of upcomingBookings) {
      try {
        await sendEmail({
          to: booking.user.email,
          subject: 'Reminder: Check-in Besok',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reminder Check-in</h2>
              <p>Halo ${booking.user.name},</p>
              <p>Ini adalah pengingat bahwa check-in Anda akan dilakukan besok.</p>
              <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Properti:</strong> ${booking.room.property.name}</p>
                <p><strong>Kamar:</strong> ${booking.room.name}</p>
                <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString('id-ID')}</p>
                <p><strong>Alamat:</strong> ${booking.room.property.address}, ${booking.room.property.city}</p>
              </div>
              <p>Pastikan Anda tiba tepat waktu. Selamat berlibur!</p>
              <p>Terima kasih,<br>Tim ${process.env.APP_NAME || 'Ikodio Property'}</p>
            </div>
          `,
        });

        results.push({
          bookingId: booking.id,
          status: 'sent',
          email: booking.user.email,
        });
      } catch (error) {
        console.error(`Error sending reminder for booking ${booking.id}:`, error);
        results.push({
          bookingId: booking.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${results.filter(r => r.status === 'sent').length} reminders out of ${upcomingBookings.length} upcoming bookings`,
      results,
    });
  } catch (error) {
    console.error('Error in reminder cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

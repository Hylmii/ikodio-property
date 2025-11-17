import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get tomorrow's date (H-1 before check-in)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    // Find all bookings with check-in tomorrow that haven't received reminder
    const bookingsToRemind = await prisma.booking.findMany({
      where: {
        checkInDate: {
          gte: tomorrow,
          lt: dayAfterTomorrow,
        },
        status: {
          in: ['CONFIRMED', 'WAITING_CONFIRMATION'],
        },
        reminderEmailSent: false,
      },
      include: {
        user: true,
        room: {
          include: {
            property: {
              include: {
                tenant: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${bookingsToRemind.length} bookings to send reminders`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Send reminder email for each booking
    for (const booking of bookingsToRemind) {
      try {
        const property = booking.room.property;
        const tenant = property.tenant;

        // Format dates
        const checkInDate = new Date(booking.checkInDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Compose email
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Check-in Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: #0f172a; color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .booking-card { background-color: #f1f5f9; border-left: 4px solid #0f172a; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .info-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
    .info-label { font-weight: bold; color: #475569; }
    .info-value { color: #1e293b; }
    .highlight { background-color: #fef3c7; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #fbbf24; }
    .button { display: inline-block; padding: 12px 30px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; font-weight: bold; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
    .contact-info { margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0; }
    .checklist { background-color: #f1f5f9; padding: 20px; border-radius: 4px; margin: 20px 0; }
    .checklist ul { margin: 10px 0; padding-left: 20px; }
    .checklist li { margin: 8px 0; color: #475569; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Check-in Reminder</h1>
    </div>
    
    <div class="content">
      <p>Dear <strong>${booking.user.name}</strong>,</p>
      
      <p>This is a friendly reminder that your check-in is <strong>tomorrow</strong>!</p>
      
      <div class="booking-card">
        <h2 style="margin-top: 0; color: #0f172a;">Booking Details</h2>
        
        <div class="info-row">
          <span class="info-label">Booking ID:</span>
          <span class="info-value">#${booking.id.slice(0, 8).toUpperCase()}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Property:</span>
          <span class="info-value">${property.name}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Room:</span>
          <span class="info-value">${booking.room.name}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Check-in Date:</span>
          <span class="info-value">${checkInDate}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Check-out Date:</span>
          <span class="info-value">${checkOutDate}</span>
        </div>
        
        <div class="info-row">
          <span class="info-label">Number of Guests:</span>
          <span class="info-value">${booking.numberOfGuests}</span>
        </div>
        
        <div class="info-row" style="border-bottom: none;">
          <span class="info-label">Total Amount:</span>
          <span class="info-value" style="font-size: 18px; font-weight: bold; color: #0f172a;">Rp ${Number(booking.totalPrice).toLocaleString('id-ID')}</span>
        </div>
      </div>
      
      <div class="highlight">
        <p style="margin: 0;"><strong>Check-in Time:</strong> Standard check-in starts at 2:00 PM</p>
      </div>
      
      <div class="checklist">
        <h3 style="margin-top: 0; color: #0f172a;">Preparation Checklist:</h3>
        <ul>
          <li>Bring valid ID for verification</li>
          <li>Prepare your booking confirmation</li>
          <li>Review property rules and guidelines</li>
          <li>Arrive during check-in hours (2:00 PM - 10:00 PM)</li>
          <li>Contact property if you expect late arrival</li>
        </ul>
      </div>
      
      <div class="contact-info">
        <h3 style="color: #0f172a;">Property Contact Information</h3>
        <p style="margin: 5px 0;"><strong>Address:</strong><br>${property.address}, ${property.city}, ${property.province}</p>
        ${tenant.phone ? `<p style="margin: 5px 0;"><strong>Phone:</strong> ${tenant.phone}</p>` : ''}
        <p style="margin: 5px 0;"><strong>Email:</strong> ${tenant.email}</p>
      </div>
      
      <p>If you have any questions or need to modify your booking, please contact the property directly or reach out to our support team.</p>
      
      <p>We hope you have a wonderful stay!</p>
      
      <p style="margin-top: 30px;">
        Best regards,<br>
        <strong>Ikodio Property Team</strong>
      </p>
    </div>
    
    <div class="footer">
      <p>This is an automated reminder email. Please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Ikodio Property. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `;

        // Send email
        await transporter.sendMail({
          from: `"Ikodio Property" <${process.env.SMTP_USER}>`,
          to: booking.user.email,
          subject: `Check-in Reminder - ${property.name} (Tomorrow)`,
          html: emailHtml,
        });

        // Update booking to mark reminder as sent
        await prisma.booking.update({
          where: { id: booking.id },
          data: { reminderEmailSent: true },
        });

        results.success++;
        console.log(`Reminder sent successfully for booking ${booking.id}`);
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Booking ${booking.id}: ${errorMessage}`);
        console.error(`Failed to send reminder for booking ${booking.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in reminder job completed',
      results: {
        total: bookingsToRemind.length,
        success: results.success,
        failed: results.failed,
        errors: results.errors,
      },
    });
  } catch (error) {
    console.error('Error in check-in reminder cron job:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process check-in reminders',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

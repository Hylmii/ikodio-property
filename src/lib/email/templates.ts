import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

export function getVerificationEmailTemplate(name: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.APP_NAME}</h1>
        </div>
        <div class="content">
          <h2>Verifikasi Email Anda</h2>
          <p>Halo ${name},</p>
          <p>Terima kasih telah mendaftar di ${process.env.APP_NAME}. Silakan klik tombol di bawah ini untuk memverifikasi email Anda:</p>
          <a href="${verificationUrl}" class="button">Verifikasi Email</a>
          <p>Atau salin dan tempel URL berikut di browser Anda:</p>
          <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
          <p><strong>Link ini akan kadaluarsa dalam 1 jam.</strong></p>
          <p>Jika Anda tidak mendaftar di ${process.env.APP_NAME}, abaikan email ini.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getResetPasswordEmailTemplate(name: string, resetUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .button { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${process.env.APP_NAME}</h1>
        </div>
        <div class="content">
          <h2>Reset Password</h2>
          <p>Halo ${name},</p>
          <p>Anda telah meminta untuk mereset password Anda. Klik tombol di bawah ini untuk melanjutkan:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Atau salin dan tempel URL berikut di browser Anda:</p>
          <p style="word-break: break-all; color: #2563eb;">${resetUrl}</p>
          <p><strong>Link ini akan kadaluarsa dalam 1 jam.</strong></p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getBookingTicketEmailTemplate(
  name: string,
  bookingNumber: string,
  propertyName: string,
  roomName: string,
  checkIn: string,
  checkOut: string,
  totalPrice: string,
  guestCount: number,
  propertyAddress: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          background: #f3f4f6;
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 { 
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 16px;
          opacity: 0.95;
        }
        .content { 
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          color: #111827;
        }
        .message {
          font-size: 15px;
          color: #4b5563;
          margin-bottom: 32px;
          line-height: 1.7;
        }
        .ticket-box {
          background: #ffffff;
          border: 2px dashed #d1d5db;
          border-radius: 12px;
          padding: 28px;
          margin: 28px 0;
        }
        .booking-number {
          text-align: center;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .booking-number-label {
          font-size: 13px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .booking-number-value {
          font-size: 32px;
          font-weight: 800;
          color: #10b981;
          letter-spacing: 1px;
          font-family: 'Courier New', monospace;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .detail-item {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }
        .detail-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .detail-value {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
        }
        .detail-full {
          grid-column: 1 / -1;
        }
        .icon {
          display: inline-block;
          width: 14px;
          height: 14px;
        }
        .success-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #d1fae5;
          color: #065f46;
          padding: 12px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .check-icon {
          width: 20px;
          height: 20px;
          background: #10b981;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .footer { 
          background: #f9fafb;
          text-align: center; 
          padding: 30px; 
          color: #6b7280; 
          font-size: 13px;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 6px 0;
        }
        @media only screen and (max-width: 600px) {
          .container { margin: 20px; border-radius: 8px; }
          .header { padding: 30px 20px; }
          .header h1 { font-size: 24px; }
          .content { padding: 30px 20px; }
          .ticket-box { padding: 20px; }
          .booking-number-value { font-size: 28px; }
          .detail-grid { grid-template-columns: 1fr; gap: 12px; }
          .detail-full { grid-column: 1; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Dikonfirmasi!</h1>
          <p>E-Ticket Anda Siap</p>
        </div>
        <div class="content">
          <div class="success-badge">
            <span class="check-icon">✓</span>
            <span>Pembayaran Berhasil Diverifikasi</span>
          </div>
          
          <p class="greeting">Halo ${name},</p>
          <p class="message">
            Selamat! Pembayaran Anda telah dikonfirmasi oleh tenant. Berikut adalah e-ticket pemesanan Anda. 
            Simpan email ini dan tunjukkan pada saat check-in.
          </p>

          <div class="ticket-box">
            <div class="booking-number">
              <div class="booking-number-label">Nomor Booking</div>
              <div class="booking-number-value">${bookingNumber}</div>
            </div>

            <div class="detail-grid">
              <div class="detail-item detail-full">
                <div class="detail-label">
                  <span class="icon">🏨</span>
                  Properti
                </div>
                <div class="detail-value">${propertyName}</div>
              </div>

              <div class="detail-item detail-full">
                <div class="detail-label">
                  <span class="icon">🛏️</span>
                  Tipe Kamar
                </div>
                <div class="detail-value">${roomName}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <span class="icon">📅</span>
                  Check-in
                </div>
                <div class="detail-value">${checkIn}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <span class="icon">📅</span>
                  Check-out
                </div>
                <div class="detail-value">${checkOut}</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <span class="icon">👥</span>
                  Jumlah Tamu
                </div>
                <div class="detail-value">${guestCount} orang</div>
              </div>

              <div class="detail-item">
                <div class="detail-label">
                  <span class="icon">💰</span>
                  Total Pembayaran
                </div>
                <div class="detail-value">${totalPrice}</div>
              </div>

              <div class="detail-item detail-full">
                <div class="detail-label">
                  <span class="icon">📍</span>
                  Alamat Properti
                </div>
                <div class="detail-value">${propertyAddress}</div>
              </div>
            </div>
          </div>

          <p class="message">
            <strong>Catatan Penting:</strong><br>
            • Harap tiba sesuai waktu check-in yang telah ditentukan<br>
            • Bawa identitas diri yang valid (KTP/SIM/Paspor)<br>
            • Tunjukkan e-ticket ini saat check-in<br>
            • Hubungi properti jika ada perubahan jadwal
          </p>

          <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
            Terima kasih telah memesan melalui <strong>${process.env.APP_NAME || 'Ikodio Property'}</strong>. 
            Selamat berlibur! 🎊
          </p>
        </div>
        <div class="footer">
          <p><strong>${process.env.APP_NAME || 'Ikodio Property'}</strong></p>
          <p>Email ini dikirim otomatis, mohon tidak membalas.</p>
          <p>&copy; 2025 ${process.env.APP_NAME || 'Ikodio Property'}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendBookingTicketEmail(
  to: string,
  name: string,
  bookingNumber: string,
  propertyName: string,
  roomName: string,
  checkIn: string,
  checkOut: string,
  totalPrice: string,
  guestCount: number,
  propertyAddress: string
) {
  const html = getBookingTicketEmailTemplate(
    name,
    bookingNumber,
    propertyName,
    roomName,
    checkIn,
    checkOut,
    totalPrice,
    guestCount,
    propertyAddress
  );
  
  return await sendEmail({
    to,
    subject: `🎉 Booking Dikonfirmasi - E-Ticket ${bookingNumber}`,
    html,
  });
}

export function getBookingConfirmationEmailTemplate(
  name: string,
  bookingNumber: string,
  propertyName: string,
  roomName: string,
  checkIn: string,
  checkOut: string,
  totalPrice: string,
  propertyRules: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .booking-detail { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pembayaran Dikonfirmasi</h1>
        </div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Pembayaran Anda telah dikonfirmasi. Berikut detail pemesanan Anda:</p>
          <div class="booking-detail">
            <div class="detail-row">
              <strong>Nomor Booking:</strong>
              <span>${bookingNumber}</span>
            </div>
            <div class="detail-row">
              <strong>Properti:</strong>
              <span>${propertyName}</span>
            </div>
            <div class="detail-row">
              <strong>Tipe Kamar:</strong>
              <span>${roomName}</span>
            </div>
            <div class="detail-row">
              <strong>Check-in:</strong>
              <span>${checkIn}</span>
            </div>
            <div class="detail-row">
              <strong>Check-out:</strong>
              <span>${checkOut}</span>
            </div>
            <div class="detail-row">
              <strong>Total Pembayaran:</strong>
              <span>${totalPrice}</span>
            </div>
          </div>
          <h3>Aturan Properti:</h3>
          <p>${propertyRules}</p>
          <p>Terima kasih telah memesan di ${process.env.APP_NAME}!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  bookingNumber: string,
  propertyName: string,
  roomName: string,
  checkIn: string,
  checkOut: string,
  totalPrice: string,
  propertyRules: string
) {
  const html = getBookingConfirmationEmailTemplate(
    name,
    bookingNumber,
    propertyName,
    roomName,
    checkIn,
    checkOut,
    totalPrice,
    propertyRules
  );
  
  return await sendEmail({
    to,
    subject: 'Pembayaran Dikonfirmasi - Booking Anda Berhasil',
    html,
  });
}

export function getCheckInReminderEmailTemplate(
  name: string,
  propertyName: string,
  roomName: string,
  checkIn: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Pengingat Check-in</h1>
        </div>
        <div class="content">
          <p>Halo ${name},</p>
          <p>Ini adalah pengingat bahwa Anda memiliki pemesanan check-in besok:</p>
          <ul>
            <li><strong>Properti:</strong> ${propertyName}</li>
            <li><strong>Tipe Kamar:</strong> ${roomName}</li>
            <li><strong>Tanggal Check-in:</strong> ${checkIn}</li>
          </ul>
          <p>Pastikan Anda tiba tepat waktu. Selamat berlibur!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 ${process.env.APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

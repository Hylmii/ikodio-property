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

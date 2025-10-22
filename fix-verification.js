const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

async function regenerateAndSend() {
  console.log('🔄 Regenerating verification token and sending new email...\n');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'hylmir25@gmail.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    if (user.isVerified) {
      console.log('✅ User already verified!');
      return;
    }
    
    // Generate NEW token
    const newToken = crypto.randomBytes(16).toString('hex');
    const newExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    
    console.log('Old token:', user.verificationToken);
    console.log('Old expiry:', user.verificationExpiry);
    console.log('');
    console.log('🆕 New token:', newToken);
    console.log('🆕 New expiry:', newExpiry);
    console.log('');
    
    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: newToken,
        verificationExpiry: newExpiry,
      }
    });
    
    console.log('✅ Database updated!');
    console.log('');
    
    // Create verification URL
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${newToken}`;
    
    console.log('🔗 Verification URL:', verificationUrl);
    console.log('');
    
    // Setup email transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // Send email
    console.log('📧 Sending email to', user.email, '...');
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Verifikasi Email Anda - Ikodio Property',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #ffffff; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8fafc; padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; font-size: 16px; }
    .button:hover { opacity: 0.9; }
    .url-box { background: white; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; font-size: 13px; color: #475569; }
    .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0; }
    .footer { text-align: center; color: #94a3b8; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
    .emoji { font-size: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="emoji">🏠</div>
      <h1 style="margin: 10px 0;">Ikodio Property</h1>
      <p style="margin: 0; opacity: 0.9;">Platform Sewa Properti Terpercaya</p>
    </div>
    <div class="content">
      <h2>Halo ${user.name}! 👋</h2>
      <p style="font-size: 16px;">Terima kasih telah mendaftar di <strong>Ikodio Property</strong>.</p>
      <p>Untuk menyelesaikan registrasi Anda, silakan verifikasi email dan buat password dengan klik tombol di bawah:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" class="button">✅ Verifikasi Email & Set Password</a>
      </div>
      
      <p>Atau salin dan tempel URL berikut di browser Anda:</p>
      <div class="url-box">${verificationUrl}</div>
      
      <div class="info-box">
        <strong>⏰ Penting:</strong> Link ini akan <strong>kadaluarsa dalam 1 jam</strong> dari sekarang.
      </div>
      
      <p style="color: #64748b; font-size: 14px; margin-top: 30px;">
        Jika Anda tidak mendaftar di Ikodio Property, abaikan email ini dengan aman.
      </p>
    </div>
    <div class="footer">
      <p style="margin: 5px 0;"><strong>Ikodio Property</strong></p>
      <p style="margin: 5px 0;">&copy; 2025 All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('');
    console.log('🎉 NEW EMAIL HAS BEEN SENT!');
    console.log('📱 Please check your inbox: hylmir25@gmail.com');
    console.log('');
    console.log('⚠️  DELETE OLD EMAILS and use the NEW one!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

regenerateAndSend();

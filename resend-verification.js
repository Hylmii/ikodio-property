const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
require('dotenv').config();

const prisma = new PrismaClient();

async function resendVerification() {
  console.log('📧 Resending verification email...\n');
  
  try {
    // Get user with verification token
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
    
    if (!user.verificationToken) {
      console.log('❌ No verification token found');
      return;
    }
    
    console.log('User info:');
    console.log('  Email:', user.email);
    console.log('  Name:', user.name);
    console.log('  Token:', user.verificationToken);
    console.log('  Expiry:', user.verificationExpiry);
    console.log('');
    
    // Check if token expired
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      console.log('⚠️  Token expired! Generating new token...');
      
      const newToken = require('crypto').randomBytes(16).toString('hex');
      const newExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verificationToken: newToken,
          verificationExpiry: newExpiry,
        }
      });
      
      user.verificationToken = newToken;
      user.verificationExpiry = newExpiry;
      console.log('  New token:', newToken);
      console.log('  New expiry:', newExpiry);
      console.log('');
    }
    
    // Create verification URL
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${user.verificationToken}`;
    
    console.log('Verification URL:', verificationUrl);
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
    console.log('Sending email...');
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Verifikasi Email Anda - Ikodio Property',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
    .url-box { background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; margin: 15px 0; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Ikodio Property</h1>
    </div>
    <div class="content">
      <h2>Halo ${user.name}! 👋</h2>
      <p>Terima kasih telah mendaftar di <strong>Ikodio Property</strong>.</p>
      <p>Silakan klik tombol di bawah ini untuk memverifikasi email Anda dan membuat password:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">✅ Verifikasi Email</a>
      </div>
      
      <p>Atau salin dan tempel URL berikut di browser Anda:</p>
      <div class="url-box">${verificationUrl}</div>
      
      <p><strong>⏰ Link ini akan kadaluarsa dalam 1 jam.</strong></p>
      
      <p>Jika Anda tidak mendaftar di Ikodio Property, abaikan email ini.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Ikodio Property. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\n🎉 Please check your email inbox!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resendVerification();

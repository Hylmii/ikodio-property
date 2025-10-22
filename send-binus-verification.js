const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

async function sendVerificationBinus() {
  console.log('📧 Sending verification to BINUS email...\n');
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'hylmi.rabbani@binus.ac.id' }
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
    const newExpiry = new Date(Date.now() + 60 * 60 * 1000);
    
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
    
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${newToken}`;
    console.log('🔗 URL:', verificationUrl);
    console.log('');
    
    // Send email
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: '✅ Verifikasi Email - Ikodio Property',
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f8fafc; padding: 40px 30px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: bold; }
    .url-box { background: white; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 8px; margin: 20px 0; word-break: break-all; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Ikodio Property</h1>
    </div>
    <div class="content">
      <h2>Halo ${user.name}! 👋</h2>
      <p>Silakan klik tombol di bawah untuk verifikasi email dan membuat password:</p>
      
      <div style="text-align: center;">
        <a href="${verificationUrl}" class="button">✅ Verifikasi Email</a>
      </div>
      
      <p>Atau copy URL ini:</p>
      <div class="url-box">${verificationUrl}</div>
      
      <p><strong>⏰ Link berlaku 1 jam.</strong></p>
    </div>
  </div>
</body>
</html>
      `,
    });
    
    console.log('✅ Email sent to:', user.email);
    console.log('📱 Please check your BINUS email inbox!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

sendVerificationBinus();

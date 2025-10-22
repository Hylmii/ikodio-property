#!/usr/bin/env node

/**
 * Test Email Configuration
 * Run this script to verify SMTP settings work correctly
 * 
 * Usage: node test-email.js your-test-email@gmail.com
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env file manually
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const testEmail = process.argv[2] || 'test@example.com';

console.log('\n🔍 Testing Email Configuration...\n');
console.log('Configuration:');
console.log('  Host:', process.env.EMAIL_HOST);
console.log('  Port:', process.env.EMAIL_PORT);
console.log('  User:', process.env.EMAIL_USER);
console.log('  Pass:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
console.log('  From:', process.env.EMAIL_FROM);
console.log('  To:  ', testEmail);
console.log();

if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.error('❌ ERROR: Email configuration missing in .env file!');
  console.error('\nPlease set these variables in .env:');
  console.error('  EMAIL_HOST');
  console.error('  EMAIL_PORT');
  console.error('  EMAIL_USER');
  console.error('  EMAIL_PASSWORD');
  console.error('  EMAIL_FROM');
  console.error('\nSee docs/EMAIL_SETUP_GUIDE.md for help.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

console.log('📤 Sending test email...\n');

transporter.sendMail({
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
  to: testEmail,
  subject: '✅ Test Email from Ikodio Property',
  text: 'Congratulations! Your SMTP configuration is working correctly.',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #0f172a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">✅ Success!</h1>
      </div>
      <div style="background-color: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #0f172a;">SMTP Configuration Working</h2>
        <p style="color: #475569; line-height: 1.6;">
          Congratulations! Your email configuration is set up correctly and emails are being sent successfully.
        </p>
        <div style="background-color: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #166534;">
            <strong>✓ SMTP Host:</strong> ${process.env.EMAIL_HOST}<br>
            <strong>✓ SMTP Port:</strong> ${process.env.EMAIL_PORT}<br>
            <strong>✓ From Email:</strong> ${process.env.EMAIL_USER}
          </p>
        </div>
        <p style="color: #475569; line-height: 1.6;">
          You can now proceed with user registration and email verification features.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">
          This is a test email from Ikodio Property development environment.
        </p>
      </div>
    </div>
  `,
})
.then(() => {
  console.log('✅ SUCCESS! Email sent successfully!');
  console.log('\n📧 Check your inbox:', testEmail);
  console.log('   (Also check spam/promotions folder)');
  console.log('\n🎉 Your SMTP configuration is working correctly!');
  console.log('\nYou can now:');
  console.log('  1. Test user registration: http://localhost:3000/register-user');
  console.log('  2. Check verification emails arrive');
  console.log('  3. Deploy to production\n');
  process.exit(0);
})
.catch(err => {
  console.error('❌ ERROR sending email:');
  console.error('\nError Message:', err.message);
  console.error('\nCommon Issues:');
  console.error('  1. Invalid username/password');
  console.error('  2. Need to use App Password (not regular Gmail password)');
  console.error('  3. 2FA not enabled on Gmail');
  console.error('  4. Wrong SMTP host/port');
  console.error('\n📖 See docs/EMAIL_SETUP_GUIDE.md for detailed setup instructions.\n');
  process.exit(1);
});

# 📧 EMAIL CONFIGURATION GUIDE

## 🚨 Problem
Email verification tidak terkirim karena SMTP belum dikonfigurasi dengan benar.

---

## ✅ SOLUTION - Setup Gmail for Development

### Step 1: Prepare Gmail Account

1. **Login ke Gmail Account** yang akan digunakan untuk mengirim email
2. **Enable 2-Factor Authentication (2FA)**
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

### Step 2: Generate App Password

1. **Go to App Passwords**
   - URL: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords

2. **Create New App Password**
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "Ikodio Property"
   - Click "Generate"

3. **Copy the 16-character password**
   - Example: `abcd efgh ijkl mnop`
   - Remove spaces: `abcdefghijklmnop`
   - This is your `EMAIL_PASSWORD` / `SMTP_PASSWORD`

### Step 3: Update .env File

Open `/Users/hylmii/finpro-hylmixalam/ikodio-property/.env` and update:

```bash
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="your-actual-email@gmail.com"  # ← Change this
EMAIL_PASSWORD="your-16-char-app-password"  # ← Change this
EMAIL_FROM="Ikodio Property <your-actual-email@gmail.com>"

# SMTP Configuration (for check-in reminders)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-actual-email@gmail.com"  # ← Change this
SMTP_PASSWORD="your-16-char-app-password"  # ← Change this
```

### Step 4: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Test Registration

1. Go to: http://localhost:3000/register-user
2. Enter your email (use different email from sender)
3. Click Register
4. Check your inbox for verification email

---

## 🔍 Troubleshooting

### Problem: Still no email received

#### Check 1: Verify .env is loaded
```bash
# Check if .env variables are set
cat .env | grep EMAIL
```

#### Check 2: Check spam folder
- Gmail might mark it as spam on first send
- Check "Spam" or "Promotions" folder

#### Check 3: Check server logs
Look for errors in terminal like:
```
Error sending email: Invalid login: 535-5.7.8 Username and Password not accepted
```

#### Check 4: Verify App Password
- Make sure you copied it correctly (no spaces)
- Generate a new one if needed
- Must be 16 characters

#### Check 5: Allow Less Secure Apps (Old Gmail accounts only)
If using very old Gmail:
- Go to: https://myaccount.google.com/lesssecureapps
- Turn ON "Allow less secure apps"
- Note: This is deprecated, use App Password instead

---

## 📝 Example Configuration

Here's a complete working example:

```bash
# Email Configuration
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_USER="johndoe.dev@gmail.com"
EMAIL_PASSWORD="abcdefghijklmnop"
EMAIL_FROM="Ikodio Property <johndoe.dev@gmail.com>"

# SMTP Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="johndoe.dev@gmail.com"
SMTP_PASSWORD="abcdefghijklmnop"
```

---

## 🧪 Test Email Service

Create a quick test script to verify SMTP works:

```bash
# Create test file
cat > test-email.js << 'EOF'
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.sendMail({
  from: process.env.EMAIL_FROM,
  to: 'your-test-email@gmail.com', // Change this
  subject: 'Test Email from Ikodio Property',
  text: 'If you receive this, SMTP is working!',
  html: '<h1>Success!</h1><p>SMTP is configured correctly.</p>',
})
.then(() => console.log('✅ Email sent successfully!'))
.catch(err => console.error('❌ Error:', err.message));
EOF

# Run test
node test-email.js
```

---

## 🔐 Security Best Practices

### For Development:
✅ Use App Password (not your main Gmail password)
✅ Use separate Gmail for testing
✅ Keep .env in .gitignore

### For Production:
✅ Use dedicated SMTP service:
   - SendGrid (free tier: 100 emails/day)
   - Mailgun (free tier: 5,000 emails/month)
   - AWS SES (very cheap)
   - Brevo (formerly Sendinblue)

✅ Set up proper SPF, DKIM, DMARC records
✅ Use environment variables in Vercel/Railway
✅ Enable rate limiting on email sending

---

## 🚀 Alternative SMTP Providers

If Gmail doesn't work, try these:

### 1. Mailtrap (for testing)
```bash
EMAIL_HOST="smtp.mailtrap.io"
EMAIL_PORT="2525"
EMAIL_USER="your-mailtrap-username"
EMAIL_PASSWORD="your-mailtrap-password"
```

### 2. SendGrid
```bash
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
```

### 3. Outlook/Hotmail
```bash
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-password"
```

---

## ✅ Quick Setup Checklist

- [ ] Enable 2FA on Gmail
- [ ] Generate App Password
- [ ] Update EMAIL_USER in .env
- [ ] Update EMAIL_PASSWORD in .env
- [ ] Update SMTP_USER in .env
- [ ] Update SMTP_PASSWORD in .env
- [ ] Save .env file
- [ ] Restart dev server
- [ ] Test registration
- [ ] Check email inbox (and spam)

---

## 📞 Support

If still not working:
1. Check server terminal for error messages
2. Verify all .env values are correct (no extra spaces)
3. Try generating new App Password
4. Test with test-email.js script above
5. Check Gmail Activity: https://myaccount.google.com/notifications

---

**Last Updated**: October 21, 2025  
**Status**: Production Ready

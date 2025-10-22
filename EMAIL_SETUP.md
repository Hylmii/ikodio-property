# 🚀 Quick Email Setup - 5 Minutes

## Problem
Email verification tidak terkirim saat registrasi → "Silakan cek email Anda untuk verifikasi akun"

## Solution (5 Steps)

### 1️⃣ Enable Gmail 2FA
Go to: https://myaccount.google.com/security
- Click "2-Step Verification"
- Follow setup

### 2️⃣ Generate App Password
Go to: https://myaccount.google.com/apppasswords
- App: Mail
- Device: Other → "Ikodio Property"
- **Copy the 16-character password**

### 3️⃣ Update .env File
```bash
# Change these lines:
EMAIL_USER="your-actual-email@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"

# Also update SMTP (same values):
SMTP_USER="your-actual-email@gmail.com"
SMTP_PASSWORD="your-16-char-app-password"
```

### 4️⃣ Test Configuration
```bash
# Test email sending:
node test-email.js your-test-email@gmail.com

# Should see: ✅ SUCCESS! Email sent successfully!
```

### 5️⃣ Restart Server
```bash
# Stop server (Ctrl+C)
npm run dev

# Test registration:
# → http://localhost:3000/register-user
```

---

## ✅ Checklist

- [ ] Gmail 2FA enabled
- [ ] App Password generated (16 chars)
- [ ] .env updated with EMAIL_USER
- [ ] .env updated with EMAIL_PASSWORD
- [ ] .env updated with SMTP_USER
- [ ] .env updated with SMTP_PASSWORD
- [ ] Test script passed ✅
- [ ] Server restarted
- [ ] Email received in inbox

---

## 🆘 Still Not Working?

**Check spam folder** - First emails often go to spam

**Verify .env saved** - Make sure you saved the file

**Check terminal for errors** - Look for SMTP errors in console

**Read full guide** - See `docs/EMAIL_SETUP_GUIDE.md`

---

**Quick Links:**
- 🔐 Gmail Security: https://myaccount.google.com/security
- 🔑 App Passwords: https://myaccount.google.com/apppasswords
- 📖 Full Guide: [docs/EMAIL_SETUP_GUIDE.md](docs/EMAIL_SETUP_GUIDE.md)

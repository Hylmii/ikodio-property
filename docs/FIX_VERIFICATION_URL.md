# 🔧 FIX: DNS_PROBE_FINISHED_NXDOMAIN Error

## Problem
Saat klik link verifikasi email, muncul error:
```
This site can't be reached
Check if there is a typo in undefined.
DNS_PROBE_FINISHED_NXDOMAIN
```

## Root Cause
Environment variable `APP_URL` tidak ada di `.env`, sehingga link verifikasi jadi `undefined/verify-email?token=xxx`

## Solution Applied ✅
Added to `.env`:
```bash
APP_NAME="Ikodio Property"
APP_URL="http://localhost:3000"
```

## Next Steps

### 1️⃣ Restart Development Server
**PENTING**: Harus restart agar environment variable baru ter-load!

```bash
# Stop current server
# Press Ctrl+C in terminal where npm run dev is running

# Start again
npm run dev
```

### 2️⃣ Delete Test User
Hapus user test sebelumnya:

**Option A: Via Prisma Studio** (Already running on http://localhost:5555)
1. Open: http://localhost:5555
2. Click "User" table
3. Find user with email: `hylmir25@gmail.com`
4. Click delete icon (trash)
5. Confirm deletion

**Option B: Via SQL**
```bash
npx prisma studio
# Then delete manually in UI
```

### 3️⃣ Test Registration Again
```bash
# Go to:
http://localhost:3000/register-user

# Register with a different email (not hylmir25@gmail.com)
# Example: test@example.com
```

### 4️⃣ Check Email
- Open inbox of registered email
- Find "Verify Your Email - Ikodio Property"
- Click verification link
- Should now work correctly: `http://localhost:3000/verify-email?token=xxx`

### 5️⃣ Complete Verification
1. Click link in email
2. Should load verification page
3. Set password
4. Redirect to login
5. Login with new credentials

---

## ✅ Expected Flow

```
Register User
    ↓
Email Sent ✅
    ↓
Click Link in Email
    ↓
http://localhost:3000/verify-email?token=xxx123 ✅ (NOT undefined)
    ↓
Set Password
    ↓
Redirect to Login
    ↓
Login Success ✅
```

---

## 🐛 Troubleshooting

### Still getting "undefined" in URL?
**Solution**: Make sure you restarted the server after adding `APP_URL`

### Link still broken?
**Check**: 
```bash
# Verify APP_URL is in .env
cat .env | grep APP_URL

# Should output:
APP_URL="http://localhost:3000"
```

### Email not received?
**Solution**: 
```bash
# Test email again
node test-email.js your-email@gmail.com
```

---

## 📝 Summary

✅ Added `APP_URL` to `.env`
✅ Added `APP_NAME` to `.env`
⏳ Need to restart server
⏳ Delete old test user
⏳ Test registration again

---

**Status**: Fixed, waiting for server restart

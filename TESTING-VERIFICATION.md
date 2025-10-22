# 🧪 Testing Email Verification Flow

## ✅ Verified Users (Can Login)
1. **User**: hylmir25@gmail.com / Test123! (USER - verified ✅)
2. **Tenant**: hylmi.rabbani@binus.ac.id / Test123! (TENANT - verified ✅)

---

## 🔬 Test Users for Verification Flow

### Test #1: New Tenant Registration
**Email**: test-tenant-oct22@example.com
**Token**: 076ce7ecf03c5dd2dee116909d39460f
**Expires**: Oct 22, 2025 19:19:10 (valid for 1 hour)

🔗 **Verification URL**:
```
http://localhost:3000/verify-email?token=076ce7ecf03c5dd2dee116909d39460f&type=tenant
```

**Steps**:
1. Open URL above
2. Wait for page to load and show password form
3. Enter password (min 8 chars): `Test123!`
4. Confirm password: `Test123!`
5. Click "Verifikasi Email"
6. Should see success message
7. Redirected to login in 2 seconds
8. Login with: test-tenant-oct22@example.com / Test123!

---

### Test #2: Expired Token (Refreshed)
**Email**: awo@gmail.com
**Token**: 1135f76f85872f05d5e7d30d426aec7b
**Expires**: Oct 22, 2025 19:19:51 (valid for 1 hour)

🔗 **Verification URL**:
```
http://localhost:3000/verify-email?token=1135f76f85872f05d5e7d30d426aec7b&type=tenant
```

---

## 🐛 Debugging

### Check Browser Console
Open DevTools (F12) → Console tab to see detailed logs:
- `[CLIENT]` - Frontend logs
- `[VERIFY GET]` - API GET logs (token check)
- `[VERIFY POST]` - API POST logs (password set)

### Check Server Logs
Look at terminal where `npm run dev` is running for server-side logs.

### Common Issues

#### ❌ "Link verifikasi tidak valid"
**Possible causes**:
1. Token already used (user verified)
2. Token expired
3. Token not in database
4. Copy-paste error (incomplete token)

**Solution**:
- Check browser console for detailed error
- Run: `npx tsx debug-verify-token.ts` to see valid tokens
- Run: `npx tsx refresh-expired-tokens.ts` to refresh expired tokens

#### ❌ "Token sudah kadaluarsa"
**Solution**:
1. Use resend verification: http://localhost:3000/resend-verification
2. Or run: `npx tsx refresh-expired-tokens.ts`

#### ❌ "Email sudah diverifikasi"
**Cause**: Token was already used successfully

**Solution**: Login directly at http://localhost:3000/login-tenant or login-user

---

## 🛠️ Utility Scripts

### Get All Unverified Users with Valid Tokens
```bash
npx tsx debug-verify-token.ts
```

### Refresh Expired Tokens
```bash
npx tsx refresh-expired-tokens.ts
```

### Check User Status
```bash
npx tsx check-verified-user.ts
```

### Create New Test User
```bash
curl -X POST http://localhost:3000/api/auth/register-tenant \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "name": "Your Name",
    "phone": "081234567890"
  }'
```

---

## ✨ Enhanced Features (Just Added)

### 1. Detailed Console Logging
- Frontend: All verification steps logged with `[CLIENT]` prefix
- Backend: Token validation and password setting logged
- Helps identify exact point of failure

### 2. Better Error Messages
- "Token tidak valid" → Check if token exists
- "Token sudah kadaluarsa" → Use resend-verification
- "Email sudah diverifikasi" → User can login directly

### 3. Resend Verification Page
URL: http://localhost:3000/resend-verification
- Enter email to get new verification link
- Works for both USER and TENANT roles
- Integrated with login pages

---

## 📝 Testing Checklist

- [ ] Fresh registration creates user with valid token
- [ ] Email verification URL loads password form
- [ ] Password validation works (min 8 chars, must match)
- [ ] Submit sets password and marks user as verified
- [ ] Token cleared after successful verification
- [ ] Can login after verification
- [ ] Expired tokens show correct error
- [ ] Resend verification works
- [ ] Console logs show detailed flow
- [ ] Error messages are user-friendly


# Setup Guide - Social Login & Payment Gateway

## Social Login Setup

### 1. Google OAuth Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project atau pilih existing project
3. Navigate ke "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Pilih application type: "Web application"
6. Tambahkan Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. Copy Client ID dan Client Secret ke `.env`:
   ```
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

### 2. Facebook OAuth Setup

1. Buka [Facebook Developers](https://developers.facebook.com/)
2. Create new app atau pilih existing app
3. Add "Facebook Login" product
4. Configure OAuth Redirect URIs di Settings:
   - Development: `http://localhost:3000/api/auth/callback/facebook`
   - Production: `https://yourdomain.com/api/auth/callback/facebook`
5. Copy App ID dan App Secret ke `.env`:
   ```
   FACEBOOK_CLIENT_ID="your-app-id"
   FACEBOOK_CLIENT_SECRET="your-app-secret"
   ```

### 3. Twitter (X) OAuth Setup

1. Buka [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create new project dan app
3. Navigate ke app settings > "User authentication settings"
4. Enable "OAuth 2.0"
5. Tambahkan Callback URL:
   - Development: `http://localhost:3000/api/auth/callback/twitter`
   - Production: `https://yourdomain.com/api/auth/callback/twitter`
6. Copy Client ID dan Client Secret ke `.env`:
   ```
   TWITTER_CLIENT_ID="your-client-id"
   TWITTER_CLIENT_SECRET="your-client-secret"
   ```

## Payment Gateway Setup (Midtrans)

### 1. Create Midtrans Account

1. Buka [Midtrans](https://midtrans.com/)
2. Sign up dan complete verification
3. Pilih environment:
   - **Sandbox** untuk development/testing
   - **Production** untuk live

### 2. Get API Credentials

1. Login ke [Midtrans Dashboard](https://dashboard.midtrans.com/)
2. Navigate ke Settings > Access Keys
3. Copy credentials:
   - **Server Key**: untuk backend API calls
   - **Client Key**: untuk frontend Snap integration

### 3. Configure Environment Variables

Add to `.env`:
```bash
# Midtrans Sandbox (Development)
MIDTRANS_SERVER_KEY="your-sandbox-server-key"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-sandbox-client-key"
MIDTRANS_IS_PRODUCTION="false"

# Midtrans Production (Live)
# MIDTRANS_SERVER_KEY="your-production-server-key"
# NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="your-production-client-key"
# MIDTRANS_IS_PRODUCTION="true"
```

### 4. Setup Webhook

1. Di Midtrans Dashboard, navigate ke Settings > Configuration
2. Set **Payment Notification URL** to:
   - Development: `http://localhost:3000/api/payment/webhook`
   - Production: `https://yourdomain.com/api/payment/webhook`
3. Enable HTTP notification
4. Copy webhook signature key (optional, untuk tambahan security)

### 5. Test Payment (Sandbox)

Gunakan test cards berikut di sandbox environment:

**Credit Card - Success:**
- Card Number: `4811 1111 1111 1114`
- CVV: `123`
- Exp Date: `01/25`

**Credit Card - Failed:**
- Card Number: `4911 1111 1111 1113`
- CVV: `123`
- Exp Date: `01/25`

**Other Payment Methods:**
- BCA VA: Use any VA number, OTP: `112233`
- GoPay: Use any phone number, PIN: `123456`

### 6. Go Live Checklist

Before switching to production:

- [ ] Complete Midtrans verification (KYB - Know Your Business)
- [ ] Test all payment flows in sandbox
- [ ] Update environment variables to production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION="true"`
- [ ] Update webhook URL to production domain
- [ ] Test production payment with real transaction
- [ ] Enable email notifications for transactions
- [ ] Setup monitoring and logging

## Supported Payment Methods

Midtrans Snap supports:
- Credit/Debit Cards (Visa, Mastercard, JCB, Amex)
- Bank Transfer (BCA, BNI, BRI, Mandiri, Permata)
- E-Wallets (GoPay, ShopeePay, QRIS)
- Over-the-counter (Indomaret, Alfamart)
- Installment plans (for credit cards)

## Security Best Practices

1. **Never commit credentials** - Always use environment variables
2. **Validate signatures** - Verify webhook signatures from Midtrans
3. **Use HTTPS** - Always use secure connections in production
4. **Store order IDs** - Keep reference for transaction tracking
5. **Handle errors** - Implement proper error handling and logging
6. **Test thoroughly** - Test all payment scenarios before going live

## Troubleshooting

### Social Login Issues

**Error: "redirect_uri_mismatch"**
- Check that callback URL matches exactly with provider settings
- Include protocol (http/https) and port (3000 for dev)

**Error: "Email not verified"**
- Enable email verification bypass in provider settings (dev only)

### Payment Issues

**Snap popup not showing:**
- Check that Midtrans script is loaded
- Verify client key is correct
- Check browser console for errors

**Webhook not received:**
- Verify webhook URL is publicly accessible
- Check firewall/security group settings
- Use ngrok for local testing: `ngrok http 3000`

**Payment status not updating:**
- Check webhook is configured correctly
- Verify signature validation
- Check server logs for errors

## Support

- Midtrans Docs: https://docs.midtrans.com/
- Midtrans Support: support@midtrans.com
- OAuth Docs: https://next-auth.js.org/providers/


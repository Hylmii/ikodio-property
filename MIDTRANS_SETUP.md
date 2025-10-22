# Midtrans Payment Gateway Setup Guide

## 🎯 Overview
This guide will help you set up Midtrans payment gateway integration for the Ikodio Property booking platform.

## 📋 Prerequisites
- Email address for Midtrans account registration
- Access to your `.env` file

## 🚀 Step-by-Step Setup

### Step 1: Create Midtrans Sandbox Account

1. Go to **Midtrans Sandbox Dashboard**: https://dashboard.sandbox.midtrans.com/
2. Click **"Sign Up"** or **"Register"**
3. Fill in the registration form:
   - Email address
   - Password
   - Company/Business name (you can use "Ikodio Property" for testing)
4. Verify your email address
5. Complete the onboarding process

### Step 2: Get Your API Credentials

1. **Login to Midtrans Sandbox**: https://dashboard.sandbox.midtrans.com/
2. Go to **Settings** → **Access Keys**
3. You will see:
   - **Server Key** (starts with `SB-Mid-server-...`)
   - **Client Key** (starts with `SB-Mid-client-...`)
4. Copy both keys - you'll need them in the next step

### Step 3: Update Environment Variables

1. Open your `.env` file in the project root
2. Find the Midtrans configuration section:

```env
# Midtrans Configuration
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_SERVER_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_CLIENT_KEY"
MIDTRANS_IS_PRODUCTION="false"
MIDTRANS_MERCHANT_ID="G123456789"

# Midtrans Public Keys (for client-side)
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_CLIENT_KEY"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
```

3. Replace the placeholder values:
   - Replace `SB-Mid-server-YOUR_SERVER_KEY` with your actual **Server Key**
   - Replace `SB-Mid-client-YOUR_CLIENT_KEY` with your actual **Client Key** (do this in BOTH places)
   - Keep `MIDTRANS_IS_PRODUCTION` as `"false"` for sandbox/testing

**Example after update:**
```env
MIDTRANS_SERVER_KEY="SB-Mid-server-AbCdEfGh123456"
MIDTRANS_CLIENT_KEY="SB-Mid-client-XyZ789AbCdEf"
MIDTRANS_IS_PRODUCTION="false"
MIDTRANS_MERCHANT_ID="G123456789"

NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-XyZ789AbCdEf"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
```

### Step 4: Restart Development Server

1. Stop the current dev server (Ctrl+C in terminal)
2. Restart it:
```bash
npm run dev
```

### Step 5: Test the Payment Flow

1. Go to the property booking page
2. Select a room and create a booking
3. On the payment page, click **"Pay Now with Midtrans"**
4. You should see the Midtrans Snap payment popup
5. Use Midtrans test credentials to complete payment:

#### Test Card Numbers (Sandbox):
- **Success**: `4811 1111 1111 1114`
- **Pending**: `4911 1111 1111 1113`
- **Failed**: `4611 1111 1111 1112`

#### Test Card Details:
- **CVV**: Any 3 digits (e.g., `123`)
- **Expiry Date**: Any future date (e.g., `12/25`)
- **OTP/3D Secure**: `112233`

## 🔧 Troubleshooting

### Issue: "Midtrans credentials not configured"
**Solution**: Make sure you've updated the `.env` file with your actual Midtrans keys and restarted the dev server.

### Issue: "Payment popup doesn't appear"
**Solution**: 
1. Check browser console for errors
2. Make sure Midtrans Snap script is loaded (check Network tab)
3. Verify `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` is set correctly

### Issue: "Invalid signature" in webhook
**Solution**: Make sure your `MIDTRANS_SERVER_KEY` is correct and matches your Midtrans account.

## 📚 Webhook Configuration (Optional for Testing)

For production or if you want to test webhooks locally:

1. **Using ngrok** (for local testing):
```bash
ngrok http 3000
```

2. In Midtrans Dashboard:
   - Go to **Settings** → **Notification URL**
   - Set: `https://your-ngrok-url.ngrok.io/api/midtrans/notification`

3. For production:
   - Set: `https://your-domain.com/api/midtrans/notification`

## 🎨 Payment Methods Available in Sandbox

- Credit/Debit Cards (Visa, Mastercard, JCB, Amex)
- Bank Transfer (BCA, BNI, Mandiri, Permata)
- E-wallets (GoPay, ShopeePay, QRIS)
- Convenience Stores (Alfamart, Indomaret)

## 📖 Additional Resources

- **Midtrans Documentation**: https://docs.midtrans.com/
- **Sandbox Dashboard**: https://dashboard.sandbox.midtrans.com/
- **API Reference**: https://api-docs.midtrans.com/
- **Test Credentials**: https://docs.midtrans.com/en/technical-reference/sandbox-test

## ✅ Verification Checklist

- [ ] Midtrans sandbox account created
- [ ] Server Key and Client Key obtained
- [ ] `.env` file updated with actual keys
- [ ] Development server restarted
- [ ] Payment popup appears when clicking "Pay Now with Midtrans"
- [ ] Test payment completed successfully
- [ ] Booking status updated to WAITING_CONFIRMATION after payment

## 🚨 Important Notes

⚠️ **Never commit your `.env` file to Git!** Your API keys should remain secret.

⚠️ **Sandbox vs Production**: 
- Sandbox keys start with `SB-Mid-...`
- Production keys start with `Mid-...`
- Always use sandbox for testing!

⚠️ **For Production Deployment**:
1. Create a production Midtrans account at https://dashboard.midtrans.com/
2. Get production keys
3. Update `.env` with production keys
4. Set `MIDTRANS_IS_PRODUCTION="true"`
5. Configure production webhook URL

---

**Need help?** Check the Midtrans documentation or create an issue in the repository.

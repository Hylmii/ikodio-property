// src/app/api/payment/create-transaction/route.ts
import { NextResponse } from 'next/server';

const IS_PROD = process.env.MIDTRANS_IS_PRODUCTION === 'true';
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';

const SNAP_BASE = IS_PROD
  ? 'https://app.midtrans.com'
  : 'https://app.sandbox.midtrans.com';

export async function POST(req: Request) {
  try {
    const { bookingId, amount } = await req.json();

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });
    }
    const grossAmount = Number(amount);
    if (!Number.isFinite(grossAmount) || grossAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }
    if (!MIDTRANS_SERVER_KEY) {
      return NextResponse.json({ error: 'Server key not configured' }, { status: 500 });
    }

    // Midtrans needs a UNIQUE order_id each attempt
    const orderId = `BOOKING-${bookingId}-${Date.now()}`;

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: Math.round(grossAmount), // IDR integer
      },
      credit_card: { secure: true },
      callbacks: {
        finish: `${process.env.APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/transactions`,
      },
      // Optional: pass customer_details here if you have them
    };

    const auth = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64');

    const res = await fetch(`${SNAP_BASE}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    // Log for debugging (tail your dev logs)
    console.log('[Midtrans:create-transaction] status:', res.status, 'response:', data);

    if (!res.ok) {
      const message = data?.status_message || data?.error_messages?.[0] || 'Midtrans error';
      return NextResponse.json({ error: message, details: data }, { status: res.status });
    }

    // Expected: { token, redirect_url }
    if (!data?.token) {
      return NextResponse.json({ error: 'Midtrans did not return token', details: data }, { status: 502 });
    }

    return NextResponse.json({ token: data.token, redirect_url: data.redirect_url });
  } catch (e: any) {
    console.error('[Midtrans:create-transaction] exception', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

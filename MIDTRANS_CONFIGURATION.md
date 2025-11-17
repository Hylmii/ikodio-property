# Midtrans Configuration Guide

## Credentials (Sandbox)

```
Merchant ID: G499987981
Client Key:  Mid-client-y36n7s-KZkt***
Server Key:  Mid-server-wl6BXRQvqF***
```

## Required URLs Configuration

Isi di dashboard Midtrans: https://dashboard.sandbox.midtrans.com/settings/config_info

### 1. Payment Notification URL
```
https://property.ikodio.me/api/midtrans/notification
```
**Fungsi:** Midtrans akan mengirim notifikasi pembayaran ke endpoint ini via HTTP POST. Endpoint ini akan:
- Update status booking menjadi `CONFIRMED` jika pembayaran sukses
- Update status payment di database
- Trigger email konfirmasi booking ke customer

### 2. Recurring Notification URL
```
https://property.ikodio.me/api/midtrans/notification
```
**Fungsi:** Untuk pembayaran berulang (subscription). Bisa gunakan endpoint yang sama karena kita handle semua notification di satu endpoint.

### 3. Pay Account Notification URL
```
https://property.ikodio.me/api/midtrans/notification
```
**Fungsi:** Notifikasi status pay account. Gunakan endpoint yang sama.

### 4. Finish Redirect URL
```
https://property.ikodio.me/bookings/[booking_id]/payment?status=success
```
**Fungsi:** Customer di-redirect ke halaman ini saat pembayaran berhasil. Halaman ini akan:
- Menampilkan pesan sukses
- Menampilkan detail booking
- Button untuk download invoice/booking confirmation

**Catatan:** Ganti `[booking_id]` dengan parameter dinamis dari Midtrans. Di dashboard Midtrans, isi:
```
https://property.ikodio.me/bookings/{order_id}/payment?status=success
```

### 5. Unfinish Redirect URL
```
https://property.ikodio.me/bookings/[booking_id]/payment?status=pending
```
**Fungsi:** Customer di-redirect ke halaman ini jika klik "Back to Order Website" sebelum selesai bayar. Halaman ini akan:
- Menampilkan status pembayaran pending
- Instruksi untuk melanjutkan pembayaran
- Button untuk kembali ke payment page

**Di dashboard Midtrans, isi:**
```
https://property.ikodio.me/bookings/{order_id}/payment?status=pending
```

### 6. Error Redirect URL
```
https://property.ikodio.me/bookings/[booking_id]/payment?status=error
```
**Fungsi:** Customer di-redirect ke halaman ini jika terjadi error saat pembayaran. Halaman ini akan:
- Menampilkan pesan error
- Instruksi untuk mencoba lagi
- Button untuk retry payment atau hubungi customer service

**Di dashboard Midtrans, isi:**
```
https://property.ikodio.me/bookings/{order_id}/payment?status=error
```

## Summary - Copy Paste ke Midtrans Dashboard

```
Payment Notification URL:
https://property.ikodio.me/api/midtrans/notification

Recurring Notification URL:
https://property.ikodio.me/api/midtrans/notification

Pay Account Notification URL:
https://property.ikodio.me/api/midtrans/notification

Finish Redirect URL:
https://property.ikodio.me/bookings/{order_id}/payment?status=success

Unfinish Redirect URL:
https://property.ikodio.me/bookings/{order_id}/payment?status=pending

Error Redirect URL:
https://property.ikodio.me/bookings/{order_id}/payment?status=error
```

## Testing

Setelah konfigurasi, test dengan:

1. **Sandbox Credit Card:**
   - Card Number: `4811 1111 1111 1114`
   - CVV: `123`
   - Exp Date: `01/25` (atau bulan/tahun di masa depan)
   - OTP: `112233`

2. **Test Flow:**
   - Buat booking baru
   - Pilih kamar dan tanggal
   - Proceed ke payment
   - Akan redirect ke Midtrans payment page
   - Gunakan test card di atas
   - Setelah sukses, harus redirect ke finish URL
   - Cek status booking harus berubah jadi CONFIRMED

3. **Verify Notification:**
   - Cek log di `/api/midtrans/notification`
   - Pastikan booking status ter-update
   - Email konfirmasi terkirim

## Environment Variables

Pastikan environment variables sudah di-set di server:

```bash
MIDTRANS_SERVER_KEY="Mid-server-YOUR_KEY_HERE"
MIDTRANS_CLIENT_KEY="Mid-client-YOUR_KEY_HERE"
MIDTRANS_IS_PRODUCTION="false"
MIDTRANS_MERCHANT_ID="G499987981"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="Mid-client-YOUR_KEY_HERE"
NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="false"
```

## Production Checklist

Saat pindah ke production:

- [ ] Ganti semua "Mid-" prefix dengan production keys
- [ ] Set `MIDTRANS_IS_PRODUCTION="true"`
- [ ] Set `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION="true"`
- [ ] Update URLs di dashboard Midtrans production
- [ ] Test dengan real payment methods
- [ ] Monitor notification endpoint logs

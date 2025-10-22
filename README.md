# IkodioProperty - Property Rental Platform

Platform penyewaan properti modern yang dibangun dengan Next.js 15, TypeScript, dan Prisma ORM.

## 🚀 Fitur Lengkap - 100% Complete

### ✅ Untuk Pengguna (User)
- Autentikasi lengkap (Register, Login, Verify Email, Reset Password)
- **Social Login (Google, Facebook, Twitter/X)** 🆕
- Pencarian & filter properti (kota, sorting, pagination)
- Detail properti dengan booking system
- **Payment Gateway Integration (Midtrans)** 🆕
- Upload bukti pembayaran (manual)
- Review properti setelah check-out
- Manajemen profile dengan foto
- Riwayat transaksi dengan pencarian

### ✅ Untuk Penyewa (Tenant)
- Dashboard dengan statistik lengkap
- CRUD Kategori & Properti
- CRUD Kamar dengan pricing
- Peak Season Rates management
- Manajemen pesanan (konfirmasi/reject)
- **Review Management (View & Reply)** 🆕
- Sales Report dengan export CSV
- Property Calendar availability
- Filter dan pencarian advanced

### ✅ Automasi
- Auto-cancel order setelah 1 jam (cron job)
- Email reminder H-1 check-in (cron job)
- **Payment webhook handler (Midtrans)** 🆕
- Email notifications lengkap

## 🛠️ Tech Stack

- Next.js 15 + React 19 + TypeScript 5
- Tailwind CSS 4 + Radix UI
- Prisma ORM + PostgreSQL
- NextAuth v5 (with OAuth: Google, Facebook, Twitter)
- Midtrans Payment Gateway
- Nodemailer

## 📋 Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

The `.env` file is already configured with **Railway PostgreSQL** connection:
```env
DATABASE_URL="postgresql://postgres:tAlxENjUvGsPxgKSaBBzoaOCMNuKmxhU@nozomi.proxy.rlwy.net:43063/railway"
```

**Optional Configuration:**
- Social Login (Google, Facebook, Twitter) - See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- Payment Gateway (Midtrans) - See [SETUP_GUIDE.md](./SETUP_GUIDE.md)

For detailed setup instructions, refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md)

### 3. Setup Database Schema (First time only)
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🗄️ Database Information

- **Provider**: Railway PostgreSQL (Cloud)
- **Connection**: `nozomi.proxy.rlwy.net:43063`
- **Database**: `railway`
- **Data Persistence**: ✅ All data persisted in cloud database
- **Direct Access**: Use psql command or Railway CLI for database management

**Raw psql command:**
```bash
PGPASSWORD=tAlxENjUvGsPxgKSaBBzoaOCMNuKmxhU psql -h nozomi.proxy.rlwy.net -U postgres -p 43063 -d railway
```

**Railway CLI:**
```bash
railway connect Postgres
```

- User, Tenant, Category, Property, Room
- PeakSeasonRate, Booking, Review

## API Endpoints: 42 Total

Authentication, Properties, Bookings, Reviews, Reports, Tenant Management, Cron Jobs

Lihat dokumentasi lengkap di file ini.

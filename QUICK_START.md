# QUICK START GUIDE - Ikodio Property

## Setup Development Environment (5 menit)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` ke `.env` dan update dengan konfigurasi Anda:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Railway PostgreSQL Connection String
DATABASE_URL="postgresql://username:password@host:port/database"

# Generate dengan: openssl rand -base64 32
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Gmail Configuration (untuk development)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@ikodio-property.com"

# Optional - Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 3. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

## Testing API Endpoints

Gunakan Postman, Thunder Client, atau cURL untuk testing:

### Example: Register User
```bash
POST http://localhost:3000/api/auth/register-user
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "08123456789"
}
```

### Example: Register Tenant
```bash
POST http://localhost:3000/api/auth/register-tenant
Content-Type: application/json

{
  "email": "tenant@example.com",
  "name": "Tenant Name",
  "phone": "08123456789"
}
```

Lihat `API_DOCUMENTATION.md` untuk daftar lengkap endpoints.

## Setup Email Service (Gmail)

1. Login ke Google Account
2. Go to: https://myaccount.google.com/security
3. Enable "2-Step Verification"
4. Go to: https://myaccount.google.com/apppasswords
5. Generate App Password untuk "Mail"
6. Copy password dan paste ke `EMAIL_PASSWORD` di `.env`

## Setup Railway PostgreSQL

1. Go to: https://railway.app/
2. Create new project
3. Add PostgreSQL database
4. Click database -> Connect -> Copy `DATABASE_URL`
5. Paste ke `.env`

## Project Structure

```
src/
├── app/api/          # API Routes (Backend)
├── lib/              # Utilities & Configuration
├── components/       # React Components
├── types/            # TypeScript Types
└── middleware.ts     # Auth Middleware
```

## What's Already Built

- Database Schema (Prisma) - COMPLETE
- Authentication System - COMPLETE
- Email Service - COMPLETE
- File Upload - COMPLETE
- API: Auth (register, login, verify, reset) - COMPLETE
- API: User Profile - COMPLETE
- API: Categories CRUD - COMPLETE
- API: Properties (list, create, detail, update, delete) - COMPLETE
- API: Rooms (list, create) - PARTIAL

## What's Next

1. Complete Rooms API (detail, update, delete, availability)
2. Peak Season Rates API
3. Bookings Flow API
4. Tenant Orders Management API
5. Reviews API
6. Reports API
7. Frontend Pages
8. Background Jobs (auto-cancel, reminders)

Lihat `PROJECT_PROGRESS.md` untuk detail lengkap.

## Common Issues & Solutions

### Issue: Prisma Client not generated
```bash
npx prisma generate
```

### Issue: Database connection failed
Check `DATABASE_URL` di `.env` dan pastikan Railway database sudah running.

### Issue: Email not sending
Check email configuration di `.env`. Pastikan menggunakan App Password untuk Gmail.

### Issue: NextAuth error
Generate new `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Development Tips

1. Gunakan `npx prisma studio` untuk view & edit database
2. Check console untuk error logs
3. Test API dengan Postman sebelum build frontend
4. Follow clean code rules (max 200 lines/file, max 15 lines/function)

## Documentation Files

- `README.md` - Project overview & setup
- `API_DOCUMENTATION.md` - Complete API documentation
- `PROJECT_PROGRESS.md` - Development progress tracking
- `QUICK_START.md` - This file

## Need Help?

1. Check error logs di terminal
2. Check `API_DOCUMENTATION.md` untuk API usage
3. Check `PROJECT_PROGRESS.md` untuk progress tracking
4. Review code yang sudah ada untuk pattern reference

---

Happy Coding!

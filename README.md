# IkodioProperty - Property Rental Platform

Modern property rental platform built with Next.js 15, TypeScript, and Prisma ORM.

## Features

### User Features
- Complete authentication system (Register, Login, Email Verification, Password Reset)
- Social login integration (Google, Facebook, Twitter/X)
- Property search and filtering (by city, with sorting and pagination)
- Property details with booking system
- Midtrans payment gateway integration
- Manual payment proof upload
- Property reviews after checkout
- Profile management with photo upload
- Transaction history with search functionality

### Tenant Features
- Dashboard with comprehensive statistics
- Category and property management
- Room management with dynamic pricing
- Peak season rate configuration
- Booking management (confirm/reject)
- Review management (view and reply)
- Sales reports with CSV export
- Property availability calendar
- Advanced filtering and search

### Automation
- Auto-cancel unpaid bookings after 1 hour
- Check-in reminder emails (H-1)
- Midtrans payment webhook handler
- Comprehensive email notifications

## Tech Stack

- Next.js 15 + React 19 + TypeScript 5
- Tailwind CSS 4 + Radix UI
- Prisma ORM + PostgreSQL
- NextAuth v5 (OAuth: Google, Facebook, Twitter)
- Midtrans Payment Gateway
- Nodemailer

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables

Configure your `.env` file with the PostgreSQL connection:
```env
DATABASE_URL="postgresql://postgres:password@host:port/database"
```

For social login and payment gateway setup, refer to `SETUP_GUIDE.md`.

### 3. Setup Database Schema
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Application will run at `http://localhost:3000`

## Database Schema

Main entities: User, Tenant, Category, Property, Room, PeakSeasonRate, Booking, Review

## API Documentation

See `API_DOCUMENTATION.md` for complete endpoint reference.

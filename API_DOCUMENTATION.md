# API Documentation - Ikodio Property

## Base URL
Development: `http://localhost:3000/api`
Production: `https://your-domain.com/api`

## Authentication
Menggunakan NextAuth v5 dengan session-based authentication.

Headers untuk authenticated requests:
```
Cookie: next-auth.session-token=xxx
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## API Endpoints

### Authentication

#### POST /api/auth/register-user
Register new user

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "08123456789" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registrasi berhasil. Silakan cek email Anda untuk verifikasi.",
  "data": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST /api/auth/register-tenant
Register new tenant

**Request Body:**
```json
{
  "email": "tenant@example.com",
  "name": "Tenant Name",
  "phone": "08123456789" // required for tenant
}
```

#### GET /api/auth/verify-email?token=xxx
Check verification token

**Query Params:**
- `token`: Verification token from email

#### POST /api/auth/verify-email
Verify email and set password

**Request Body:**
```json
{
  "token": "verification-token",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

#### POST /api/auth/resend-verification
Resend verification email

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password-request
Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Reset password with token

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

### User Profile

#### GET /api/user/profile
Get current user profile

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "08123456789",
    "profileImage": "/uploads/profile/xxx.jpg",
    "role": "USER",
    "provider": "EMAIL",
    "isVerified": true,
    "createdAt": "2025-10-20T00:00:00.000Z"
  }
}
```

#### PUT /api/user/profile
Update user profile

**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "08987654321",
  "email": "newemail@example.com" // optional, will require re-verification
}
```

#### PUT /api/user/password
Update password

**Auth Required:** Yes

**Request Body:**
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewPass123",
  "confirmPassword": "NewPass123"
}
```

### File Upload

#### POST /api/upload
Upload image file

**Auth Required:** Yes

**Request:** FormData
```
file: File (jpg, jpeg, png, gif, max 1MB)
type: string ('profile' | 'property' | 'room' | 'payment')
```

**Response:**
```json
{
  "success": true,
  "message": "File berhasil diupload",
  "data": {
    "url": "/uploads/profile/123-image.jpg",
    "filename": "123-image.jpg"
  }
}
```

### Categories

#### GET /api/categories
List categories with pagination

**Query Params:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (search by name)
- `sortBy`: string (default: 'createdAt')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "Villa",
      "description": "Luxury villas",
      "tenantId": "cuid",
      "tenant": {
        "id": "cuid",
        "name": "Tenant Name",
        "email": "tenant@example.com"
      },
      "_count": {
        "properties": 5
      },
      "createdAt": "2025-10-20T00:00:00.000Z",
      "updatedAt": "2025-10-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "totalPages": 2
  }
}
```

#### POST /api/categories
Create category (Tenant only)

**Auth Required:** Yes (Tenant role)

**Request Body:**
```json
{
  "name": "Villa",
  "description": "Luxury villas" // optional
}
```

#### GET /api/categories/[id]
Get category detail

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "cuid",
    "name": "Villa",
    "description": "Luxury villas",
    "tenantId": "cuid",
    "tenant": {
      "id": "cuid",
      "name": "Tenant Name",
      "email": "tenant@example.com"
    },
    "_count": {
      "properties": 5
    },
    "createdAt": "2025-10-20T00:00:00.000Z",
    "updatedAt": "2025-10-20T00:00:00.000Z"
  }
}
```

#### PUT /api/categories/[id]
Update category (Tenant only, own categories)

**Auth Required:** Yes (Tenant role)

**Request Body:**
```json
{
  "name": "Updated Villa",
  "description": "Updated description"
}
```

#### DELETE /api/categories/[id]
Delete category (Tenant only, own categories)

**Auth Required:** Yes (Tenant role)

**Note:** Cannot delete if category has properties

### Properties

#### GET /api/properties
List properties with pagination and filters

**Query Params:**
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string (search by name)
- `city`: string (filter by city)
- `categoryId`: string (filter by category)
- `tenantId`: string (filter by tenant)
- `sortBy`: string (default: 'createdAt')
- `sortOrder`: 'asc' | 'desc' (default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cuid",
      "name": "Beautiful Villa Bali",
      "description": "Amazing villa with pool",
      "address": "Jl. Sunset Road No. 123",
      "city": "Bali",
      "province": "Bali",
      "latitude": -8.123456,
      "longitude": 115.123456,
      "images": ["/uploads/property/1.jpg", "/uploads/property/2.jpg"],
      "categoryId": "cuid",
      "category": {
        "id": "cuid",
        "name": "Villa"
      },
      "tenantId": "cuid",
      "tenant": {
        "id": "cuid",
        "name": "Tenant Name",
        "email": "tenant@example.com"
      },
      "rooms": [
        {
          "id": "cuid",
          "name": "Deluxe Room",
          "basePrice": 500000,
          "capacity": 2
        }
      ],
      "_count": {
        "reviews": 10
      },
      "createdAt": "2025-10-20T00:00:00.000Z",
      "updatedAt": "2025-10-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### POST /api/properties
Create property (Tenant only)

**Auth Required:** Yes (Tenant role)

**Request Body:**
```json
{
  "name": "Beautiful Villa Bali",
  "description": "Amazing villa with pool and ocean view",
  "address": "Jl. Sunset Road No. 123",
  "city": "Bali",
  "province": "Bali",
  "categoryId": "cuid",
  "latitude": -8.123456, // optional
  "longitude": 115.123456, // optional
  "images": ["/uploads/property/1.jpg", "/uploads/property/2.jpg"]
}
```

#### GET /api/properties/[id]
Get property detail with rooms and reviews

#### PUT /api/properties/[id]
Update property (Tenant only, own properties)

#### DELETE /api/properties/[id]
Delete property (Tenant only, own properties)

### Rooms

#### GET /api/rooms?propertyId=xxx
List rooms by property

#### POST /api/rooms
Create room (Tenant only)

**Request Body:**
```json
{
  "name": "Deluxe Room",
  "description": "Spacious room with king bed",
  "basePrice": 500000,
  "capacity": 2,
  "propertyId": "cuid",
  "images": ["/uploads/room/1.jpg"]
}
```

#### GET /api/rooms/[id]
Get room detail

#### PUT /api/rooms/[id]
Update room (Tenant only, own rooms)

#### DELETE /api/rooms/[id]
Delete room (Tenant only, own rooms)

#### GET /api/rooms/[id]/availability?checkIn=xxx&checkOut=xxx
Check room availability and calculate price

### Peak Season Rates

#### GET /api/peak-season-rates?roomId=xxx
List peak season rates for a room

#### POST /api/peak-season-rates
Create peak season rate (Tenant only)

**Request Body:**
```json
{
  "roomId": "cuid",
  "startDate": "2025-12-20T00:00:00.000Z",
  "endDate": "2026-01-05T00:00:00.000Z",
  "priceType": "PERCENTAGE", // 'FIXED' or 'PERCENTAGE'
  "priceValue": 50, // 50% increase or fixed price
  "reason": "Christmas & New Year Holiday"
}
```

#### PUT /api/peak-season-rates/[id]
Update peak season rate (Tenant only, own rates)

#### DELETE /api/peak-season-rates/[id]
Delete peak season rate (Tenant only, own rates)

### Bookings (User)

#### POST /api/bookings
Create booking

**Auth Required:** Yes (User role)

**Request Body:**
```json
{
  "roomId": "cuid",
  "checkInDate": "2025-12-25T00:00:00.000Z",
  "checkOutDate": "2025-12-28T00:00:00.000Z",
  "numberOfGuests": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking berhasil dibuat",
  "data": {
    "id": "cuid",
    "bookingNumber": "BK-XXX-YYY",
    "status": "WAITING_PAYMENT",
    "totalPrice": 1500000,
    "paymentDeadline": "2025-10-20T01:00:00.000Z" // 1 hour from now
  }
}
```

#### GET /api/bookings
List user bookings

**Auth Required:** Yes (User role)

**Query Params:**
- `page`: number
- `limit`: number
- `status`: OrderStatus
- `search`: string (search by booking number)

#### GET /api/bookings/[id]
Get booking detail

#### PUT /api/bookings/[id]/payment
Upload payment proof

**Request:** FormData
```
file: File (payment proof image)
```

#### PUT /api/bookings/[id]/cancel
Cancel booking (before payment upload only)

### Tenant Orders

#### GET /api/tenant/orders
List tenant orders

**Auth Required:** Yes (Tenant role)

**Query Params:**
- `page`: number
- `limit`: number
- `status`: OrderStatus
- `propertyId`: string

#### GET /api/tenant/orders/[id]
Get order detail

#### PUT /api/tenant/orders/[id]/confirm
Confirm payment

#### PUT /api/tenant/orders/[id]/reject
Reject payment

**Request Body:**
```json
{
  "reason": "Bukti pembayaran tidak valid"
}
```

#### PUT /api/tenant/orders/[id]/cancel
Cancel order (before payment upload only)

### Reviews

#### POST /api/reviews
Create review (after checkout)

**Auth Required:** Yes (User role)

**Request Body:**
```json
{
  "bookingId": "cuid",
  "rating": 5,
  "comment": "Great property and excellent service!"
}
```

#### GET /api/reviews?propertyId=xxx
List reviews for a property

**Query Params:**
- `propertyId`: string (required)
- `page`: number
- `limit`: number

#### POST /api/reviews/[id]/reply
Reply to review (Tenant only)

**Auth Required:** Yes (Tenant role)

**Request Body:**
```json
{
  "comment": "Thank you for your review!"
}
```

### Reports (Tenant)

#### GET /api/reports/sales
Sales report

**Auth Required:** Yes (Tenant role)

**Query Params:**
- `startDate`: string (ISO date, required)
- `endDate`: string (ISO date, required)
- `propertyId`: string (optional)
- `groupBy`: 'property' | 'transaction' | 'user'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "propertyName": "Villa Bali",
      "totalBookings": 25,
      "totalRevenue": 50000000,
      "period": "2025-10"
    }
  ]
}
```

#### GET /api/reports/properties
Property availability calendar

**Auth Required:** Yes (Tenant role)

**Query Params:**
- `propertyId`: string (required)
- `month`: string (YYYY-MM, required)

**Response:**
```json
{
  "success": true,
  "data": {
    "propertyId": "cuid",
    "propertyName": "Villa Bali",
    "rooms": [
      {
        "roomId": "cuid",
        "roomName": "Deluxe Room",
        "availability": {
          "2025-10-20": {
            "available": false,
            "bookingNumber": "BK-XXX-YYY",
            "price": 500000
          },
          "2025-10-21": {
            "available": true,
            "price": 500000
          }
        }
      }
    ]
  }
}
```

## Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

TBD - Implement rate limiting untuk production

## Webhooks

TBD - Untuk integrasi payment gateway

---

Last Updated: October 20, 2025

import { UserRole, AuthProvider, OrderStatus, CancellationReason } from '@prisma/client';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  profileImage?: string | null;
  role: UserRole;
  provider: AuthProvider;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  latitude?: number | null;
  longitude?: number | null;
  images: string[];
  categoryId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
  propertyId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  roomId: string;
  tenantId: string;
  checkInDate: Date;
  checkOutDate: Date;
  duration: number;
  numberOfGuests: number;
  totalPrice: number;
  status: OrderStatus;
  paymentProof?: string | null;
  paymentUploadedAt?: Date | null;
  paymentDeadline: Date;
  confirmedAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: CancellationReason | null;
  confirmationEmailSent: boolean;
  reminderEmailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  propertyId: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PropertySearchParams {
  city?: string;
  checkInDate?: string;
  checkOutDate?: string;
  numberOfGuests?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface SalesReportParams {
  propertyId?: string;
  startDate: string;
  endDate: string;
  groupBy?: 'property' | 'transaction' | 'user';
}

export interface SalesReportData {
  propertyName?: string;
  totalBookings: number;
  totalRevenue: number;
  period: string;
}

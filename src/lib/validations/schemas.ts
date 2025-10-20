import { z } from 'zod';

export const registerUserSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  phone: z.string().optional(),
});

export const registerTenantSchema = z.object({
  email: z.string().email('Email tidak valid'),
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit'),
  businessName: z.string().min(3, 'Nama bisnis minimal 3 karakter').max(200, 'Nama bisnis maksimal 200 karakter').optional(),
});

export const setPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token tidak valid'),
  password: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter').max(100, 'Nama maksimal 100 karakter'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').optional(),
  email: z.string().email('Email tidak valid').optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: z.string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung minimal 1 huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung minimal 1 huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung minimal 1 angka'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export const categorySchema = z.object({
  name: z.string().min(3, 'Nama kategori minimal 3 karakter').max(100, 'Nama kategori maksimal 100 karakter'),
  description: z.string().max(500, 'Deskripsi maksimal 500 karakter').optional(),
});

export const propertySchema = z.object({
  name: z.string().min(3, 'Nama properti minimal 3 karakter').max(200, 'Nama properti maksimal 200 karakter'),
  description: z.string().min(50, 'Deskripsi minimal 50 karakter'),
  address: z.string().min(10, 'Alamat minimal 10 karakter'),
  city: z.string().min(2, 'Kota wajib diisi'),
  province: z.string().min(2, 'Provinsi wajib diisi'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const roomSchema = z.object({
  name: z.string().min(3, 'Nama kamar minimal 3 karakter').max(100, 'Nama kamar maksimal 100 karakter'),
  description: z.string().min(20, 'Deskripsi minimal 20 karakter'),
  basePrice: z.number().min(10000, 'Harga minimal Rp 10.000'),
  capacity: z.number().min(1, 'Kapasitas minimal 1 orang').max(20, 'Kapasitas maksimal 20 orang'),
  propertyId: z.string().min(1, 'Property ID wajib diisi'),
});

export const peakSeasonRateSchema = z.object({
  roomId: z.string().min(1, 'Room ID wajib diisi'),
  startDate: z.date({
    required_error: 'Tanggal mulai wajib diisi',
  }),
  endDate: z.date({
    required_error: 'Tanggal selesai wajib diisi',
  }),
  priceType: z.enum(['FIXED', 'PERCENTAGE'], {
    required_error: 'Tipe harga wajib dipilih',
  }),
  priceValue: z.number().min(0, 'Nilai harga tidak boleh negatif'),
  reason: z.string().max(200, 'Alasan maksimal 200 karakter').optional(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'Tanggal selesai harus sama atau setelah tanggal mulai',
  path: ['endDate'],
});

export const bookingSchema = z.object({
  roomId: z.string().min(1, 'Room ID wajib diisi'),
  checkInDate: z.date({
    required_error: 'Tanggal check-in wajib diisi',
  }),
  checkOutDate: z.date({
    required_error: 'Tanggal check-out wajib diisi',
  }),
  numberOfGuests: z.number().min(1, 'Jumlah tamu minimal 1 orang'),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Tanggal check-out harus setelah tanggal check-in',
  path: ['checkOutDate'],
}).refine((data) => data.checkInDate >= new Date(), {
  message: 'Tanggal check-in tidak boleh di masa lalu',
  path: ['checkInDate'],
});

export const reviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID wajib diisi'),
  rating: z.number().min(1, 'Rating minimal 1').max(5, 'Rating maksimal 5'),
  comment: z.string().min(10, 'Komentar minimal 10 karakter').max(1000, 'Komentar maksimal 1000 karakter'),
});

export const reviewReplySchema = z.object({
  reviewId: z.string().min(1, 'Review ID wajib diisi'),
  comment: z.string().min(10, 'Komentar minimal 10 karakter').max(1000, 'Komentar maksimal 1000 karakter'),
});

export const imageUploadSchema = z.object({
  file: z.custom<File>((file) => {
    if (!(file instanceof File)) return false;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) return false;
    
    const maxSize = 1048576; // 1MB
    if (file.size > maxSize) return false;
    
    return true;
  }, {
    message: 'File harus berupa gambar (jpg, jpeg, png, gif) dengan ukuran maksimal 1MB',
  }),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type RegisterTenantInput = z.infer<typeof registerTenantSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type RoomInput = z.infer<typeof roomSchema>;
export type PeakSeasonRateInput = z.infer<typeof peakSeasonRateSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;

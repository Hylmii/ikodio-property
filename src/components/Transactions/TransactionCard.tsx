'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, CreditCard, Upload, X, Star, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { PaymentDialog } from '@/components/Payment/PaymentDialog';

interface Booking {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentProof: string | null;
  paymentDeadline: string | null;
  room: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      city: string;
      images: string[];
    };
  };
}

interface TransactionCardProps {
  booking: Booking;
  uploadingId: string | null;
  onPaymentUpload: (bookingId: string, file: File) => void;
  onCancel: (bookingId: string) => void;
  onReview: (booking: Booking) => void;
}

export function TransactionCard({
  booking,
  uploadingId,
  onPaymentUpload,
  onCancel,
  onReview,
}: TransactionCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      WAITING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800' },
      WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', className: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Selesai', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const isPaymentExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const getRemainingTime = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}j ${minutes}m`;
  };

  const canCancelBooking = () => {
    // Cannot cancel if already confirmed, completed, or cancelled
    if (['CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(booking.status)) {
      return false;
    }
    
    // Cannot cancel if payment deadline has expired
    if (booking.paymentDeadline && isPaymentExpired(booking.paymentDeadline)) {
      return false;
    }
    
    return true;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={booking.room.property.images[0] || '/placeholder.jpg'}
                alt={booking.room.property.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <CardTitle className="text-lg mb-1">
                {booking.room.property.name}
              </CardTitle>
              <CardDescription className="space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3" />
                  {booking.room.property.city}
                </div>
                <div className="text-sm font-medium">
                  {booking.room.name}
                </div>
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              Check-in
            </div>
            <div className="font-medium">{formatDate(booking.checkInDate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              Check-out
            </div>
            <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <Users className="h-3 w-3" />
              Tamu
            </div>
            <div className="font-medium">{booking.guestCount} orang</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <CreditCard className="h-3 w-3" />
              Total
            </div>
            <div className="font-medium text-primary">
              {formatPrice(booking.totalPrice)}
            </div>
          </div>
        </div>

        {booking.status === 'WAITING_PAYMENT' && booking.paymentDeadline && (
          <div className={`p-3 rounded-lg ${
            isPaymentExpired(booking.paymentDeadline)
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
            <p className={`text-sm ${
              isPaymentExpired(booking.paymentDeadline)
                ? 'text-red-800 dark:text-red-200'
                : 'text-yellow-800 dark:text-yellow-200'
            }`}>
              Batas waktu pembayaran: {getRemainingTime(booking.paymentDeadline)}
            </p>
          </div>
        )}

        {booking.paymentProof && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            Bukti pembayaran telah diupload
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {booking.status === 'WAITING_PAYMENT' && !booking.paymentProof && !isPaymentExpired(booking.paymentDeadline || '') && (
          <>
            <Button onClick={() => setIsPaymentDialogOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Bayar Sekarang
            </Button>
          </>
        )}

        {canCancelBooking() && (
          <Button variant="outline" onClick={() => onCancel(booking.id)}>
            <X className="mr-2 h-4 w-4" />
            Batalkan
          </Button>
        )}

        {booking.status === 'COMPLETED' && (
          <Button onClick={() => onReview(booking)}>
            <Star className="mr-2 h-4 w-4" />
            Beri Review
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link href={`/properties/${booking.room.property.id}`}>
            Lihat Detail Properti
          </Link>
        </Button>
      </CardFooter>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        bookingId={booking.id}
        amount={booking.totalPrice}
        onPaymentSuccess={() => {
          setIsPaymentDialogOpen(false);
          window.location.reload();
        }}
        onManualUpload={(file) => onPaymentUpload(booking.id, file)}
        isUploading={uploadingId === booking.id}
      />
    </Card>
  );
}

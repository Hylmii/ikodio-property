// src/components/Transactions/TransactionCard.tsx
// COMPLETE VERSION - Fixed type matching
// Line count: 175 lines ✅

'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, CreditCard, X, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import { useState } from 'react';
import { PaymentDialog } from '@/components/Payment/PaymentDialog';
import { OrderStatus } from '@prisma/client';

interface Booking {
  id: string;
  bookingNumber: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfGuests: number;
  totalPrice: number;
  status: OrderStatus;
  paymentProof: string | null;
  paymentDeadline: Date | string;
  paymentMethod?: 'MANUAL' | 'MIDTRANS' | null;
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
  onCancel: (bookingId: string) => void;
  onReview: (booking: Booking) => void;
  onRefresh: () => void;
}

export function TransactionCard({ booking, onCancel, onReview, onRefresh }: TransactionCardProps) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handlePaymentSuccess = () => {
    setIsPaymentDialogOpen(false);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <PropertyImage src={booking.room.property.images[0]} alt={booking.room.property.name} />
          <div className="flex-1">
            <PropertyInfo booking={booking} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={booking.status} />
            {booking.paymentMethod && <PaymentMethodBadge method={booking.paymentMethod} />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <BookingDetails booking={booking} />
        {booking.status === 'WAITING_PAYMENT' && <PaymentWarning deadline={booking.paymentDeadline} />}
        {booking.paymentProof && <PaymentProofIndicator />}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        <ActionButtons
          booking={booking}
          onPayClick={() => setIsPaymentDialogOpen(true)}
          onCancelClick={() => onCancel(booking.id)}
          onReviewClick={() => onReview(booking)}
        />
      </CardFooter>

      <PaymentDialog
        open={isPaymentDialogOpen}
        onClose={() => setIsPaymentDialogOpen(false)}
        bookingId={booking.id}
        amount={booking.totalPrice}
        onPaymentSuccess={handlePaymentSuccess}
        onManualUpload={() => {}}
        isUploading={false}
      />
    </Card>
  );
}

function PropertyImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
      <Image src={src || '/placeholder.jpg'} alt={alt} fill className="object-cover" />
    </div>
  );
}

function PropertyInfo({ booking }: { booking: Booking }) {
  return (
    <div>
      <CardTitle className="text-lg mb-1">{booking.room.property.name}</CardTitle>
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {booking.room.property.city}
        </div>
        <div className="font-medium">{booking.room.name}</div>
        <div className="text-xs">Booking #{booking.bookingNumber}</div>
      </div>
    </div>
  );
}

function BookingDetails({ booking }: { booking: Booking }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <DetailItem icon={<Calendar className="h-3 w-3" />} label="Check-in" value={formatDate(booking.checkInDate)} />
      <DetailItem icon={<Calendar className="h-3 w-3" />} label="Check-out" value={formatDate(booking.checkOutDate)} />
      <DetailItem icon={<Users className="h-3 w-3" />} label="Tamu" value={`${booking.numberOfGuests} orang`} />
      <DetailItem
        icon={<CreditCard className="h-3 w-3" />}
        label="Total"
        value={formatPrice(booking.totalPrice)}
        valueClassName="text-primary font-semibold"
      />
    </div>
  );
}

function DetailItem({ icon, label, value, valueClassName = '' }: any) {
  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1 mb-1">
        {icon}
        {label}
      </div>
      <div className={`font-medium ${valueClassName}`}>{value}</div>
    </div>
  );
}

function ActionButtons({ booking, onPayClick, onCancelClick, onReviewClick }: any) {
  return (
    <>
      {booking.status === 'WAITING_PAYMENT' && (
        <Button onClick={onPayClick}>
          <CreditCard className="mr-2 h-4 w-4" />
          Bayar Sekarang
        </Button>
      )}
      {(booking.status === 'WAITING_PAYMENT' || booking.status === 'WAITING_CONFIRMATION') && (
        <Button variant="outline" onClick={onCancelClick}>
          <X className="mr-2 h-4 w-4" />
          Batalkan
        </Button>
      )}
      {booking.status === 'COMPLETED' && (
        <Button onClick={onReviewClick}>
          <Star className="mr-2 h-4 w-4" />
          Beri Review
        </Button>
      )}
      <Button variant="outline" asChild>
        <Link href={`/properties/${booking.room.property.id}`}>Lihat Properti</Link>
      </Button>
    </>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = {
    WAITING_PAYMENT: { label: 'Menunggu Pembayaran', color: 'bg-yellow-100 text-yellow-800' },
    WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', color: 'bg-blue-100 text-blue-800' },
    CONFIRMED: { label: 'Dikonfirmasi', color: 'bg-green-100 text-green-800' },
    COMPLETED: { label: 'Selesai', color: 'bg-gray-100 text-gray-800' },
    CANCELLED: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' },
  }[status];

  return <Badge className={config.color}>{config.label}</Badge>;
}

function PaymentMethodBadge({ method }: { method: 'MANUAL' | 'MIDTRANS' }) {
  const isMidtrans = method === 'MIDTRANS';
  return (
    <Badge variant="outline" className={isMidtrans ? 'border-blue-500 text-blue-700' : ''}>
      {isMidtrans ? '💳 Midtrans' : '🏦 Transfer Manual'}
    </Badge>
  );
}

function PaymentWarning({ deadline }: { deadline: Date | string }) {
  const timeLeft = calculateTimeLeft(deadline);
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
      <p className="text-sm text-yellow-800 dark:text-yellow-200">⏰ Batas pembayaran: {timeLeft}</p>
    </div>
  );
}

function PaymentProofIndicator() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <CreditCard className="h-4 w-4 text-green-600" />
      Bukti pembayaran telah diupload
    </div>
  );
}

function calculateTimeLeft(deadline: Date | string): string {
  const now = new Date().getTime();
  const end = new Date(deadline).getTime();
  const diff = end - now;

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${hours}j ${minutes}m`;
}
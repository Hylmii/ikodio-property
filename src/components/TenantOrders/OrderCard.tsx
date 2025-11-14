'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import Image from 'next/image';

interface Order {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentProof: string | null;
  paymentDeadline?: string | null;
  user: { id: string; name: string; email: string; phone: string };
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

interface OrderCardProps {
  order: Order;
  onConfirm: (order: Order) => void;
  onReject: (order: Order) => void;
}

export function OrderCard({ order, onConfirm, onReject }: OrderCardProps) {
  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      WAITING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800' },
      WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', className: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Selesai', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
    };

    const badge = config[status] || config.WAITING_PAYMENT;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={order.room.property.images?.[0] || '/placeholder.jpg'}
                alt={order.room.property.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <CardTitle className="text-lg mb-1">{order.room.property.name}</CardTitle>
              <div className="space-y-1 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {order.room.property.city}
                </div>
                <div className="font-medium">{order.room.name}</div>
              </div>
            </div>
          </div>
          {getStatusBadge(order.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <User className="h-3 w-3" />
              Tamu
            </div>
            <div className="font-medium">{order.user.name}</div>
            <div className="text-xs text-slate-500">{order.user.email}</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              Check-in
            </div>
            <div className="font-medium">{formatDate(order.checkInDate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <Calendar className="h-3 w-3" />
              Check-out
            </div>
            <div className="font-medium">{formatDate(order.checkOutDate)}</div>
          </div>
          <div>
            <div className="text-muted-foreground flex items-center gap-1 mb-1">
              <CreditCard className="h-3 w-3" />
              Total
            </div>
            <div className="font-medium text-primary">{formatPrice(order.totalPrice)}</div>
          </div>
        </div>

        {order.paymentProof && (
          <div className="flex items-center gap-2 text-sm">
            <a
              href={order.paymentProof}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Lihat Bukti Pembayaran
            </a>
          </div>
        )}

        {order.status === 'WAITING_CONFIRMATION' && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => onConfirm(order)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Konfirmasi Pembayaran
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReject(order)}>
              <XCircle className="mr-2 h-4 w-4" />
              Tolak
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

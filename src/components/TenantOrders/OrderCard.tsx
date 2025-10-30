'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, User, CreditCard, CheckCircle, XCircle, X, Image as ImageIcon } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import Image from 'next/image';
import { OrderStatus } from '@prisma/client';

interface Order {
  id: string;
  bookingNumber: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  numberOfGuests: number;
  totalPrice: number;
  status: OrderStatus;
  paymentProof: string | null;
  paymentMethod?: 'MANUAL' | 'MIDTRANS' | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
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
  onCancel?: (order: Order) => void;
}

export function OrderCard({ order, onConfirm, onReject, onCancel }: OrderCardProps) {
  const propertyImage = order.room?.property?.images?.[0];
  const hasImage = propertyImage && propertyImage.length > 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          <PropertyImage 
            src={hasImage ? propertyImage : null} 
            alt={order.room.property.name} 
          />
          
          <div className="flex-1">
            <PropertyInfo order={order} />
          </div>

          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={order.status} />
            {order.paymentMethod && <PaymentMethodBadge method={order.paymentMethod} />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <OrderDetails order={order} />
        
        {order.paymentProof && <PaymentProofSection proof={order.paymentProof} />}

        <ActionButtons
          order={order}
          onConfirm={onConfirm}
          onReject={onReject}
          onCancel={onCancel}
        />
      </CardContent>
    </Card>
  );
}

// Helper Components (all under 15 lines)

function PropertyImage({ src, alt }: { src: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
        <ImageIcon className="h-8 w-8 text-slate-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
      <Image 
        src={src} 
        alt={alt} 
        fill 
        className="object-cover"
        unoptimized={src.startsWith('http')}
      />
    </div>
  );
}

function PropertyInfo({ order }: { order: Order }) {
  return (
    <div>
      <CardTitle className="text-lg mb-1">{order.room.property.name}</CardTitle>
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {order.room.property.city}
        </div>
        <div className="font-medium">{order.room.name}</div>
        <div className="text-xs">Booking #{order.bookingNumber}</div>
      </div>
    </div>
  );
}

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <DetailItem
        icon={<User className="h-3 w-3" />}
        label="Tamu"
        value={order.user.name}
        subValue={order.user.email}
      />
      <DetailItem
        icon={<Calendar className="h-3 w-3" />}
        label="Check-in"
        value={formatDate(order.checkInDate)}
      />
      <DetailItem
        icon={<Calendar className="h-3 w-3" />}
        label="Check-out"
        value={formatDate(order.checkOutDate)}
      />
      <DetailItem
        icon={<CreditCard className="h-3 w-3" />}
        label={`${order.numberOfGuests} tamu`}
        value={formatPrice(order.totalPrice)}
        valueClassName="text-primary font-semibold"
      />
    </div>
  );
}

function DetailItem({ icon, label, value, subValue, valueClassName = '' }: any) {
  return (
    <div>
      <div className="text-muted-foreground flex items-center gap-1 mb-1">
        {icon}
        {label}
      </div>
      <div className={`font-medium ${valueClassName}`}>{value}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );
}

function PaymentProofSection({ proof }: { proof: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
      <ImageIcon className="h-5 w-5 text-blue-600" />
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          Bukti Pembayaran Telah Diupload
        </p>
      </div>
      <Button size="sm" variant="outline" asChild>
        <a href={proof} target="_blank" rel="noopener noreferrer">
          Lihat Bukti
        </a>
      </Button>
    </div>
  );
}

function ActionButtons({ order, onConfirm, onReject, onCancel }: any) {
  return (
    <div className="flex flex-wrap gap-2">
      {order.status === 'WAITING_CONFIRMATION' && (
        <>
          <Button size="sm" onClick={() => onConfirm(order)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Konfirmasi
          </Button>
          <Button size="sm" variant="outline" onClick={() => onReject(order)}>
            <XCircle className="mr-2 h-4 w-4" />
            Tolak
          </Button>
        </>
      )}
      
      {onCancel && (order.status === 'WAITING_PAYMENT' || order.status === 'WAITING_CONFIRMATION' || order.status === 'CONFIRMED') && (
        <Button size="sm" variant="destructive" onClick={() => onCancel(order)}>
          <X className="mr-2 h-4 w-4" />
          Batalkan Pesanan
        </Button>
      )}
    </div>
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
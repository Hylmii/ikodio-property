import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Booking } from '@/types';

interface BookingSummaryProps {
  booking: Booking;
}

export function BookingSummary({ booking }: BookingSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Detail Booking</CardTitle>
            <CardDescription>#{booking.bookingNumber}</CardDescription>
          </div>
          <Badge variant={booking.status === 'WAITING_CONFIRMATION' ? 'secondary' : 'default'}>
            {booking.status.replace(/_/g, ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Check In</p>
            <p className="font-medium">{new Date(booking.checkInDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Check Out</p>
            <p className="font-medium">{new Date(booking.checkOutDate).toLocaleDateString('id-ID')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Durasi</p>
            <p className="font-medium">{booking.duration} malam</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tamu</p>
            <p className="font-medium">{booking.numberOfGuests} orang</p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total Pembayaran</span>
          <span>
            {new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
            }).format(booking.totalPrice)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Booking } from '@/types';

interface PaymentActionsProps {
  booking: Booking;
  isExpired: boolean;
  onPayClick: () => void;
  onBackClick: () => void;
}

export function PaymentActions({ booking, isExpired, onPayClick, onBackClick }: PaymentActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {booking.status === 'WAITING_PAYMENT' && (
          <Button 
            onClick={onPayClick} 
            className="w-full"
            size="lg"
            disabled={isExpired}
          >
            Bayar Sekarang
          </Button>
        )}

        {booking.status === 'WAITING_CONFIRMATION' && booking.paymentProof && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Bukti Pembayaran:</p>
            <img 
              src={booking.paymentProof} 
              alt="Payment Proof" 
              className="w-full rounded-lg border"
            />
            <Button 
              onClick={onPayClick} 
              variant="outline"
              className="w-full"
            >
              Ganti Bukti Pembayaran
            </Button>
          </div>
        )}

        <Button 
          onClick={onBackClick} 
          variant="ghost"
          className="w-full"
        >
          Kembali ke Transaksi
        </Button>
      </CardContent>
    </Card>
  );
}
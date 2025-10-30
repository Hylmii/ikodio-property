import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle } from 'lucide-react';

interface PaymentDeadlineWarningProps {
  timeLeft: string;
}

export function PaymentDeadlineWarning({ timeLeft }: PaymentDeadlineWarningProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900">Selesaikan Pembayaran</h3>
            <p className="text-sm text-orange-700 mt-1">
              Booking akan otomatis dibatalkan dalam: <span className="font-mono font-bold">{timeLeft}</span>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PaymentConfirmationStatus() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">Bukti Pembayaran Diterima</h3>
            <p className="text-sm text-blue-700 mt-1">
              Menunggu konfirmasi dari tenant. Anda akan menerima email setelah pembayaran dikonfirmasi.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
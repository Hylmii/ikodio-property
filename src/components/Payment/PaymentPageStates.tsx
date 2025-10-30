import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertCircle, Home } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="container mx-auto py-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

export function NotFoundState() {
  return (
    <div className="container mx-auto py-8 text-center">
      <p>Booking tidak ditemukan</p>
    </div>
  );
}

interface SuccessStateProps {
  onViewTransactions: () => void;
}

export function SuccessState({ onViewTransactions }: SuccessStateProps) {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold">Pembayaran Berhasil!</h2>
            <p className="text-muted-foreground">
              Booking Anda telah dikonfirmasi. Cek email untuk detail lebih lanjut.
            </p>
            <Button onClick={onViewTransactions}>
              <Home className="mr-2 h-4 w-4" />
              Lihat Semua Transaksi
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ExpiredStateProps {
  onSearchProperties: () => void;
}

export function ExpiredState({ onSearchProperties }: ExpiredStateProps) {
  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="text-2xl font-bold">Booking Dibatalkan</h2>
            <p className="text-muted-foreground">
              Booking ini telah melewati batas waktu pembayaran atau dibatalkan.
            </p>
            <Button onClick={onSearchProperties}>
              Cari Properti Lain
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
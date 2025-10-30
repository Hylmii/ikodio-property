'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentGatewayProps {
  bookingId: string;
  amount: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    snap?: any;
  }
}

export function PaymentGateway({ bookingId, amount, onSuccess, onError }: PaymentGatewayProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);

  useEffect(() => {
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    if (!clientKey) {
      setScriptError('Midtrans client key tidak dikonfigurasi');
      return;
    }
    if (window.snap) {
      setIsScriptLoaded(true);
      return;
    }
    loadScript(clientKey);
  }, []);

  const loadScript = (clientKey: string) => {
    if (document.querySelector('script[data-client-key]')) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => setScriptError('Gagal memuat payment gateway');
    document.body.appendChild(script);
  };

  const handlePayment = async () => {
    if (!isScriptLoaded || !window.snap) {
      toast({
        title: 'Error',
        description: 'Payment gateway belum siap',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal membuat transaksi');

      const token = result.token || result.data?.token;
      if (!token) throw new Error('Token tidak ditemukan');

      openPayment(token);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      if (onError) onError(error.message);
      setIsLoading(false);
    }
  };

  const openPayment = (token: string) => {
    window.snap.pay(token, {
      onSuccess: () => {
        toast({ title: 'Pembayaran Berhasil!', description: 'Transaksi berhasil diproses' });
        if (onSuccess) onSuccess();
      },
      onPending: () => {
        toast({ title: 'Pembayaran Pending', description: 'Menunggu konfirmasi' });
        if (onSuccess) onSuccess();
      },
      onError: (result: any) => {
        toast({
          title: 'Pembayaran Gagal',
          description: result?.status_message || 'Silakan coba lagi',
          variant: 'destructive',
        });
        if (onError) onError(result?.status_message || 'Payment failed');
        setIsLoading(false);
      },
      onClose: () => {
        toast({ title: 'Pembayaran Dibatalkan' });
        setIsLoading(false);
      },
    });
  };

  if (scriptError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            Error Payment Gateway
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 mb-4">{scriptError}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Refresh Halaman
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pembayaran Online
        </CardTitle>
        <CardDescription>
          Bayar dengan kartu kredit, transfer bank, e-wallet, atau QRIS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <span className="text-sm text-muted-foreground">Total Pembayaran</span>
            <span className="text-xl font-bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
              }).format(amount)}
            </span>
          </div>

          <Button
            onClick={handlePayment}
            disabled={isLoading || !isScriptLoaded}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : !isScriptLoaded ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memuat...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Bayar Sekarang
              </>
            )}
          </Button>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Pembayaran aman dengan Midtrans</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Mendukung: BCA, Mandiri, BRI, BNI, Gopay, OVO, QRIS
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
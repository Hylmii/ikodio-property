'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2, CheckCircle2 } from 'lucide-react';
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

  useEffect(() => {
    // Load Midtrans Snap script
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      toast({
        title: 'Error',
        description: 'Gagal memuat payment gateway',
        variant: 'destructive',
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!isScriptLoaded) {
      toast({
        title: 'Payment Gateway Belum Siap',
        description: 'Mohon tunggu sebentar...',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create payment token from backend
      const response = await fetch('/api/payment/create-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat transaksi');
      }

      // Open Midtrans Snap popup
      window.snap.pay(data.token, {
        onSuccess: function (result: any) {
          toast({
            title: 'Pembayaran Berhasil',
            description: 'Transaksi Anda telah berhasil diproses',
          });
          if (onSuccess) onSuccess();
        },
        onPending: function (result: any) {
          toast({
            title: 'Pembayaran Pending',
            description: 'Menunggu pembayaran Anda',
          });
        },
        onError: function (result: any) {
          toast({
            title: 'Pembayaran Gagal',
            description: 'Terjadi kesalahan saat memproses pembayaran',
            variant: 'destructive',
          });
          if (onError) onError('Payment failed');
        },
        onClose: function () {
          setIsLoading(false);
        },
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Pembayaran Online
        </CardTitle>
        <CardDescription>
          Bayar dengan kartu kredit, transfer bank, atau e-wallet
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
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Bayar Sekarang
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Pembayaran aman dengan Midtrans</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

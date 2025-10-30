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
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
    
    if (!clientKey) {
      showError('Midtrans client key tidak ditemukan');
      return;
    }

    if (window.snap) {
      setIsScriptLoaded(true);
      return;
    }

    loadSnapScript(clientKey);
  }, []);

  const loadSnapScript = (clientKey: string) => {
    const script = document.createElement('script');
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      showError('Gagal memuat payment gateway');
      if (onError) onError('Script load failed');
    };
    
    document.body.appendChild(script);
  };

  const showError = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const handlePayment = async () => {
    if (!isScriptLoaded || !window.snap) {
      showError('Mohon tunggu atau refresh halaman');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat transaksi');
      }

      // FIXED: Handle token at root or in data object
      const token = result.token || result.data?.token;
      
      if (!token) {
        throw new Error('Token pembayaran tidak ditemukan');
      }

      openSnapPopup(token);
    } catch (error: any) {
      showError(error.message);
      if (onError) onError(error.message);
      setIsLoading(false);
    }
  };

  const openSnapPopup = (token: string) => {
    window.snap.pay(token, {
      onSuccess: () => {
        toast({
          title: 'Pembayaran Berhasil!',
          description: 'Transaksi berhasil diproses',
        });
        if (onSuccess) onSuccess();
      },
      onPending: () => {
        toast({
          title: 'Pembayaran Pending',
          description: 'Menunggu konfirmasi pembayaran',
        });
        if (onSuccess) onSuccess();
      },
      onError: (result: any) => {
        showError(result?.status_message || 'Pembayaran gagal');
        if (onError) onError(result?.status_message || 'Payment failed');
        setIsLoading(false);
      },
      onClose: () => {
        toast({
          title: 'Pembayaran Dibatalkan',
          description: 'Anda menutup jendela pembayaran',
        });
        setIsLoading(false);
      },
    });
  };

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
                Memuat Payment Gateway...
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
              Mendukung berbagai metode: BCA, Mandiri, BRI, BNI, Gopay, OVO, QRIS
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
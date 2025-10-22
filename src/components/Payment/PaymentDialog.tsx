'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentGateway } from '@/components/Payment/PaymentGateway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface PaymentDialogProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  amount: number;
  onPaymentSuccess: () => void;
  onManualUpload: (file: File) => void;
  isUploading: boolean;
}

export function PaymentDialog({
  open,
  onClose,
  bookingId,
  amount,
  onPaymentSuccess,
  onManualUpload,
  isUploading,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
          <DialogDescription>
            Pilih cara pembayaran yang Anda inginkan
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="gateway" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gateway">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment Gateway
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Upload className="mr-2 h-4 w-4" />
              Upload Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gateway" className="space-y-4 mt-4">
            <PaymentGateway
              bookingId={bookingId}
              amount={amount}
              onSuccess={() => {
                onPaymentSuccess();
                onClose();
              }}
              onError={(error) => {
                console.error('Payment error:', error);
              }}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">Transfer ke rekening:</p>
              <p className="text-xs text-muted-foreground">Bank BCA</p>
              <p className="text-sm font-mono">1234567890</p>
              <p className="text-xs text-muted-foreground">a.n. Ikodio Property</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment-proof">Upload Bukti Transfer</Label>
              <Input
                id="payment-proof"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onManualUpload(file);
                    onClose();
                  }
                }}
                disabled={isUploading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

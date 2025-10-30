'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaymentGateway } from '@/components/Payment/PaymentGateway';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validateFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      toast({ title: 'File Tidak Valid', description: 'Hanya JPG/PNG', variant: 'destructive' });
      return false;
    }
    if (file.size > 1024 * 1024) {
      toast({ title: 'File Terlalu Besar', description: 'Max 1MB', variant: 'destructive' });
      return false;
    }
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onManualUpload(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  const formatRupiah = (value: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[95vh] overflow-y-auto bg-white">
        <div className="bg-gradient-to-r from-blue-50 to-white p-4 -mt-6 -mx-6 mb-4 border-b">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-blue-600" />
              Pilih Metode Pembayaran
            </DialogTitle>
            <DialogDescription>Pilih cara pembayaran yang Anda inginkan</DialogDescription>
          </DialogHeader>
        </div>

        <Tabs defaultValue="gateway" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 mb-4">
            <TabsTrigger value="gateway" className="data-[state=active]:bg-white">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment Gateway
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-white">
              <Upload className="mr-2 h-4 w-4" />
              Transfer Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gateway" className="space-y-4">
            <PaymentGateway
              bookingId={bookingId}
              amount={amount}
              onSuccess={() => {
                onPaymentSuccess();
                handleClose();
              }}
              onError={() => {}}
            />
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900">Instruksi Transfer</p>
                  <p className="text-blue-700">Transfer sesuai nominal, lalu upload bukti</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-700">Bank BCA</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Nomor Rekening</p>
                <p className="text-xl font-mono font-bold bg-white px-3 py-2 rounded border">1234567890</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Atas Nama</p>
                <p className="font-semibold">Ikodio Property</p>
              </div>
              <div className="pt-3 border-t bg-green-50 -mx-4 -mb-4 px-4 pb-4">
                <p className="text-xs text-green-600 uppercase">Jumlah Transfer</p>
                <p className="text-xl font-bold text-green-700">{formatRupiah(amount)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="payment-proof" className="font-semibold">Upload Bukti Transfer</Label>
                <p className="text-xs text-gray-500 mb-2">Format: JPG/PNG • Max 1MB</p>
                <Input
                  id="payment-proof"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="border-2 border-dashed cursor-pointer"
                />
              </div>

              {previewUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <img src={previewUrl} alt="Preview" className="w-full max-h-32 object-contain border rounded" />
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-pulse" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Bukti Pembayaran
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface Order {
  id: string;
  bookingNumber: string;
  user: { name: string };
  room: { property: { name: string } };
}

interface CancelDialogProps {
  open: boolean;
  order: Order | null;
  cancelReason: string;
  isProcessing: boolean;
  onClose: () => void;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
}

export function CancelDialog({
  open,
  order,
  cancelReason,
  isProcessing,
  onClose,
  onReasonChange,
  onCancel,
}: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Batalkan Pesanan</DialogTitle>
          <DialogDescription>
            Pesanan akan dibatalkan dan tamu akan menerima email notifikasi
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-4 py-4">
            <div className="space-y-2 text-sm">
              <p><strong>Tamu:</strong> {order.user.name}</p>
              <p><strong>Properti:</strong> {order.room.property.name}</p>
              <p><strong>Booking:</strong> #{order.bookingNumber}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancelReason">Alasan Pembatalan *</Label>
              <Textarea
                id="cancelReason"
                placeholder="Contoh: Properti sedang dalam perbaikan"
                value={cancelReason}
                onChange={(e) => onReasonChange(e.target.value)}
                rows={4}
                required
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={onCancel}
            disabled={isProcessing || !cancelReason.trim()}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Batalkan Pesanan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
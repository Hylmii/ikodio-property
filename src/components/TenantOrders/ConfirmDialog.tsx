'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Order {
  id: string;
  user: { name: string };
  room: { property: { name: string } };
}

interface ConfirmDialogProps {
  open: boolean;
  order: Order | null;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  order,
  isProcessing,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription>
            Anda yakin ingin mengkonfirmasi pembayaran untuk pesanan ini?
          </DialogDescription>
        </DialogHeader>
        {order && (
          <div className="space-y-2 py-4">
            <p className="text-sm">
              <span className="font-semibold">Tamu:</span> {order.user.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Properti:</span> {order.room.property.name}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Konfirmasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

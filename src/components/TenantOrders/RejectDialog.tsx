'use client';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface RejectDialogProps {
  open: boolean;
  rejectReason: string;
  isProcessing: boolean;
  onClose: () => void;
  onReasonChange: (value: string) => void;
  onReject: () => void;
}

export function RejectDialog({
  open,
  rejectReason,
  isProcessing,
  onClose,
  onReasonChange,
  onReject,
}: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tolak Pembayaran</DialogTitle>
          <DialogDescription>
            Berikan alasan penolakan kepada tamu
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Alasan Penolakan</Label>
            <Textarea
              id="reason"
              placeholder="Contoh: Bukti pembayaran tidak jelas"
              value={rejectReason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={4}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button variant="destructive" onClick={onReject} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Tolak Pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

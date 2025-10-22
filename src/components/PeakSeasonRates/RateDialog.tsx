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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
}

interface RateDialogProps {
  open: boolean;
  isEdit: boolean;
  selectedRoomId: string;
  startDate: string;
  endDate: string;
  rate: string;
  rooms: Room[];
  isProcessing: boolean;
  onClose: () => void;
  onRoomChange: (roomId: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onRateChange: (rate: string) => void;
  onSubmit: () => void;
}

export function RateDialog({
  open,
  isEdit,
  selectedRoomId,
  startDate,
  endDate,
  rate,
  rooms,
  isProcessing,
  onClose,
  onRoomChange,
  onStartDateChange,
  onEndDateChange,
  onRateChange,
  onSubmit,
}: RateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Tarif Peak Season' : 'Tambah Tarif Peak Season'}
          </DialogTitle>
          <DialogDescription>
            Atur tarif khusus untuk periode peak season
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room">Kamar</Label>
            <Select value={selectedRoomId} onValueChange={onRoomChange}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kamar" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={room.id}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Tanggal Mulai</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Selesai</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate">Tarif (Rp)</Label>
            <Input
              id="rate"
              type="number"
              placeholder="0"
              value={rate}
              onChange={(e) => onRateChange(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update' : 'Tambah'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

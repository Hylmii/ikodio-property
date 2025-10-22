'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

interface RoomDialogProps {
  open: boolean;
  room: Partial<Room> | null;
  onClose: () => void;
  onSave: (room: Partial<Room>) => void;
  onChange: (field: string, value: string | number) => void;
}

export function RoomDialog({ open, room, onClose, onSave, onChange }: RoomDialogProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (room) {
      onSave(room);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white dark:bg-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">
            {room?.id ? 'Edit Room' : 'Add New Room'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">
              Room Name
            </Label>
            <Input
              id="name"
              value={room?.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={room?.description || ''}
              onChange={(e) => onChange('description', e.target.value)}
              rows={3}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="capacity" className="text-slate-700 dark:text-slate-300">
              Capacity (Guests)
            </Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={room?.capacity || ''}
              onChange={(e) => onChange('capacity', parseInt(e.target.value))}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="basePrice" className="text-slate-700 dark:text-slate-300">
              Base Price per Night
            </Label>
            <Input
              id="basePrice"
              type="number"
              min="0"
              step="0.01"
              value={room?.basePrice || ''}
              onChange={(e) => onChange('basePrice', parseFloat(e.target.value))}
              className="bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white">
              {room?.id ? 'Update Room' : 'Add Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

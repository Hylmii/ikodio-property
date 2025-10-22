'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface Booking {
  id: string;
  room: {
    property: {
      id: string;
      name: string;
    };
  };
}

interface ReviewDialogProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onSubmit: (bookingId: string, propertyId: string, rating: number, comment: string) => void;
}

export function ReviewDialog({ open, booking, onClose, onSubmit }: ReviewDialogProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (booking) {
      onSubmit(booking.id, booking.room.property.id, rating, comment);
      setRating(5);
      setComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Beri Review</DialogTitle>
          <DialogDescription>
            {booking && `Bagaimana pengalaman Anda menginap di ${booking.room.property.name}?`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">Ulasan</Label>
            <Textarea
              id="comment"
              placeholder="Tulis ulasan Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Kirim Review</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

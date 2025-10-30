'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (!booking || !comment.trim()) return;
    onSubmit(booking.id, booking.room.property.id, rating, comment);
    resetForm();
  };

  const resetForm = () => {
    setRating(5);
    setComment('');
    setHoveredRating(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Beri Review untuk {booking.room.property.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {rating} dari 5 bintang
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Komentar</Label>
            <Textarea
              id="comment"
              placeholder="Ceritakan pengalaman Anda..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!comment.trim()}>
            Kirim Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
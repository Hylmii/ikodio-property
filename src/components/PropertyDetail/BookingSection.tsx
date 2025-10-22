import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface BookingSectionProps {
  isOpen: boolean;
  onClose: () => void;
  room: any;
  bookingDates: { checkIn: string; checkOut: string };
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  isCheckingAvailability: boolean;
  availabilityMessage: string | null;
  priceBreakdown: any;
  onCheckAvailability: () => void;
  onConfirmBooking: () => void;
  isBooking: boolean;
}

export function BookingSection({
  isOpen,
  onClose,
  room,
  bookingDates,
  onDatesChange,
  guestCount,
  onGuestCountChange,
  isCheckingAvailability,
  availabilityMessage,
  priceBreakdown,
  onCheckAvailability,
  onConfirmBooking,
  isBooking,
}: BookingSectionProps) {
  if (!room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book {room.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="checkIn">Check-in Date</Label>
            <Input
              id="checkIn"
              type="date"
              value={bookingDates.checkIn}
              onChange={(e) =>
                onDatesChange({ ...bookingDates, checkIn: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="checkOut">Check-out Date</Label>
            <Input
              id="checkOut"
              type="date"
              value={bookingDates.checkOut}
              onChange={(e) =>
                onDatesChange({ ...bookingDates, checkOut: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="guests">Number of Guests</Label>
            <Input
              id="guests"
              type="number"
              min="1"
              value={guestCount}
              onChange={(e) => onGuestCountChange(Number(e.target.value))}
            />
          </div>

          <Button
            onClick={onCheckAvailability}
            disabled={isCheckingAvailability}
            className="w-full"
          >
            {isCheckingAvailability ? 'Checking...' : 'Check Availability'}
          </Button>

          {availabilityMessage && (
            <p className="text-sm text-center">{availabilityMessage}</p>
          )}

          {priceBreakdown && (
            <div className="p-4 bg-slate-100 rounded-lg space-y-2">
              <p>
                <strong>Nights:</strong> {priceBreakdown.nights}
              </p>
              <p>
                <strong>Total:</strong> ${priceBreakdown.total}
              </p>
              <Button
                onClick={onConfirmBooking}
                disabled={isBooking}
                className="w-full mt-4"
              >
                {isBooking ? 'Booking...' : 'Confirm Booking'}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

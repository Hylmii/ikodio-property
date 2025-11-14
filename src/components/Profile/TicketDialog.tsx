'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, CreditCard, FileText, Star } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import Link from 'next/link';

interface Booking {
  id: string;
  bookingNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  status: string;
  review?: {
    id: string;
  } | null;
  room: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      city: string;
      address: string;
      images: string[];
    };
  };
}

interface TicketDialogProps {
  open: boolean;
  onClose: () => void;
  booking: Booking | null;
}

export function TicketDialog({ open, onClose, booking }: TicketDialogProps) {
  if (!booking) return null;

  const checkOutDate = new Date(booking.checkOutDate);
  const today = new Date();
  const canReview = checkOutDate < today && !booking.review;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">E-Ticket Booking</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header with QR/Barcode simulation */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium mb-2">Booking Number</div>
              <div className="text-3xl font-bold tracking-wider mb-4">
                {booking.bookingNumber}
              </div>
              <div className="bg-white text-gray-900 px-4 py-2 rounded inline-block">
                <div className="font-mono text-xs">
                  ████ ██ ████ ██ ████
                </div>
              </div>
            </div>
          </div>

          {/* Property Image & Details */}
          <div className="space-y-4">
            <div className="relative w-full h-48 rounded-lg overflow-hidden">
              <Image
                src={booking.room.property.images?.[0] || '/placeholder.jpg'}
                alt={booking.room.property.name}
                fill
                className="object-cover"
              />
            </div>

            <div>
              <h3 className="text-xl font-bold mb-1">{booking.room.property.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                {booking.room.property.city}
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {booking.room.property.address}
              </p>
              <div className="text-sm">
                <span className="font-medium">Room:</span> {booking.room.name}
              </div>
            </div>
          </div>

          {/* Booking Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Check-in</div>
                <div className="font-semibold">{formatDate(booking.checkInDate)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Check-out</div>
                <div className="font-semibold">{formatDate(booking.checkOutDate)}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Guests</div>
                <div className="font-semibold">{booking.numberOfGuests} orang</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <div className="text-xs text-muted-foreground">Total Payment</div>
                <div className="font-semibold text-primary">{formatPrice(booking.totalPrice)}</div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-semibold text-green-800">Booking Confirmed</span>
            </div>
            <span className="text-sm text-green-700">Ready to Check-in</span>
          </div>

          {/* Important Notes */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <div className="font-semibold mb-1">Important Information:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Please show this e-ticket at check-in</li>
                  <li>Bring valid ID card/passport</li>
                  <li>Check-in time: 14:00 | Check-out time: 12:00</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {canReview ? (
              <Button asChild className="flex-1">
                <Link href={`/reviews/write?bookingId=${booking.id}`}>
                  <Star className="mr-2 h-4 w-4" />
                  Tulis Review
                </Link>
              </Button>
            ) : booking.review ? (
              <Button variant="outline" disabled className="flex-1">
                <Star className="mr-2 h-4 w-4" />
                Review Sudah Diberikan
              </Button>
            ) : null}
            
            <Button variant="outline" onClick={onClose} className="flex-1">
              Tutup
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

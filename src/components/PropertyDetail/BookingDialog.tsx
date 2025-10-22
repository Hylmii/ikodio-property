'use client';

import { Loader2, Calendar, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/helpers';

interface Room {
  id: string;
  name: string;
  basePrice: number;
}

interface PriceBreakdown {
  basePrice: number;
  nights: number;
  subtotal: number;
  peakSeasonAdjustment: number;
  peakSeasonPercentage: number;
  total: number;
}

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  bookingDates: { checkIn: string; checkOut: string };
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  guestCount: number;
  onGuestCountChange: (count: number) => void;
  isCheckingAvailability: boolean;
  availabilityMessage: string | null;
  priceBreakdown: PriceBreakdown | null;
  onConfirmBooking: () => void;
  isBooking: boolean;
  onCheckAvailability: () => void;
}

export function BookingDialog({
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
  onConfirmBooking,
  isBooking,
  onCheckAvailability,
}: BookingDialogProps) {
  if (!room) return null;

  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white p-0 gap-0">
        {/* Header dengan gradient */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold flex items-center gap-3">
              <Calendar className="h-8 w-8" />
              Book {room.name}
            </DialogTitle>
            <p className="text-slate-300 mt-2">Complete the details below to reserve your stay</p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Room Info Card */}
          <Card className="border-2 border-slate-200 bg-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{room.name}</h3>
                  <p className="text-sm text-slate-600">Base price per night</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">{formatPrice(room.basePrice)}</div>
                  <p className="text-xs text-slate-500">per night</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <div className="space-y-5">
            <h3 className="font-bold text-xl text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Your Dates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-checkin" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Check-in Date
                </Label>
                <Input
                  id="booking-checkin"
                  type="date"
                  value={bookingDates.checkIn}
                  min={today}
                  onChange={(e) => onDatesChange({ ...bookingDates, checkIn: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 focus:border-slate-900 bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="booking-checkout" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Check-out Date
                </Label>
                <Input
                  id="booking-checkout"
                  type="date"
                  value={bookingDates.checkOut}
                  min={bookingDates.checkIn || tomorrow}
                  onChange={(e) => onDatesChange({ ...bookingDates, checkOut: e.target.value })}
                  className="h-12 text-base border-2 border-slate-300 focus:border-slate-900 bg-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guest-count" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Guests
              </Label>
              <Input
                id="guest-count"
                type="number"
                min="1"
                value={guestCount}
                onChange={(e) => onGuestCountChange(parseInt(e.target.value) || 1)}
                className="h-12 text-base border-2 border-slate-300 focus:border-slate-900 bg-white"
              />
            </div>

            <Button
              onClick={onCheckAvailability}
              disabled={!bookingDates.checkIn || !bookingDates.checkOut || isCheckingAvailability}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {isCheckingAvailability ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Checking Availability...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-5 w-5" />
                  Check Availability & Calculate Price
                </>
              )}
            </Button>
          </div>

          {/* Availability Message */}
          {availabilityMessage && (
            <Card className={`border-2 ${availabilityMessage.includes('✅') ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <CardContent className="py-4">
                <p className={`text-center font-bold text-lg ${availabilityMessage.includes('✅') ? 'text-green-700' : 'text-red-700'}`}>
                  {availabilityMessage}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Price Breakdown */}
          {priceBreakdown && (
            <Card className="border-2 border-slate-300 bg-gradient-to-br from-white to-slate-50 shadow-xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-2xl text-slate-900 flex items-center gap-2 border-b-2 border-slate-200 pb-3">
                  💰 Price Breakdown
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-slate-700 py-2">
                    <span className="text-base">
                      {formatPrice(priceBreakdown.basePrice)} × {priceBreakdown.nights} {priceBreakdown.nights > 1 ? 'nights' : 'night'}
                    </span>
                    <span className="font-semibold text-lg">{formatPrice(priceBreakdown.subtotal)}</span>
                  </div>
                  
                  {priceBreakdown.peakSeasonAdjustment > 0 && (
                    <div className="flex justify-between items-center text-orange-600 font-medium py-2 bg-orange-50 px-3 rounded-lg border border-orange-200">
                      <span className="flex items-center gap-2">
                        <span className="text-xl">🔥</span>
                        Peak Season Surcharge (+{priceBreakdown.peakSeasonPercentage}%)
                      </span>
                      <span className="font-bold text-lg">+{formatPrice(priceBreakdown.peakSeasonAdjustment)}</span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t-2 border-slate-300 flex justify-between items-center">
                    <span className="font-bold text-2xl text-slate-900">Total Price</span>
                    <span className="font-bold text-3xl text-slate-900">{formatPrice(priceBreakdown.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Confirm Booking Button */}
          {priceBreakdown && (
            <Button
              onClick={onConfirmBooking}
              disabled={isBooking}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white h-16 text-xl font-bold shadow-xl hover:shadow-2xl transition-all"
            >
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Processing Your Booking...
                </>
              ) : (
                <>
                  ✓ Confirm Booking - {formatPrice(priceBreakdown.total)}
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

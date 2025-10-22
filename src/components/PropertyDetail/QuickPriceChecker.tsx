'use client';

import { Loader2, DollarSign, Check, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice, formatDate } from '@/lib/utils/helpers';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
}

interface PriceCheckerResult {
  price: number;
  available: boolean;
}

interface QuickPriceCheckerProps {
  rooms: Room[];
  dates: { checkIn: string; checkOut: string };
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  results: Record<string, PriceCheckerResult>;
  isLoading: boolean;
  onCheck: () => void;
  onBookRoom: (room: Room, price: number) => void;
}

export function QuickPriceChecker({
  rooms,
  dates,
  onDatesChange,
  results,
  isLoading,
  onCheck,
  onBookRoom,
}: QuickPriceCheckerProps) {
  const hasResults = Object.keys(results).length > 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative z-10">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <DollarSign className="h-8 w-8" />
          Quick Price Checker
        </CardTitle>
        <CardDescription className="text-slate-300">Check prices for all rooms instantly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priceCheckIn" className="text-white font-medium">Check-in Date</Label>
            <Input
              id="priceCheckIn"
              type="date"
              value={dates.checkIn}
              onChange={(e) => onDatesChange({ ...dates, checkIn: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="bg-white text-slate-900 h-11 text-base border-2 border-slate-300"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priceCheckOut" className="text-white font-medium">Check-out Date</Label>
            <Input
              id="priceCheckOut"
              type="date"
              value={dates.checkOut}
              onChange={(e) => onDatesChange({ ...dates, checkOut: e.target.value })}
              min={dates.checkIn || new Date().toISOString().split('T')[0]}
              className="bg-white text-slate-900 h-11 text-base border-2 border-slate-300"
              required
            />
          </div>
        </div>

        <Button
          onClick={onCheck}
          disabled={isLoading || !dates.checkIn || !dates.checkOut}
          className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-bold text-base"
        >
          {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isLoading ? 'Checking Prices...' : 'Check All Room Prices'}
        </Button>

        {hasResults && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between text-sm text-slate-300 mb-4">
              <span>
                Results for {dates.checkIn && formatDate(new Date(dates.checkIn))} - {dates.checkOut && formatDate(new Date(dates.checkOut))}
              </span>
            </div>
            {rooms.map((room) => {
              const result = results[room.id];
              if (!result) return null;

              return (
                <div key={room.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg mb-1">{room.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Users className="h-4 w-4" />
                        <span>{room.capacity} guests</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {result.available ? (
                        <>
                          <div className="text-3xl font-bold text-white">
                            {formatPrice(result.price)}
                          </div>
                          <div className="text-xs text-green-300 flex items-center gap-1 justify-end mt-1">
                            <Check className="h-3 w-3" />
                            Available
                          </div>
                          <Button
                            onClick={() => onBookRoom(room, result.price)}
                            size="sm"
                            className="mt-2 bg-white text-slate-900 hover:bg-slate-100"
                          >
                            Book Now
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-red-300">
                          <X className="h-5 w-5" />
                          <span className="font-medium">Not Available</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { Check, X, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/lib/utils/helpers';

interface Room {
  id: string;
  name: string;
  basePrice: number;
  capacity: number;
}

interface ComparePriceResult {
  roomId: string;
  available: boolean;
  price: number;
}

interface CompareFeatureProps {
  selectedRooms: Room[];
  compareDates: { checkIn: string; checkOut: string };
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  onCompare: () => void;
  isComparing: boolean;
  compareResults: ComparePriceResult[];
  showCompareModal: boolean;
  onCloseModal: () => void;
  onBookRoom: (roomId: string) => void;
}

export function CompareFeature({
  selectedRooms,
  compareDates,
  onDatesChange,
  onCompare,
  isComparing,
  compareResults,
  showCompareModal,
  onCloseModal,
  onBookRoom,
}: CompareFeatureProps) {
  if (selectedRooms.length === 0) return null;

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Compare Rooms</CardTitle>
          <CardDescription className="text-slate-300">
            {selectedRooms.length} room(s) selected for comparison
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="compare-checkin" className="text-white">
                Check-in
              </Label>
              <Input
                id="compare-checkin"
                type="date"
                value={compareDates.checkIn}
                onChange={(e) =>
                  onDatesChange({ ...compareDates, checkIn: e.target.value })
                }
                className="bg-white text-slate-900"
              />
            </div>
            <div>
              <Label htmlFor="compare-checkout" className="text-white">
                Check-out
              </Label>
              <Input
                id="compare-checkout"
                type="date"
                value={compareDates.checkOut}
                onChange={(e) =>
                  onDatesChange({ ...compareDates, checkOut: e.target.value })
                }
                className="bg-white text-slate-900"
              />
            </div>
          </div>
          <Button
            onClick={onCompare}
            disabled={!compareDates.checkIn || !compareDates.checkOut || isComparing}
            className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
          >
            {isComparing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Comparing...
              </>
            ) : (
              'Compare Prices'
            )}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showCompareModal} onOpenChange={onCloseModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Room Comparison</DialogTitle>
          </DialogHeader>
          <ComparisonTable
            rooms={selectedRooms}
            results={compareResults}
            dates={compareDates}
            onBook={onBookRoom}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function ComparisonTable({ rooms, results, dates, onBook }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {rooms.map((room: Room) => {
        const result = results.find((r: ComparePriceResult) => r.roomId === room.id);
        return (
          <Card key={room.id} className="border-2">
            <CardHeader>
              <CardTitle className="text-lg">{room.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">{room.capacity} guests</span>
                </div>
                <div className="text-sm text-slate-600 mb-4">
                  {dates.checkIn} → {dates.checkOut}
                </div>
              </div>
              {result ? (
                <>
                  <div className="text-center py-4">
                    {result.available ? (
                      <>
                        <Check className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p className="text-sm text-green-600 mb-2">Available</p>
                        <p className="text-3xl font-bold text-slate-900">
                          {formatPrice(result.price)}
                        </p>
                      </>
                    ) : (
                      <>
                        <X className="h-8 w-8 mx-auto mb-2 text-red-600" />
                        <p className="text-sm text-red-600">Not Available</p>
                      </>
                    )}
                  </div>
                  {result.available && (
                    <Button
                      onClick={() => onBook(room.id)}
                      className="w-full bg-slate-900 hover:bg-slate-800"
                    >
                      Book Now
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-center text-slate-500 py-4">No data</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

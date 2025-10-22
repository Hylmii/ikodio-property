'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Users } from 'lucide-react';

interface RoomAvailabilityFilterProps {
  dates: { checkIn: string; checkOut: string };
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  isFilterActive: boolean;
  isLoading: boolean;
  onApply: () => void;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export function RoomAvailabilityFilter({
  dates,
  onDatesChange,
  isFilterActive,
  isLoading,
  onApply,
  onReset,
  filteredCount,
  totalCount,
}: RoomAvailabilityFilterProps) {
  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Filter Rooms by Availability</CardTitle>
        <CardDescription className="text-slate-600">Show only available rooms for your dates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="filterCheckIn" className="text-sm font-medium text-slate-700">Check-in</Label>
              <Input
                id="filterCheckIn"
                type="date"
                value={dates.checkIn}
                onChange={(e) => onDatesChange({ ...dates, checkIn: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="filterCheckOut" className="text-sm font-medium text-slate-700">Check-out</Label>
              <Input
                id="filterCheckOut"
                type="date"
                value={dates.checkOut}
                onChange={(e) => onDatesChange({ ...dates, checkOut: e.target.value })}
                min={dates.checkIn || new Date().toISOString().split('T')[0]}
                className="h-11"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={onApply}
              disabled={isLoading || !dates.checkIn || !dates.checkOut}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply Filter
            </Button>
            {isFilterActive && (
              <Button
                onClick={onReset}
                variant="outline"
                className="border-slate-300"
              >
                Reset
              </Button>
            )}
          </div>
          {isFilterActive && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <strong>Showing {filteredCount} of {totalCount} rooms</strong> available for your selected dates
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

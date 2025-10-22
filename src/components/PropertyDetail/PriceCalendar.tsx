'use client';

import { useState } from 'react';
import { Loader2, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice, formatDate } from '@/lib/utils/helpers';

interface PriceCalendarProps {
  rooms: Array<{ id: string; name: string }>;
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  calendarPrices: Record<string, { basePrice: number; isPeak: boolean; available: boolean }>;
  isLoading: boolean;
  getDaysInMonth: () => (Date | null)[];
  onDateSelect: (date: Date) => void;
  bookingDates: { checkIn: string; checkOut: string };
  onBookNow: () => void;
}

export function PriceCalendar({
  rooms,
  selectedRoomId,
  onRoomSelect,
  selectedMonth,
  onMonthChange,
  calendarPrices,
  isLoading,
  getDaysInMonth,
  onDateSelect,
  bookingDates,
  onBookNow,
}: PriceCalendarProps) {
  const handlePrevMonth = () => {
    onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    onMonthChange(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1));
  };

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden relative z-10">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">Price Calendar</CardTitle>
        <CardDescription className="text-slate-600">View daily prices and availability</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Room Selector */}
        <div className="flex flex-wrap gap-2">
          {rooms.map((room) => (
            <Button
              key={room.id}
              onClick={() => onRoomSelect(room.id)}
              variant={selectedRoomId === room.id ? 'default' : 'outline'}
              className={selectedRoomId === room.id 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'border-slate-300 hover:bg-slate-100'}
            >
              {room.name}
            </Button>
          ))}
        </div>

        {selectedRoomId && (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl">
              <Button onClick={handlePrevMonth} variant="outline" size="sm" className="border-slate-300">
                ← Previous
              </Button>
              <h3 className="font-bold text-lg text-slate-900">
                {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <Button onClick={handleNextMonth} variant="outline" size="sm" className="border-slate-300">
                Next →
              </Button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs bg-slate-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-slate-600">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded flex items-center justify-center">
                  <Star className="h-2 w-2 fill-orange-500 text-orange-500" />
                </div>
                <span className="text-slate-600">Peak Season (Higher Rate)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded"></div>
                <span className="text-slate-600">Not Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                <span className="text-slate-600">Selected</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-900" />
              </div>
            ) : (
              <>
                {/* Calendar Grid */}
                <CalendarGrid
                  getDaysInMonth={getDaysInMonth}
                  calendarPrices={calendarPrices}
                  bookingDates={bookingDates}
                  onDateSelect={onDateSelect}
                />

                {/* Selected Dates Info */}
                {bookingDates.checkIn && bookingDates.checkOut && (
                  <div className="bg-slate-900 text-white p-4 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-slate-300 mb-1">Selected Dates</div>
                        <div className="font-bold">
                          {formatDate(new Date(bookingDates.checkIn))} - {formatDate(new Date(bookingDates.checkOut))}
                        </div>
                      </div>
                      <Button onClick={onBookNow} className="bg-white text-slate-900 hover:bg-slate-100 font-bold">
                        Book Now
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {!selectedRoomId && (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Select a room to view price calendar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CalendarGrid({ 
  getDaysInMonth, 
  calendarPrices, 
  bookingDates, 
  onDateSelect 
}: any) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day} className="text-center font-bold text-sm text-slate-700 py-2">
          {day}
        </div>
      ))}
      
      {getDaysInMonth().map((date: Date | null, index: number) => {
        if (!date) return <div key={`empty-${index}`} className="aspect-square"></div>;
        
        const dateStr = date.toISOString().split('T')[0];
        const priceData = calendarPrices[dateStr];
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
        const isSelected = bookingDates.checkIn === dateStr || bookingDates.checkOut === dateStr;
        const isInRange = bookingDates.checkIn && bookingDates.checkOut && 
                        dateStr > bookingDates.checkIn && dateStr < bookingDates.checkOut;
        
        // Handle both isPeak and isPeakSeason for backward compatibility
        const isPeakSeason = priceData?.isPeak || priceData?.isPeakSeason;
        const price = priceData?.basePrice || priceData?.price;
        
        let bgColor = 'bg-white border-slate-200';
        if (isPast || !priceData?.available) {
          bgColor = 'bg-slate-100 border-slate-300';
        } else if (isPeakSeason) {
          bgColor = 'bg-orange-50 border-orange-300';
        } else if (priceData?.available) {
          bgColor = 'bg-green-50 border-green-300';
        }
        
        if (isSelected) {
          bgColor = 'bg-blue-100 border-blue-500 border-2';
        } else if (isInRange) {
          bgColor = 'bg-blue-50 border-blue-200';
        }
        
        return (
          <button
            key={dateStr}
            onClick={() => !isPast && priceData?.available && onDateSelect(date)}
            disabled={isPast || !priceData?.available}
            className={`aspect-square border rounded-lg p-1 flex flex-col items-center justify-center transition-all relative ${bgColor} ${
              !isPast && priceData?.available 
                ? 'hover:shadow-lg hover:scale-105 cursor-pointer' 
                : 'cursor-not-allowed opacity-60'
            }`}
          >
            {isPeakSeason && priceData?.available && (
              <div className="absolute top-0.5 right-0.5">
                <Star className="h-3 w-3 fill-orange-500 text-orange-500" />
              </div>
            )}
            <div className="text-sm font-bold text-slate-900">{date.getDate()}</div>
            {priceData?.available && price > 0 && (
              <div className={`text-xs font-medium mt-0.5 ${isPeakSeason ? 'text-orange-700' : 'text-slate-700'}`}>
                {formatPrice(price)}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/formatPrice';

interface PriceCalendarProps {
  roomId: string;
  basePrice: number;
  onDateSelect?: (date: Date, price: number) => void;
}

interface DayPrice {
  date: Date;
  price: number;
  isWeekend: boolean;
  isPeakSeason: boolean;
}

export function PriceComparisonCalendar({ roomId, basePrice, onDateSelect }: PriceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayPrices, setDayPrices] = useState<DayPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchMonthPrices();
  }, [currentMonth, roomId]);

  const fetchMonthPrices = async () => {
    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const response = await fetch(
        `/api/rooms/${roomId}/prices?startDate=${firstDay.toISOString()}&endDate=${lastDay.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        // Convert date strings to Date objects
        const pricesWithDates = (data.prices || []).map((p: any) => ({
          ...p,
          date: new Date(p.date),
        }));
        setDayPrices(pricesWithDates);
      } else {
        // Generate default prices if API fails
        generateDefaultPrices();
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
      generateDefaultPrices();
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultPrices = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prices: DayPrice[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      prices.push({
        date,
        price: Number(basePrice) * (isWeekend ? 1.2 : 1),
        isWeekend,
        isPeakSeason: false,
      });
    }

    setDayPrices(prices);
  };

  const goToPreviousMonth = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    // Don't allow going to past months
    if (previousMonth >= today) {
      setCurrentMonth(previousMonth);
    }
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  const handleDateClick = (dayPrice: DayPrice) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dayPrice.date >= today) {
      setSelectedDate(dayPrice.date);
      onDateSelect?.(dayPrice.date, dayPrice.price);
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (DayPrice | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dayPrice = dayPrices.find(
        (dp) => dp.date.toDateString() === date.toDateString()
      );

      if (dayPrice) {
        days.push(dayPrice);
      } else {
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        days.push({
          date,
          price: Number(basePrice) * (isWeekend ? 1.2 : 1),
          isWeekend,
          isPeakSeason: false,
        });
      }
    }

    return days;
  };

  const days = getDaysInMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const canGoPrevious = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    return previousMonth >= today;
  };

  return (
    <Card className="p-6 bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-900">Price Comparison</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious() || isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-semibold text-slate-700 min-w-[140px] text-center">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextMonth}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          {/* Day Names */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-slate-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((dayPrice, index) => {
              if (!dayPrice) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isPast = dayPrice.date < today;
              const isSelected = selectedDate?.toDateString() === dayPrice.date.toDateString();
              const isToday = dayPrice.date.toDateString() === today.toDateString();

              return (
                <button
                  key={dayPrice.date.toISOString()}
                  onClick={() => handleDateClick(dayPrice)}
                  disabled={isPast}
                  className={`
                    aspect-square rounded-lg border-2 transition-all
                    flex flex-col items-center justify-center
                    ${isPast
                      ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100'
                      : isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                      : isToday
                      ? 'bg-slate-100 text-slate-900 border-slate-400 hover:border-slate-600'
                      : dayPrice.isPeakSeason
                      ? 'bg-orange-50 text-orange-900 border-orange-200 hover:border-orange-400 hover:shadow-md'
                      : dayPrice.isWeekend
                      ? 'bg-blue-50 text-blue-900 border-blue-200 hover:border-blue-400 hover:shadow-md'
                      : 'bg-white text-slate-900 border-slate-200 hover:border-slate-400 hover:shadow-md'
                    }
                  `}
                >
                  <span className="text-xs font-bold mb-1">
                    {dayPrice.date.getDate()}
                  </span>
                  <span className={`text-[10px] font-semibold ${isPast ? 'text-slate-300' : ''}`}>
                    {formatPrice(dayPrice.price).replace('Rp ', '')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-slate-400 bg-slate-100"></div>
                <span className="text-slate-600">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-blue-200 bg-blue-50"></div>
                <span className="text-slate-600">Weekend</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-orange-200 bg-orange-50"></div>
                <span className="text-slate-600">Peak Season</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded border-2 border-slate-900 bg-slate-900"></div>
                <span className="text-slate-600">Selected</span>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

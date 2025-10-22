'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AvailabilityCalendarProps {
  propertyId: string;
  roomId?: string; // Optional: filter by specific room
}

interface DayAvailability {
  date: Date;
  status: 'available' | 'booked' | 'checkout' | 'checkin';
  bookingId?: string;
  guestName?: string;
}

export function AvailabilityCalendar({ propertyId, roomId }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dayAvailability, setDayAvailability] = useState<DayAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayAvailability | null>(null);

  useEffect(() => {
    fetchAvailability();
  }, [currentMonth, propertyId, roomId]);

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const params = new URLSearchParams({
        propertyId,
        startDate: firstDay.toISOString(),
        endDate: lastDay.toISOString(),
      });

      if (roomId) {
        params.append('roomId', roomId);
      }

      const response = await fetch(`/api/tenant/availability?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setDayAvailability(
          data.availability.map((item: any) => ({
            ...item,
            date: new Date(item.date),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  const handleDayClick = (day: DayAvailability) => {
    setSelectedDay(day);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (DayAvailability | null)[] = [];

    // Add empty slots
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const availability = dayAvailability.find(
        (da) => da.date.toDateString() === date.toDateString()
      );

      days.push(
        availability || {
          date,
          status: 'available',
        }
      );
    }

    return days;
  };

  const days = getDaysInMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100';
      case 'booked':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'checkin':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'checkout':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-600 text-white text-xs">Available</Badge>;
      case 'booked':
        return <Badge className="bg-red-600 text-white text-xs">Booked</Badge>;
      case 'checkin':
        return <Badge className="bg-blue-600 text-white text-xs">Check-in</Badge>;
      case 'checkout':
        return <Badge className="bg-yellow-600 text-white text-xs">Check-out</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Room Availability</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPreviousMonth}
              disabled={isLoading}
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
              {days.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isToday = day.date.toDateString() === today.toDateString();
                const isPast = day.date < today;

                return (
                  <button
                    key={day.date.toISOString()}
                    onClick={() => handleDayClick(day)}
                    disabled={isPast}
                    className={`
                      aspect-square rounded-lg border-2 transition-all
                      flex flex-col items-center justify-center p-2
                      ${isPast
                        ? 'bg-slate-50 text-slate-300 cursor-not-allowed border-slate-100'
                        : isToday
                        ? 'ring-2 ring-slate-400 ' + getStatusColor(day.status)
                        : getStatusColor(day.status)
                      }
                    `}
                  >
                    <span className="text-xs font-bold mb-1">
                      {day.date.getDate()}
                    </span>
                    {!isPast && getStatusBadge(day.status)}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-green-200 bg-green-50"></div>
                  <span className="text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-red-200 bg-red-50"></div>
                  <span className="text-slate-600">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-blue-200 bg-blue-50"></div>
                  <span className="text-slate-600">Check-in</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded border-2 border-yellow-200 bg-yellow-50"></div>
                  <span className="text-slate-600">Check-out</span>
                </div>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Selected Day Details */}
      {selectedDay && selectedDay.status !== 'available' && (
        <Card className="p-6 bg-slate-50">
          <h4 className="font-bold text-slate-900 mb-4">Booking Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-semibold">{selectedDay.date.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Status:</span>
              {getStatusBadge(selectedDay.status)}
            </div>
            {selectedDay.guestName && (
              <div className="flex justify-between">
                <span className="text-slate-600">Guest:</span>
                <span className="font-semibold">{selectedDay.guestName}</span>
              </div>
            )}
            {selectedDay.bookingId && (
              <div className="flex justify-between">
                <span className="text-slate-600">Booking ID:</span>
                <span className="font-mono text-xs">{selectedDay.bookingId}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Property {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  basePrice: number;
}

interface Booking {
  checkInDate: string;
  checkOutDate: string;
}

interface CalendarDay {
  date: Date;
  isAvailable: boolean;
  price: number;
  isPeakSeason: boolean;
  bookings: Booking[];
}

export default function PropertyCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingCalendar, setIsFetchingCalendar] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchProperties();
      }
    }
  }, [status]);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchRooms();
    } else {
      setRooms([]);
      setSelectedRoomId('');
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    if (selectedRoomId) {
      fetchCalendar();
    } else {
      setCalendarData([]);
    }
  }, [selectedRoomId, currentMonth]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/properties?tenantOnly=true');
      const data = await response.json();

      if (response.ok) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data properti',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/properties/${selectedPropertyId}`);
      const data = await response.json();

      if (response.ok && data.data.rooms) {
        setRooms(data.data.rooms);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchCalendar = async () => {
    setIsFetchingCalendar(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const response = await fetch(`/api/reports/calendar?roomId=${selectedRoomId}&year=${year}&month=${month}`);
      const data = await response.json();

      if (response.ok) {
        setCalendarData(data.data.map((day: any) => ({
          ...day,
          date: new Date(day.date),
        })));
      }
    } catch (error) {
      console.error('Error fetching calendar:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data kalender',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingCalendar(false);
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (CalendarDay | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const calendarDay = calendarData.find(
        d => d.date.getDate() === day && d.date.getMonth() === month && d.date.getFullYear() === year
      );
      
      days.push(calendarDay || {
        date,
        isAvailable: true,
        price: rooms.find(r => r.id === selectedRoomId)?.basePrice || 0,
        isPeakSeason: false,
        bookings: [],
      });
    }

    return days;
  };

  const getCellColor = (day: CalendarDay) => {
    if (!day.isAvailable) {
      return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
    }
    if (day.isPeakSeason) {
      return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
    }
    return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const monthName = currentMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth();
  const weekDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Kalender Properti</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Lihat ketersediaan dan harga kamar per tanggal
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Kalender</CardTitle>
            <CardDescription>Pilih properti dan kamar untuk melihat kalender</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Properti</Label>
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Properti" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Kamar</Label>
                <Select 
                  value={selectedRoomId} 
                  onValueChange={setSelectedRoomId}
                  disabled={!selectedPropertyId || rooms.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={rooms.length === 0 ? 'Pilih properti terlebih dahulu' : 'Pilih Kamar'} />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedRoomId && (
          <>
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" size="sm" onClick={previousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-xl font-bold">{monthName}</h2>
                  <Button variant="outline" size="sm" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {isFetchingCalendar ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-2">
                    {weekDays.map(day => (
                      <div key={day} className="text-center font-semibold text-sm py-2">
                        {day}
                      </div>
                    ))}

                    {days.map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-24 border rounded-lg p-2 ${
                          day
                            ? getCellColor(day) + ' hover:shadow-md transition-shadow cursor-pointer'
                            : 'bg-slate-100 dark:bg-slate-800'
                        }`}
                      >
                        {day && (
                          <>
                            <div className="font-semibold text-sm mb-1">
                              {day.date.getDate()}
                            </div>
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              {formatPrice(day.price)}
                            </div>
                            {day.bookings.length > 0 && (
                              <div className="text-xs mt-1 text-red-600 dark:text-red-400 font-semibold">
                                Terbooked
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Keterangan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded"></div>
                    <span className="text-sm">Tersedia - Harga Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                    <span className="text-sm">Tersedia - Peak Season (Harga Spesial)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded"></div>
                    <span className="text-sm">Tidak Tersedia - Sudah Terbooked</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedRoomId && properties.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Pilih Properti dan Kamar</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Pilih properti dan kamar untuk melihat kalender ketersediaan
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {properties.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Belum Ada Properti</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Anda belum memiliki properti. Buat properti terlebih dahulu.
                </p>
                <Button onClick={() => router.push('/tenant/properties/create')}>
                  Buat Properti
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

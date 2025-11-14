'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import { TicketDialog } from './TicketDialog';

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
      images: string[];
      address: string;
    };
  };
}

interface BookingsSectionProps {
  bookings: Booking[];
  isLoading: boolean;
}

export function BookingsSection({ bookings, isLoading }: BookingsSectionProps) {
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMED');

  const handleViewTicket = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (confirmedBookings.length === 0) {
    return (
      <div className="text-center py-12">
        <Ticket className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Belum Ada Tiket</h3>
        <p className="text-muted-foreground mb-6">
          Anda belum memiliki booking yang dikonfirmasi
        </p>
        <Button asChild>
          <Link href="/properties">Cari Property</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Tiket Saya</h2>
        <p className="text-muted-foreground">
          Daftar booking yang sudah dikonfirmasi
        </p>
      </div>

      <div className="grid gap-4">
        {confirmedBookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Property Image */}
                <div className="relative w-full md:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={booking.room.property.images[0] || '/placeholder.jpg'}
                    alt={booking.room.property.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Booking Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold mb-1">
                          {booking.room.property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {booking.room.property.city}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Dikonfirmasi
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {booking.room.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Check-in</div>
                        <div className="font-medium">{formatDate(booking.checkInDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Check-out</div>
                        <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-xs text-muted-foreground">Tamu</div>
                        <div className="font-medium">{booking.numberOfGuests} orang</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Nomor Booking</div>
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {booking.bookingNumber}
                      </code>
                    </div>
                      <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Total Bayar</div>
                        <div className="text-lg font-bold text-primary">
                          {formatPrice(booking.totalPrice)}
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => handleViewTicket(booking)}>
                        Lihat Tiket
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <TicketDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        booking={selectedBooking}
      />
    </div>
  );
}
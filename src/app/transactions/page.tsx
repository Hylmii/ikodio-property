'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { TransactionFilters } from '@/components/Transactions/TransactionFilters';
import { TransactionCard } from '@/components/Transactions/TransactionCard';
import { ReviewDialog } from '@/components/Transactions/ReviewDialog';
import { EmptyState } from '@/components/Transactions/EmptyState';
import { OrderStatus } from '@prisma/client';

interface BookingData {
  id: string;
  bookingNumber: string;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  numberOfGuests: number;
  totalPrice: number;
  status: OrderStatus;
  paymentProof: string | null;
  paymentDeadline: Date | string;
  paymentMethod?: 'MANUAL' | 'MIDTRANS' | null;
  room: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      city: string;
      images: string[];
    };
  };
}

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-user');
    } else if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchQuery, startDate, endDate, statusFilter]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (res.ok) setBookings(data.data);
    } catch {
      showError('Gagal memuat transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (searchQuery) {
      filtered = filterBySearch(filtered, searchQuery);
    }
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(b => b.status === statusFilter);
    }
    if (startDate) {
      filtered = filtered.filter(b => new Date(b.checkInDate) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(b => new Date(b.checkInDate) <= new Date(endDate));
    }

    setFilteredBookings(filtered);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PUT' });
      if (!res.ok) throw new Error((await res.json()).error);

      toast({ title: 'Berhasil', description: 'Booking berhasil dibatalkan' });
      fetchBookings();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const handleReviewClick = (booking: BookingData) => {
    setSelectedBooking(booking);
  };

  const handleSubmitReview = async (
    bookingId: string,
    propertyId: string,
    rating: number,
    comment: string
  ) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, bookingId, rating, comment }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      toast({ title: 'Berhasil', description: 'Review berhasil dikirim' });
      setSelectedBooking(null);
      fetchBookings();
    } catch (error: any) {
      showError(error.message);
    }
  };

  const showError = (message: string) => {
    toast({ title: 'Error', description: message, variant: 'destructive' });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Transaksi Saya</h1>

        <TransactionFilters
          searchQuery={searchQuery}
          startDate={startDate}
          endDate={endDate}
          statusFilter={statusFilter}
          onSearchChange={setSearchQuery}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onStatusChange={setStatusFilter}
        />

        {filteredBookings.length === 0 ? (
          <EmptyState hasBookings={bookings.length > 0} />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <TransactionCard
                key={booking.id}
                booking={booking}
                onCancel={handleCancelBooking}
                onReview={handleReviewClick}
                onRefresh={fetchBookings}
              />
            ))}
          </div>
        )}

        <ReviewDialog
          open={!!selectedBooking}
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onSubmit={handleSubmitReview}
        />
      </div>
    </div>
  );
}

function filterBySearch(bookings: BookingData[], query: string): BookingData[] {
  const lowerQuery = query.toLowerCase();
  return bookings.filter(
    b =>
      b.bookingNumber.toLowerCase().includes(lowerQuery) ||
      b.room.property.name.toLowerCase().includes(lowerQuery) ||
      b.room.name.toLowerCase().includes(lowerQuery)
  );
}
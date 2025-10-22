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

interface Booking {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentProof: string | null;
  paymentDeadline: string | null;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-user');
    } else if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status]);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchQuery, startDate, endDate]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      if (response.ok) setBookings(data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    if (searchQuery) {
      filtered = filtered.filter(booking =>
        booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.room.property.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (startDate) {
      filtered = filtered.filter(booking => new Date(booking.bookingDate) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(booking => new Date(booking.bookingDate) <= new Date(endDate));
    }

    setFilteredBookings(filtered);
  };

  const handlePaymentUpload = async (bookingId: string, file: File) => {
    setUploadingId(bookingId);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'payment');

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Gagal upload bukti pembayaran');
      }

      const updateResponse = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentProof: uploadData.data.url }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Gagal update bukti pembayaran');
      }

      toast({ title: 'Berhasil', description: 'Bukti pembayaran berhasil diupload' });
      fetchBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) return;

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membatalkan booking');
      }

      toast({ title: 'Berhasil', description: 'Booking berhasil dibatalkan' });
      fetchBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmitReview = async (bookingId: string, propertyId: string, rating: number, comment: string) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, bookingId, rating, comment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim review');
      }

      toast({ title: 'Berhasil', description: 'Review berhasil dikirim' });
      setSelectedBooking(null);
      fetchBookings();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
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
          onSearchChange={setSearchQuery}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
        />

        {filteredBookings.length === 0 ? (
          <EmptyState hasBookings={bookings.length > 0} />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <TransactionCard
                key={booking.id}
                booking={booking}
                uploadingId={uploadingId}
                onPaymentUpload={handlePaymentUpload}
                onCancel={handleCancelBooking}
                onReview={setSelectedBooking}
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

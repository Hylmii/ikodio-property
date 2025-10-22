'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ReviewForm } from '@/components/Reviews/ReviewForm';

interface Booking {
  id: string;
  checkIn: Date;
  checkOut: Date;
  room: {
    name: string;
    property: {
      id: string;
      name: string;
    };
  };
}

function WriteReviewPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const bookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-user');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'USER') {
        router.push('/');
      } else if (!bookingId) {
        toast({
          title: 'Error',
          description: 'Booking ID tidak ditemukan',
          variant: 'destructive',
        });
        router.push('/transactions');
      } else {
        fetchBooking();
      }
    }
  }, [status, bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Booking tidak ditemukan');
      }

      setBooking(data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      router.push('/transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast({
      title: 'Berhasil',
      description: 'Review berhasil dikirim',
    });
    setTimeout(() => {
      router.push('/transactions');
    }, 1500);
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <h2 className="text-xl font-bold mb-2">{booking.room.property.name}</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-1">
                {booking.room.name}
              </p>
              <p className="text-sm text-slate-500">
                Check-in: {new Date(booking.checkIn).toLocaleDateString('id-ID')} - 
                Check-out: {new Date(booking.checkOut).toLocaleDateString('id-ID')}
              </p>
            </CardContent>
          </Card>

          <ReviewForm
            bookingId={booking.id}
            propertyName={booking.room.property.name}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
}

export default function WriteReviewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <WriteReviewPageContent />
    </Suspense>
  );
}

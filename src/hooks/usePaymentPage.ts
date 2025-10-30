import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { Booking } from '@/types';

export function usePaymentPage(bookingId: string) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login-user');
      return;
    }
    fetchBooking();
  }, [bookingId, session]);

  useEffect(() => {
    if (!booking?.paymentDeadline) return;
    return startCountdown();
  }, [booking]);

  const startCountdown = () => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const deadline = new Date(booking!.paymentDeadline).getTime();
      const distance = deadline - now;

      if (distance < 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        clearInterval(timer);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  };

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`);
      if (!res.ok) throw new Error('Failed to fetch booking');
      
      const data = await res.json();
      setBooking(data.data);
    } catch (error) {
      showError('Gagal memuat data booking');
      router.push('/transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', file);

      const res = await fetch(`/api/bookings/${bookingId}/payment`, {
        method: 'PUT',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      toast({
        title: 'Berhasil!',
        description: 'Bukti pembayaran berhasil diupload. Menunggu konfirmasi tenant.',
      });

      await fetchBooking();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const validateFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      showError('Hanya file JPG/PNG yang diperbolehkan');
      return false;
    }
    if (file.size > 1024 * 1024) {
      showError('Maksimal ukuran file 1MB');
      return false;
    }
    return true;
  };

  const showError = (message: string) => {
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  };

  const handlePaymentSuccess = async () => {
    toast({
      title: 'Pembayaran Berhasil!',
      description: 'Booking Anda telah dikonfirmasi',
    });
    await fetchBooking();
  };

  return {
    booking,
    isLoading,
    timeLeft,
    isExpired,
    isUploading,
    handleManualUpload,
    handlePaymentSuccess,
    router,
  };
}
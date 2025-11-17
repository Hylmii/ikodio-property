import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
}

interface BookingDates {
  checkIn: string;
  checkOut: string;
}

export function useBooking() {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingDates, setBookingDates] = useState<BookingDates>({
    checkIn: '',
    checkOut: '',
  });
  const [guestCount, setGuestCount] = useState(1);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string | null>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<any>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleBookClick = (room: Room) => {
    if (!session) {
      toast({ 
        title: 'Login Diperlukan', 
        description: 'Silakan login sebagai pengguna untuk melakukan pemesanan',
        variant: 'destructive'
      });
      router.push('/login-user');
      return;
    }
    
    // Check if user has correct role
    if (session.user.role !== 'USER') {
      toast({ 
        title: 'Akses Ditolak', 
        description: 'Fitur pemesanan hanya tersedia untuk pengguna (user). Tenant dan admin tidak dapat melakukan pemesanan.',
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedRoom(room);
    setIsBookingDialogOpen(true);
    setAvailabilityMessage(null);
    setPriceBreakdown(null);
  };

  const checkAvailability = async () => {
    if (!selectedRoom || !bookingDates.checkIn || !bookingDates.checkOut) return;

    setIsCheckingAvailability(true);
    try {
      const res = await fetch('/api/bookings/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: bookingDates.checkIn,
          checkOut: bookingDates.checkOut,
        }),
      });
      const data = await res.json();

      if (data.available) {
        setAvailabilityMessage('Room is available!');
        setPriceBreakdown(data.priceBreakdown);
      } else {
        setAvailabilityMessage('Room not available for selected dates');
        setPriceBreakdown(null);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check availability',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const processBooking = async () => {
    if (!selectedRoom) return;

    setIsBooking(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: bookingDates.checkIn,
          checkOut: bookingDates.checkOut,
          guests: guestCount,
        }),
      });

      if (!res.ok) throw new Error('Booking failed');

      const data = await res.json();
      toast({ title: 'Success', description: 'Booking confirmed!' });
      setIsBookingDialogOpen(false);
      router.push(`/transactions/${data.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return {
    selectedRoom,
    isBookingDialogOpen,
    bookingDates,
    guestCount,
    isCheckingAvailability,
    availabilityMessage,
    priceBreakdown,
    isBooking,
    setIsBookingDialogOpen,
    setBookingDates,
    setGuestCount,
    handleBookClick,
    checkAvailability,
    processBooking,
  };
}

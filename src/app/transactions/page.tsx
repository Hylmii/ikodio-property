'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Calendar, MapPin, Users, CreditCard, Upload, X, Star, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

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

      if (response.ok) {
        setBookings(data.data);
      }
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

  const handlePaymentUpload = async (bookingId: string, file: File) {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentProof: uploadData.data.url,
        }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Gagal update bukti pembayaran');
      }

      toast({
        title: 'Berhasil',
        description: 'Bukti pembayaran berhasil diupload',
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Apakah Anda yakin ingin membatalkan booking ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membatalkan booking');
      }

      toast({
        title: 'Berhasil',
        description: 'Booking berhasil dibatalkan',
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedBooking) return;

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: selectedBooking.room.property.id,
          bookingId: selectedBooking.id,
          rating: reviewData.rating,
          comment: reviewData.comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim review');
      }

      toast({
        title: 'Berhasil',
        description: 'Review berhasil dikirim',
      });

      setSelectedBooking(null);
      setReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const statusConfig = {
      WAITING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800' },
      WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', className: 'bg-blue-100 text-blue-800' },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100 text-green-800' },
      COMPLETED: { label: 'Selesai', className: 'bg-gray-100 text-gray-800' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getRemainingTime = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}j ${minutes}m`;
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

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Cari Transaksi</CardTitle>
            <CardDescription>Cari berdasarkan ID pesanan atau tanggal booking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Cari ID Pesanan / Nama Properti</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Masukkan ID pesanan atau nama properti..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Tanggal Akhir</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {bookings.length === 0 ? 'Belum Ada Transaksi' : 'Tidak Ada Hasil'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {bookings.length === 0 
                  ? 'Anda belum memiliki transaksi apapun' 
                  : 'Tidak ada transaksi yang sesuai dengan pencarian Anda'}
              </p>
              {bookings.length === 0 && (
                <Button asChild>
                  <Link href="/properties">Cari Properti</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <Image
                          src={booking.room.property.images[0] || '/placeholder.jpg'}
                          alt={booking.room.property.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">
                          {booking.room.property.name}
                        </CardTitle>
                        <CardDescription className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            {booking.room.property.city}
                          </div>
                          <div className="text-sm font-medium">
                            {booking.room.name}
                          </div>
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        Check-in
                      </div>
                      <div className="font-medium">{formatDate(booking.checkInDate)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3" />
                        Check-out
                      </div>
                      <div className="font-medium">{formatDate(booking.checkOutDate)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <Users className="h-3 w-3" />
                        Tamu
                      </div>
                      <div className="font-medium">{booking.guestCount} orang</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground flex items-center gap-1 mb-1">
                        <CreditCard className="h-3 w-3" />
                        Total
                      </div>
                      <div className="font-medium text-primary">
                        {formatPrice(booking.totalPrice)}
                      </div>
                    </div>
                  </div>

                  {booking.status === 'WAITING_PAYMENT' && booking.paymentDeadline && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Batas waktu pembayaran: {getRemainingTime(booking.paymentDeadline)}
                      </p>
                    </div>
                  )}

                  {booking.paymentProof && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CreditCard className="h-4 w-4" />
                      Bukti pembayaran telah diupload
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex flex-wrap gap-2">
                  {booking.status === 'WAITING_PAYMENT' && !booking.paymentProof && (
                    <>
                      <Label htmlFor={`payment-${booking.id}`} className="cursor-pointer">
                        <Button disabled={uploadingId === booking.id} asChild>
                          <span>
                            {uploadingId === booking.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Bukti Pembayaran
                              </>
                            )}
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id={`payment-${booking.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePaymentUpload(booking.id, file);
                        }}
                        disabled={uploadingId === booking.id}
                      />
                    </>
                  )}

                  {(booking.status === 'WAITING_PAYMENT' || booking.status === 'WAITING_CONFIRMATION') && (
                    <Button
                      variant="outline"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Batalkan
                    </Button>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button onClick={() => setSelectedBooking(booking)}>
                          <Star className="mr-2 h-4 w-4" />
                          Beri Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Beri Review</DialogTitle>
                          <DialogDescription>
                            Bagaimana pengalaman Anda menginap di {booking.room.property.name}?
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="rating">Rating</Label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={`h-6 w-6 ${
                                      star <= reviewData.rating
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="comment">Ulasan</Label>
                            <Textarea
                              id="comment"
                              placeholder="Tulis ulasan Anda..."
                              value={reviewData.comment}
                              onChange={(e) =>
                                setReviewData({ ...reviewData, comment: e.target.value })
                              }
                              required
                              rows={4}
                            />
                          </div>
                          <DialogFooter>
                            <Button type="submit">Kirim Review</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button variant="outline" asChild>
                    <Link href={`/properties/${booking.room.property.id}`}>
                      Lihat Detail Properti
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

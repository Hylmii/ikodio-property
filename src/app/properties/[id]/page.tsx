'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Star, Users, Loader2, Calendar, DollarSign } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils/helpers';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    profilePicture: string | null;
  };
  reply: {
    comment: string;
    createdAt: string;
  } | null;
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: {
    name: string;
  };
  rooms: Room[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
  });
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  useEffect(() => {
    fetchProperty();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (selectedRoom && bookingData.checkIn && bookingData.checkOut) {
      checkAvailabilityAndPrice();
    }
  }, [selectedRoom, bookingData.checkIn, bookingData.checkOut]);

  const fetchProperty = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/properties/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data properti');
      }

      setProperty(data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkAvailabilityAndPrice = async () => {
    if (!selectedRoom) return;

    try {
      const params = new URLSearchParams({
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
      });

      const response = await fetch(`/api/rooms/${selectedRoom.id}/availability?${params}`);
      const data = await response.json();

      if (response.ok && data.data.available) {
        setEstimatedPrice(data.data.totalPrice);
      } else {
        setEstimatedPrice(0);
        toast({
          title: 'Tidak Tersedia',
          description: data.error || 'Kamar tidak tersedia untuk tanggal tersebut',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error checking availability:', error);
    }
  };

  const handleBooking = async () => {
    if (!session) {
      toast({
        title: 'Login Diperlukan',
        description: 'Silakan login terlebih dahulu untuk melakukan booking',
        variant: 'destructive',
      });
      router.push('/login-user');
      return;
    }

    if (!selectedRoom) return;

    setIsBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: selectedRoom.id,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat booking');
      }

      toast({
        title: 'Booking Berhasil',
        description: 'Silakan upload bukti pembayaran dalam 1 jam',
      });

      setIsBookingDialogOpen(false);
      router.push('/transactions');
    } catch (error: any) {
      toast({
        title: 'Booking Gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="text-muted-foreground">Properti tidak ditemukan</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4 mb-6">
              {property.images.slice(0, 4).map((image, index) => (
                <div key={index} className="relative h-64">
                  <Image
                    src={image}
                    alt={`${property.name} - ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>

            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.name}</CardTitle>
                    <div className="flex items-center text-muted-foreground mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.address}, {property.city}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {property.category.name}
                    </div>
                  </div>
                  {property.totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <div className="text-right">
                        <div className="font-bold">{property.averageRating.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {property.totalReviews} ulasan
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Deskripsi</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Kamar Tersedia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.rooms.map((room) => (
                  <Card key={room.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{room.name}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {room.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{room.capacity} tamu</span>
                            </div>
                            <div className="font-bold text-primary">
                              {formatPrice(room.basePrice)}/malam
                            </div>
                          </div>
                        </div>
                        <Dialog open={isBookingDialogOpen && selectedRoom?.id === room.id} onOpenChange={setIsBookingDialogOpen}>
                          <DialogTrigger asChild>
                            <Button onClick={() => setSelectedRoom(room)}>
                              Booking
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking {room.name}</DialogTitle>
                              <DialogDescription>
                                Silakan isi detail booking Anda
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="checkIn">Check-in</Label>
                                <Input
                                  id="checkIn"
                                  type="date"
                                  value={bookingData.checkIn}
                                  onChange={(e) =>
                                    setBookingData({ ...bookingData, checkIn: e.target.value })
                                  }
                                  min={new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="checkOut">Check-out</Label>
                                <Input
                                  id="checkOut"
                                  type="date"
                                  value={bookingData.checkOut}
                                  onChange={(e) =>
                                    setBookingData({ ...bookingData, checkOut: e.target.value })
                                  }
                                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="guests">Jumlah Tamu</Label>
                                <Input
                                  id="guests"
                                  type="number"
                                  value={bookingData.guests || ''}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 1;
                                    setBookingData({ ...bookingData, guests: value });
                                  }}
                                  min={1}
                                  max={room.capacity}
                                />
                              </div>
                              {estimatedPrice > 0 && (
                                <div className="p-4 bg-muted rounded-lg">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">Estimasi Total:</span>
                                    <span className="text-lg font-bold text-primary">
                                      {formatPrice(estimatedPrice)}
                                    </span>
                                  </div>
                                </div>
                              )}
                              <Button
                                className="w-full"
                                onClick={handleBooking}
                                disabled={isBooking || !estimatedPrice}
                              >
                                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isBooking ? 'Memproses...' : 'Konfirmasi Booking'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ulasan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {property.reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Belum ada ulasan
                  </p>
                ) : (
                  property.reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold">{review.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(new Date(review.createdAt))}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{review.comment}</p>
                      {review.reply && (
                        <div className="ml-4 mt-2 p-3 bg-muted rounded-lg">
                          <div className="text-xs font-semibold mb-1">Balasan dari Tenant:</div>
                          <p className="text-sm">{review.reply.comment}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDate(new Date(review.reply.createdAt))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Informasi Properti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Lokasi</div>
                  <div className="font-medium">{property.city}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Kategori</div>
                  <div className="font-medium">{property.category.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Jumlah Kamar</div>
                  <div className="font-medium">{property.rooms.length} kamar</div>
                </div>
                {property.totalReviews > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Rating</div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {property.averageRating.toFixed(1)} ({property.totalReviews} ulasan)
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

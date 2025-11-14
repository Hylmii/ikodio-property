'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Calendar, User, CreditCard, MapPin } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface Order {
  id: string;
  bookingNumber: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  paymentProof: string | null;
  user: {
    name: string;
    email: string;
  };
  room: {
    name: string;
    property: {
      name: string;
      city: string;
      images: string[];
    };
  };
}

export default function TenantApprovalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchOrders();
      }
    }
  }, [status]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tenant/orders?status=WAITING_CONFIRMATION');
      const data = await response.json();
      
      if (response.ok) {
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedOrder) return;
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/tenant/orders/${selectedOrder.id}/confirm`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal konfirmasi pembayaran');
      }

      toast({ title: 'Berhasil', description: 'Pembayaran berhasil dikonfirmasi' });
      setIsConfirmDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedOrder || !rejectReason.trim()) {
      toast({ title: 'Error', description: 'Alasan penolakan harus diisi', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/tenant/orders/${selectedOrder.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menolak pembayaran');
      }

      toast({ title: 'Berhasil', description: 'Pembayaran berhasil ditolak' });
      setIsRejectDialogOpen(false);
      setSelectedOrder(null);
      setRejectReason('');
      fetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsProcessing(false);
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Approval Pembayaran</h1>
          <p className="text-muted-foreground">
            Konfirmasi atau tolak pembayaran yang masuk ({orders.length} pending)
          </p>
        </div>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Tidak Ada Pembayaran Pending</h3>
              <p className="text-muted-foreground">
                Semua pembayaran sudah diproses
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Booking #{order.bookingNumber}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Menunggu Konfirmasi
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Property Image */}
                    <div className="relative w-full md:w-40 h-40 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={order.room.property.images?.[0] || '/placeholder.jpg'}
                        alt={order.room.property.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg">{order.room.property.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {order.room.property.city}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{order.room.name}</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <div className="text-muted-foreground flex items-center gap-1 mb-1">
                            <User className="h-3 w-3" />
                            Tamu
                          </div>
                          <div className="font-medium">{order.user.name}</div>
                          <div className="text-xs text-muted-foreground">{order.user.email}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground flex items-center gap-1 mb-1">
                            <Calendar className="h-3 w-3" />
                            Check-in
                          </div>
                          <div className="font-medium">{formatDate(order.checkInDate)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground flex items-center gap-1 mb-1">
                            <Calendar className="h-3 w-3" />
                            Check-out
                          </div>
                          <div className="font-medium">{formatDate(order.checkOutDate)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground flex items-center gap-1 mb-1">
                            <CreditCard className="h-3 w-3" />
                            Total
                          </div>
                          <div className="font-medium text-primary">{formatPrice(order.totalPrice)}</div>
                        </div>
                      </div>

                      {order.paymentProof && (
                        <div>
                          <a
                            href={order.paymentProof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm"
                          >
                            📎 Lihat Bukti Pembayaran
                          </a>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsConfirmDialogOpen(true);
                          }}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsRejectDialogOpen(true);
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Confirm Dialog */}
        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent className="max-w-md bg-white dark:bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-900">Konfirmasi Pembayaran</DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Anda yakin ingin mengkonfirmasi pembayaran untuk pesanan ini?
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-3 py-4">
                <div>
                  <div className="text-sm text-gray-600">Tamu:</div>
                  <div className="font-semibold text-gray-900">{selectedOrder.user.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Properti:</div>
                  <div className="font-semibold text-gray-900">{selectedOrder.room.property.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-sm text-gray-600">Check-in</div>
                    <div className="font-medium text-gray-900">{formatDate(selectedOrder.checkInDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Check-out</div>
                    <div className="font-medium text-gray-900">{formatDate(selectedOrder.checkOutDate)}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600">Total Pembayaran</div>
                  <div className="text-xl font-bold text-blue-600">{formatPrice(selectedOrder.totalPrice)}</div>
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isProcessing} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Batal
              </Button>
              <Button onClick={handleConfirm} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white">
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Konfirmasi
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent className="bg-white dark:bg-white text-gray-900">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Tolak Pembayaran</DialogTitle>
              <DialogDescription className="text-gray-600">
                Masukkan alasan penolakan pembayaran
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Contoh: Bukti pembayaran tidak jelas, nominal tidak sesuai, dll."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="bg-white text-gray-900 border-gray-300"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing} className="border-gray-300 text-gray-700 hover:bg-gray-100">
                Batal
              </Button>
              <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tolak
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

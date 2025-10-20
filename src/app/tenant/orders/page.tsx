'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, Calendar, MapPin, User, CreditCard, Search } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Order {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentProof: string | null;
  paymentDeadline: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
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

export default function TenantOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
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

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tenant/orders');
      const data = await response.json();

      if (response.ok) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (activeTab !== 'all') {
      filtered = filtered.filter(order => order.status === activeTab);
    }

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.room.property.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const handleConfirmPayment = async () => {
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

      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil dikonfirmasi',
      });

      setIsConfirmDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder || !rejectReason.trim()) {
      toast({
        title: 'Error',
        description: 'Alasan penolakan harus diisi',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch(`/api/tenant/orders/${selectedOrder.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectReason }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal reject pembayaran');
      }

      toast({
        title: 'Berhasil',
        description: 'Pembayaran berhasil ditolak',
      });

      setIsRejectDialogOpen(false);
      setSelectedOrder(null);
      setRejectReason('');
      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async (order: Order) => {
    if (order.paymentProof) {
      toast({
        title: 'Tidak Dapat Dibatalkan',
        description: 'Tidak dapat membatalkan order yang sudah upload bukti pembayaran',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin membatalkan order #${order.id}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/tenant/orders/${order.id}/cancel`, {
        method: 'PUT',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal cancel order');
      }

      toast({
        title: 'Berhasil',
        description: 'Order berhasil dibatalkan',
      });

      fetchOrders();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      WAITING_PAYMENT: { label: 'Menunggu Pembayaran', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
      WAITING_CONFIRMATION: { label: 'Menunggu Konfirmasi', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
      CONFIRMED: { label: 'Dikonfirmasi', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
      COMPLETED: { label: 'Selesai', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
      CANCELLED: { label: 'Dibatalkan', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-3xl font-bold">Pesanan</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Kelola semua pesanan properti Anda
          </p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Cari berdasarkan ID pesanan, nama tamu, atau properti..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">Semua</TabsTrigger>
            <TabsTrigger value="WAITING_PAYMENT">Tunggu Bayar</TabsTrigger>
            <TabsTrigger value="WAITING_CONFIRMATION">Konfirmasi</TabsTrigger>
            <TabsTrigger value="CONFIRMED">Dikonfirmasi</TabsTrigger>
            <TabsTrigger value="COMPLETED">Selesai</TabsTrigger>
            <TabsTrigger value="CANCELLED">Dibatalkan</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Clock className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Tidak Ada Pesanan</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    {searchQuery ? 'Tidak ada pesanan yang sesuai dengan pencarian' : 'Belum ada pesanan masuk'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={order.room.property.images[0] || '/placeholder.jpg'}
                            alt={order.room.property.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <CardTitle className="text-lg">
                                {order.room.property.name}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Order ID: #{order.id.slice(0, 8)}
                              </CardDescription>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <User className="h-4 w-4" />
                              <span>{order.user.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <MapPin className="h-4 w-4" />
                              <span>{order.room.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(order.checkInDate)} - {formatDate(order.checkOutDate)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <CreditCard className="h-4 w-4" />
                              <span className="font-semibold text-blue-600 dark:text-blue-400">{formatPrice(order.totalPrice)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 justify-end">
                      {order.status === 'WAITING_CONFIRMATION' && order.paymentProof && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(order.paymentProof!, '_blank')}
                          >
                            Lihat Bukti Bayar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsRejectDialogOpen(true);
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Tolak
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsConfirmDialogOpen(true);
                            }}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Konfirmasi
                          </Button>
                        </>
                      )}
                      {order.status === 'WAITING_PAYMENT' && !order.paymentProof && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleCancelOrder(order)}
                        >
                          Batalkan Pesanan
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin mengkonfirmasi pembayaran untuk pesanan ini?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={isProcessing}>
                Batal
              </Button>
              <Button onClick={handleConfirmPayment} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Memproses...' : 'Ya, Konfirmasi'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tolak Pembayaran</DialogTitle>
              <DialogDescription>
                Berikan alasan penolakan pembayaran
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Alasan Penolakan</Label>
                <Textarea
                  id="reason"
                  placeholder="Contoh: Bukti pembayaran tidak jelas, nominal tidak sesuai, dll."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  rows={4}
                  disabled={isProcessing}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isProcessing}>
                Batal
              </Button>
              <Button variant="destructive" onClick={handleRejectPayment} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? 'Memproses...' : 'Tolak Pembayaran'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

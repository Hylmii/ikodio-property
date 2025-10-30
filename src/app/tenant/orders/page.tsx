'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { OrderFilters } from '@/components/TenantOrders/OrderFilters';
import { OrderCard } from '@/components/TenantOrders/OrderCard';
import { ConfirmDialog } from '@/components/TenantOrders/ConfirmDialog';
import { RejectDialog } from '@/components/TenantOrders/RejectDialog';
import { CancelDialog } from '@/components/TenantOrders/CancelDialog';
import { OrderStatus } from '@prisma/client';

interface Order {
  id: string;
  bookingNumber: string;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  numberOfGuests: number;
  totalPrice: number;
  status: OrderStatus;
  paymentProof: string | null;
  paymentMethod?: 'MANUAL' | 'MIDTRANS' | null;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
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
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');
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
  }, [status, router]);

  useEffect(() => {
    filterOrders();
  }, [orders, activeTab, searchQuery]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tenant/orders');
      const data = await res.json();
      if (res.ok) setOrders(data.data || []);
    } catch {
      showError('Gagal memuat pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (activeTab !== 'all') {
      filtered = filtered.filter(o => o.status === activeTab);
    }

    if (searchQuery) {
      filtered = filterBySearch(filtered, searchQuery);
    }

    setFilteredOrders(filtered);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrder) return;

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tenant/orders/${selectedOrder.id}/confirm`, { method: 'PUT' });
      if (!res.ok) throw new Error((await res.json()).error);

      toast({ title: 'Berhasil', description: 'Pembayaran berhasil dikonfirmasi' });
      closeDialogs();
      fetchOrders();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedOrder || !rejectReason.trim()) {
      showError('Alasan penolakan harus diisi');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tenant/orders/${selectedOrder.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      toast({ title: 'Berhasil', description: 'Pembayaran berhasil ditolak' });
      closeDialogs();
      fetchOrders();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      showError('Alasan pembatalan harus diisi');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/tenant/orders/${selectedOrder.id}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (!res.ok) throw new Error((await res.json()).error);

      toast({ title: 'Berhasil', description: 'Pesanan berhasil dibatalkan' });
      closeDialogs();
      fetchOrders();
    } catch (error: any) {
      showError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeDialogs = () => {
    setIsConfirmDialogOpen(false);
    setIsRejectDialogOpen(false);
    setIsCancelDialogOpen(false);
    setSelectedOrder(null);
    setRejectReason('');
    setCancelReason('');
  };

  const showError = (message: string) => {
    toast({ title: 'Error', description: message, variant: 'destructive' });
  };

  const getStats = () => ({
    all: orders.length,
    waitingConfirmation: orders.filter(o => o.status === 'WAITING_CONFIRMATION').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  });

  if (status === 'loading' || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Kelola Pesanan</h1>

        <OrderFilters
          activeTab={activeTab}
          searchQuery={searchQuery}
          onTabChange={setActiveTab}
          onSearchChange={setSearchQuery}
          stats={getStats()}
        />

        {filteredOrders.length === 0 ? (
          <EmptyState hasSearch={!!searchQuery} />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={(o) => { setSelectedOrder(o); setIsConfirmDialogOpen(true); }}
                onReject={(o) => { setSelectedOrder(o); setIsRejectDialogOpen(true); }}
                onCancel={(o) => { setSelectedOrder(o); setIsCancelDialogOpen(true); }}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={isConfirmDialogOpen}
          order={selectedOrder}
          isProcessing={isProcessing}
          onClose={closeDialogs}
          onConfirm={handleConfirmPayment}
        />

        <RejectDialog
          open={isRejectDialogOpen}
          rejectReason={rejectReason}
          isProcessing={isProcessing}
          onClose={closeDialogs}
          onReasonChange={setRejectReason}
          onReject={handleRejectPayment}
        />

        <CancelDialog
          open={isCancelDialogOpen}
          order={selectedOrder}
          cancelReason={cancelReason}
          isProcessing={isProcessing}
          onClose={closeDialogs}
          onReasonChange={setCancelReason}
          onCancel={handleCancelOrder}
        />
      </div>
    </div>
  );
}

// Helper Functions

function filterBySearch(orders: Order[], query: string): Order[] {
  const lowerQuery = query.toLowerCase();
  return orders.filter(
    o =>
      o.bookingNumber.toLowerCase().includes(lowerQuery) ||
      o.user.name.toLowerCase().includes(lowerQuery) ||
      o.room.property.name.toLowerCase().includes(lowerQuery)
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function EmptyState({ hasSearch }: { hasSearch: boolean }) {
  return (
    <div className="text-center py-12 text-slate-500">
      {hasSearch ? 'Tidak ada pesanan yang sesuai dengan pencarian' : 'Belum ada pesanan'}
    </div>
  );
}
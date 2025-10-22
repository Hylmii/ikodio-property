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

interface Order {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: 'WAITING_PAYMENT' | 'WAITING_CONFIRMATION' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentProof: string | null;
  paymentDeadline?: string | null;
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
      
      console.log('Fetch orders response:', response.ok);
      console.log('Fetch orders data:', data);
      
      if (response.ok) {
        setOrders(data.data || []);
        console.log('Orders set:', data.data?.length || 0);
      } else {
        console.error('Failed to fetch orders:', data);
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

  const handleRejectPayment = async () => {
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

  const getStats = () => ({
    all: orders.length,
    waitingConfirmation: orders.filter(o => o.status === 'WAITING_CONFIRMATION').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  });

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
        <h1 className="text-3xl font-bold mb-8">Kelola Pesanan</h1>

        <OrderFilters
          activeTab={activeTab}
          searchQuery={searchQuery}
          onTabChange={setActiveTab}
          onSearchChange={setSearchQuery}
          stats={getStats()}
        />

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            {searchQuery ? 'Tidak ada pesanan yang sesuai dengan pencarian' : 'Belum ada pesanan'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onConfirm={(order) => {
                  setSelectedOrder(order);
                  setIsConfirmDialogOpen(true);
                }}
                onReject={(order) => {
                  setSelectedOrder(order);
                  setIsRejectDialogOpen(true);
                }}
              />
            ))}
          </div>
        )}

        <ConfirmDialog
          open={isConfirmDialogOpen}
          order={selectedOrder}
          isProcessing={isProcessing}
          onClose={() => {
            setIsConfirmDialogOpen(false);
            setSelectedOrder(null);
          }}
          onConfirm={handleConfirmPayment}
        />

        <RejectDialog
          open={isRejectDialogOpen}
          rejectReason={rejectReason}
          isProcessing={isProcessing}
          onClose={() => {
            setIsRejectDialogOpen(false);
            setSelectedOrder(null);
            setRejectReason('');
          }}
          onReasonChange={setRejectReason}
          onReject={handleRejectPayment}
        />
      </div>
    </div>
  );
}

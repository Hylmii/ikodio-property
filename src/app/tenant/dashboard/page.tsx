'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, ShoppingBag, DollarSign, Star, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatPrice';

interface DashboardStats {
  totalProperties: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  recentOrders: Array<{
    id: string;
    bookingDate: string;
    totalPrice: number;
    status: string;
    user: {
      name: string;
    };
    room: {
      name: string;
      property: {
        name: string;
      };
    };
  }>;
}

export default function TenantDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchStats();
      }
    }
  }, [status]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [propertiesRes, ordersRes] = await Promise.all([
        fetch(`/api/properties?tenantId=${session?.user?.id}`),
        fetch('/api/tenant/orders'),
      ]);

      const propertiesData = await propertiesRes.json();
      const ordersData = await ordersRes.json();

      console.log('Properties response:', propertiesData);
      console.log('Orders response:', ordersData);

      if (propertiesRes.ok && ordersRes.ok) {
        const properties = propertiesData.data || [];
        const orders = ordersData.data || [];

        console.log('Properties count:', properties.length);
        console.log('Orders count:', orders.length);

        const totalRevenue = orders
          .filter((o: any) => o.status === 'CONFIRMED' || o.status === 'COMPLETED')
          .reduce((sum: number, o: any) => sum + o.totalPrice, 0);

        const ratingsCount = properties.reduce(
          (count: number, p: any) => count + (p._count?.reviews || 0),
          0
        );
        const totalRating = properties.reduce(
          (sum: number, p: any) => sum + (p.averageRating || 0) * (p._count?.reviews || 0),
          0
        );
        const averageRating = ratingsCount > 0 ? totalRating / ratingsCount : 0;

        setStats({
          totalProperties: properties.length,
          totalOrders: orders.length,
          totalRevenue,
          averageRating,
          recentOrders: orders.slice(0, 5),
        });
      } else {
        console.error('Error responses:', { propertiesData, ordersData });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-3xl font-bold mb-8">Dashboard Tenant</h1>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properti</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground">Properti aktif</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Semua pesanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(stats?.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">Revenue terkonfirmasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating Rata-rata</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">Dari semua review</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">Belum ada pesanan</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{order.room.property.name}</p>
                      <p className="text-sm text-muted-foreground">{order.room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.user.name}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-medium">{formatPrice(order.totalPrice)}</p>
                      <p className="text-sm text-muted-foreground">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

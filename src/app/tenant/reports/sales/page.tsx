'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, TrendingUp, Calendar, DollarSign, ShoppingCart } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';
import { formatPrice } from '@/lib/utils/formatPrice';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface SalesData {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  user: {
    name: string;
    email: string;
  };
  room: {
    name: string;
    property: {
      id: string;
      name: string;
    };
  };
}

interface Property {
  id: string;
  name: string;
}

interface SummaryStats {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  confirmedBookings: number;
}

export default function SalesReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [sales, setSales] = useState<SalesData[]>([]);
  const [filteredSales, setFilteredSales] = useState<SalesData[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedProperty, setSelectedProperty] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [groupBy, setGroupBy] = useState<'property' | 'transaction' | 'user'>('transaction');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');

  const [summary, setSummary] = useState<SummaryStats>({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    confirmedBookings: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchData();
      }
    }
  }, [status]);

  useEffect(() => {
    applyFilters();
  }, [sales, selectedProperty, startDate, endDate, sortBy]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesResponse, propertiesResponse] = await Promise.all([
        fetch('/api/reports/sales'),
        fetch('/api/properties?tenantOnly=true'),
      ]);

      const salesData = await salesResponse.json();
      const propertiesData = await propertiesResponse.json();

      if (salesResponse.ok) {
        setSales(salesData.data);
      }

      if (propertiesResponse.ok) {
        setProperties(propertiesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data laporan',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sales];

    if (selectedProperty !== 'all') {
      filtered = filtered.filter(sale => sale.room.property.id === selectedProperty);
    }

    if (startDate) {
      filtered = filtered.filter(sale => new Date(sale.bookingDate) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(sale => new Date(sale.bookingDate) <= new Date(endDate));
    }

    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
    } else {
      filtered.sort((a, b) => b.totalPrice - a.totalPrice);
    }

    setFilteredSales(filtered);
    calculateSummary(filtered);
  };

  const calculateSummary = (data: SalesData[]) => {
    const totalRevenue = data.reduce((sum, sale) => {
      if (sale.status === 'CONFIRMED' || sale.status === 'COMPLETED') {
        return sum + sale.totalPrice;
      }
      return sum;
    }, 0);

    const totalBookings = data.length;
    const confirmedBookings = data.filter(sale => sale.status === 'CONFIRMED' || sale.status === 'COMPLETED').length;
    const averageBookingValue = confirmedBookings > 0 ? totalRevenue / confirmedBookings : 0;

    setSummary({
      totalRevenue,
      totalBookings,
      averageBookingValue,
      confirmedBookings,
    });
  };

  const groupData = () => {
    if (groupBy === 'property') {
      const grouped = filteredSales.reduce((acc, sale) => {
        const propertyId = sale.room.property.id;
        const propertyName = sale.room.property.name;
        if (!acc[propertyId]) {
          acc[propertyId] = {
            name: propertyName,
            totalRevenue: 0,
            count: 0,
          };
        }
        if (sale.status === 'CONFIRMED' || sale.status === 'COMPLETED') {
          acc[propertyId].totalRevenue += sale.totalPrice;
        }
        acc[propertyId].count += 1;
        return acc;
      }, {} as Record<string, { name: string; totalRevenue: number; count: number }>);

      return Object.entries(grouped).map(([id, data]) => ({
        id,
        label: data.name,
        revenue: data.totalRevenue,
        count: data.count,
      }));
    } else if (groupBy === 'user') {
      const grouped = filteredSales.reduce((acc, sale) => {
        const userEmail = sale.user.email;
        const userName = sale.user.name;
        if (!acc[userEmail]) {
          acc[userEmail] = {
            name: userName,
            totalRevenue: 0,
            count: 0,
          };
        }
        if (sale.status === 'CONFIRMED' || sale.status === 'COMPLETED') {
          acc[userEmail].totalRevenue += sale.totalPrice;
        }
        acc[userEmail].count += 1;
        return acc;
      }, {} as Record<string, { name: string; totalRevenue: number; count: number }>);

      return Object.entries(grouped).map(([email, data]) => ({
        id: email,
        label: data.name,
        revenue: data.totalRevenue,
        count: data.count,
      }));
    } else {
      return filteredSales.map(sale => ({
        id: sale.id,
        label: `#${sale.id.slice(0, 8)}`,
        revenue: (sale.status === 'CONFIRMED' || sale.status === 'COMPLETED') ? sale.totalPrice : 0,
        count: 1,
        date: sale.bookingDate,
        user: sale.user.name,
        property: sale.room.property.name,
        room: sale.room.name,
        status: sale.status,
      }));
    }
  };

  const exportToCSV = () => {
    const headers = ['Tanggal', 'Properti', 'Kamar', 'Pelanggan', 'Check In', 'Check Out', 'Total', 'Status'];
    const rows = filteredSales.map(sale => [
      formatDate(sale.bookingDate),
      sale.room.property.name,
      sale.room.name,
      sale.user.name,
      formatDate(sale.checkInDate),
      formatDate(sale.checkOutDate),
      sale.totalPrice.toString(),
      sale.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Berhasil',
      description: 'Laporan berhasil diexport ke CSV',
    });
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const groupedData = groupData();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Laporan Penjualan</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Analisis pendapatan dan transaksi properti Anda
            </p>
          </div>
          <Button onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(summary.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">Dari pesanan terkonfirmasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pesanan</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalBookings}</div>
              <p className="text-xs text-muted-foreground">Semua status pesanan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatPrice(summary.averageBookingValue)}</div>
              <p className="text-xs text-muted-foreground">Per pesanan terkonfirmasi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pesanan Terkonfirmasi</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.confirmedBookings}</div>
              <p className="text-xs text-muted-foreground">Status CONFIRMED & COMPLETED</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Laporan</CardTitle>
            <CardDescription>Filter data berdasarkan kriteria tertentu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Properti</Label>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Properti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Properti</SelectItem>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              <div className="space-y-2">
                <Label>Urutkan Berdasarkan</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Tanggal</SelectItem>
                    <SelectItem value="total">Total Penjualan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <Label>Kelompokkan Berdasarkan</Label>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant={groupBy === 'transaction' ? 'default' : 'outline'}
                  onClick={() => setGroupBy('transaction')}
                >
                  Transaksi
                </Button>
                <Button
                  size="sm"
                  variant={groupBy === 'property' ? 'default' : 'outline'}
                  onClick={() => setGroupBy('property')}
                >
                  Properti
                </Button>
                <Button
                  size="sm"
                  variant={groupBy === 'user' ? 'default' : 'outline'}
                  onClick={() => setGroupBy('user')}
                >
                  Pelanggan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {groupBy === 'transaction' && 'Detail Transaksi'}
              {groupBy === 'property' && 'Laporan Per Properti'}
              {groupBy === 'user' && 'Laporan Per Pelanggan'}
            </CardTitle>
            <CardDescription>
              {filteredSales.length} {groupBy === 'transaction' ? 'transaksi' : 'data'} ditemukan
            </CardDescription>
          </CardHeader>
          <CardContent>
            {groupedData.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Tidak ada data untuk ditampilkan
              </div>
            ) : (
              <div className="overflow-x-auto">
                {groupBy === 'transaction' ? (
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                        <th className="pb-3 font-semibold">ID</th>
                        <th className="pb-3 font-semibold">Tanggal</th>
                        <th className="pb-3 font-semibold">Pelanggan</th>
                        <th className="pb-3 font-semibold">Properti</th>
                        <th className="pb-3 font-semibold">Kamar</th>
                        <th className="pb-3 font-semibold">Total</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData.map((item: any) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3 text-sm">#{item.id.slice(0, 8)}</td>
                          <td className="py-3 text-sm">{formatDate(item.date)}</td>
                          <td className="py-3 text-sm">{item.user}</td>
                          <td className="py-3 text-sm">{item.property}</td>
                          <td className="py-3 text-sm">{item.room}</td>
                          <td className="py-3 text-sm font-semibold">{formatPrice(item.revenue)}</td>
                          <td className="py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.status === 'COMPLETED' || item.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                        <th className="pb-3 font-semibold">
                          {groupBy === 'property' ? 'Nama Properti' : 'Nama Pelanggan'}
                        </th>
                        <th className="pb-3 font-semibold">Jumlah Pesanan</th>
                        <th className="pb-3 font-semibold">Total Pendapatan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData.map((item) => (
                        <tr key={item.id} className="border-b last:border-0">
                          <td className="py-3 text-sm">{item.label}</td>
                          <td className="py-3 text-sm">{item.count}</td>
                          <td className="py-3 text-sm font-semibold">{formatPrice(item.revenue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

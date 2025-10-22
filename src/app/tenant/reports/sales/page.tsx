'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';
import { SummaryCards } from '@/components/SalesReport/SummaryCards';
import { ReportFilters } from '@/components/SalesReport/ReportFilters';
import { SalesTable } from '@/components/SalesReport/SalesTable';

interface SalesData {
  id: string;
  bookingDate: string;
  checkInDate: string;
  checkOutDate: string;
  totalPrice: number;
  status: string;
  user: { name: string; email: string };
  room: {
    name: string;
    property: { id: string; name: string };
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

      if (salesResponse.ok) setSales(salesData.data);
      if (propertiesResponse.ok) setProperties(propertiesData.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengambil data laporan', variant: 'destructive' });
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

    setSummary({ totalRevenue, totalBookings, averageBookingValue, confirmedBookings });
  };

  const groupData = () => {
    if (groupBy === 'property') {
      const grouped = filteredSales.reduce((acc, sale) => {
        const propertyId = sale.room.property.id;
        if (!acc[propertyId]) {
          acc[propertyId] = { name: sale.room.property.name, totalRevenue: 0, count: 0 };
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
        if (!acc[userEmail]) {
          acc[userEmail] = { name: sale.user.name, totalRevenue: 0, count: 0 };
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

    toast({ title: 'Berhasil', description: 'Laporan berhasil diexport ke CSV' });
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

        <SummaryCards summary={summary} />

        <ReportFilters
          selectedProperty={selectedProperty}
          startDate={startDate}
          endDate={endDate}
          sortBy={sortBy}
          groupBy={groupBy}
          properties={properties}
          onPropertyChange={setSelectedProperty}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onSortChange={(value) => setSortBy(value as 'date' | 'total')}
          onGroupChange={(value) => setGroupBy(value as 'property' | 'transaction' | 'user')}
        />

        <SalesTable
          groupBy={groupBy}
          groupedData={groupedData}
          filteredSalesCount={filteredSales.length}
        />
      </div>
    </div>
  );
}

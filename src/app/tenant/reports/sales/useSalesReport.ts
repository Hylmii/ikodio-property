import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { applyFilters, calculateSummary, groupData } from './SalesReportHelpers';

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

export function useSalesReport() {
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

  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    averageBookingValue: 0,
    confirmedBookings: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = applyFilters(sales, selectedProperty, startDate, endDate, sortBy);
    setFilteredSales(filtered);
    setSummary(calculateSummary(filtered));
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
      showError();
    } finally {
      setIsLoading(false);
    }
  };

  const showError = () => {
    toast({
      title: 'Error',
      description: 'Gagal mengambil data laporan',
      variant: 'destructive',
    });
  };

  const exportToCSV = () => {
    const csvContent = generateCSV(filteredSales);
    downloadCSV(csvContent);
    showSuccess();
  };

  const generateCSV = (data: SalesData[]) => {
    const headers = ['Tanggal', 'Properti', 'Kamar', 'Pelanggan', 'Check In', 'Check Out', 'Total', 'Status'];
    const rows = data.map(formatCSVRow);
    return [headers.join(','), ...rows.map(row => row.map(cell => `"${cell}"`).join(','))].join('\n');
  };

  const formatCSVRow = (sale: SalesData) => [
    new Date(sale.bookingDate).toLocaleDateString('id-ID'),
    sale.room.property.name,
    sale.room.name,
    sale.user.name,
    new Date(sale.checkInDate).toLocaleDateString('id-ID'),
    new Date(sale.checkOutDate).toLocaleDateString('id-ID'),
    sale.totalPrice.toString(),
    sale.status,
  ];

  const downloadCSV = (content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const showSuccess = () => {
    toast({
      title: 'Berhasil',
      description: 'Laporan berhasil diexport ke CSV',
    });
  };

  const groupedData = groupData(filteredSales, groupBy);

  return {
    sales,
    filteredSales,
    properties,
    isLoading,
    selectedProperty,
    setSelectedProperty,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    groupBy,
    setGroupBy,
    sortBy,
    setSortBy,
    summary,
    groupedData,
    exportToCSV,
  };
}
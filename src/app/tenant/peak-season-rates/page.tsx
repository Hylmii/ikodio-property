'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils/formatDate';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Property {
  id: string;
  name: string;
}

interface PeakSeasonRate {
  id: string;
  startDate: string;
  endDate: string;
  adjustment: number;
  priceType: 'PERCENTAGE' | 'NOMINAL';
  property: {
    id: string;
    name: string;
  };
}

export default function PeakSeasonRatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [rates, setRates] = useState<PeakSeasonRate[]>([]);
  const [filteredRates, setFilteredRates] = useState<PeakSeasonRate[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<PeakSeasonRate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [propertyId, setPropertyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adjustment, setAdjustment] = useState(0);
  const [priceType, setPriceType] = useState<'PERCENTAGE' | 'NOMINAL'>('PERCENTAGE');

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
    filterRates();
  }, [rates, selectedPropertyId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [propertiesResponse, ratesResponse] = await Promise.all([
        fetch('/api/properties?tenantOnly=true'),
        fetch('/api/peak-season-rates'),
      ]);

      const propertiesData = await propertiesResponse.json();
      const ratesData = await ratesResponse.json();

      if (propertiesResponse.ok) {
        setProperties(propertiesData.data);
      }

      if (ratesResponse.ok) {
        setRates(ratesData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRates = () => {
    if (selectedPropertyId === 'all') {
      setFilteredRates(rates);
    } else {
      setFilteredRates(rates.filter(rate => rate.property.id === selectedPropertyId));
    }
  };

  const openDialog = (rate?: PeakSeasonRate) => {
    if (rate) {
      setEditingRate(rate);
      setPropertyId(rate.property.id);
      setStartDate(rate.startDate.split('T')[0]);
      setEndDate(rate.endDate.split('T')[0]);
      setAdjustment(rate.adjustment);
      setPriceType(rate.priceType);
    } else {
      setEditingRate(null);
      setPropertyId('');
      setStartDate('');
      setEndDate('');
      setAdjustment(0);
      setPriceType('PERCENTAGE');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!propertyId || !startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Semua field harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: 'Error',
        description: 'Tanggal mulai tidak boleh lebih dari tanggal akhir',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const data = {
        propertyId,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        adjustment,
        priceType,
      };

      const url = editingRate
        ? `/api/peak-season-rates/${editingRate.id}`
        : '/api/peak-season-rates';
      const method = editingRate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal menyimpan peak season rate');
      }

      toast({
        title: 'Berhasil',
        description: `Peak season rate berhasil ${editingRate ? 'diupdate' : 'ditambahkan'}`,
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus peak season rate ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/peak-season-rates/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus peak season rate');
      }

      toast({
        title: 'Berhasil',
        description: 'Peak season rate berhasil dihapus',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Peak Season Rates</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Kelola harga khusus untuk periode peak season
            </p>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Peak Season
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Label>Properti</Label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
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
          </CardContent>
        </Card>

        {filteredRates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-700 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Belum Ada Peak Season Rate</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Tambahkan peak season rate untuk menyesuaikan harga di periode tertentu
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Tambah Peak Season
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRates.map((rate) => (
              <Card key={rate.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{rate.property.name}</CardTitle>
                      <CardDescription className="mt-2">
                        {formatDate(rate.startDate)} - {formatDate(rate.endDate)}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDialog(rate)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(rate.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-blue-600">
                        {rate.priceType === 'PERCENTAGE' ? '+' : ''}
                        {rate.adjustment}
                      </span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {rate.priceType === 'PERCENTAGE' ? '%' : 'Rp'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {rate.priceType === 'PERCENTAGE' ? 'Kenaikan persentase' : 'Kenaikan nominal'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingRate ? 'Edit Peak Season Rate' : 'Tambah Peak Season Rate'}
              </DialogTitle>
              <DialogDescription>
                Atur harga khusus untuk periode peak season
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="property">Properti</Label>
                <Select value={propertyId} onValueChange={setPropertyId} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih properti" />
                  </SelectTrigger>
                  <SelectContent>
                    {properties.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Akhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priceType">Tipe Penyesuaian</Label>
                <Select value={priceType} onValueChange={(value: any) => setPriceType(value)} disabled={isSaving}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Persentase (%)</SelectItem>
                    <SelectItem value="NOMINAL">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjustment">
                  Nilai Penyesuaian {priceType === 'PERCENTAGE' ? '(%)' : '(Rp)'}
                </Label>
                <Input
                  id="adjustment"
                  type="number"
                  min="0"
                  value={adjustment}
                  onChange={(e) => setAdjustment(parseFloat(e.target.value) || 0)}
                  required
                  disabled={isSaving}
                  placeholder={priceType === 'PERCENTAGE' ? 'Contoh: 50 untuk 50%' : 'Contoh: 100000'}
                />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {priceType === 'PERCENTAGE'
                    ? 'Persentase kenaikan dari harga dasar'
                    : 'Jumlah nominal yang ditambahkan ke harga dasar'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

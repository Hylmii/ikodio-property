'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface Property {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  selectedProperty: string;
  startDate: string;
  endDate: string;
  sortBy: string;
  groupBy: string;
  properties: Property[];
  onPropertyChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onGroupChange: (value: string) => void;
}

export function ReportFilters({
  selectedProperty,
  startDate,
  endDate,
  sortBy,
  groupBy,
  properties,
  onPropertyChange,
  onStartDateChange,
  onEndDateChange,
  onSortChange,
  onGroupChange,
}: ReportFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filter Laporan</CardTitle>
        <CardDescription>Filter data berdasarkan kriteria tertentu</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Properti</Label>
            <Select value={selectedProperty} onValueChange={onPropertyChange}>
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
              onChange={(e) => onStartDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Tanggal Akhir</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Urutkan Berdasarkan</Label>
            <Select value={sortBy} onValueChange={onSortChange}>
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
              onClick={() => onGroupChange('transaction')}
            >
              Transaksi
            </Button>
            <Button
              size="sm"
              variant={groupBy === 'property' ? 'default' : 'outline'}
              onClick={() => onGroupChange('property')}
            >
              Properti
            </Button>
            <Button
              size="sm"
              variant={groupBy === 'user' ? 'default' : 'outline'}
              onClick={() => onGroupChange('user')}
            >
              Pelanggan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

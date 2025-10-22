'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';

interface PeakSeasonRate {
  id: string;
  startDate: string;
  endDate: string;
  rate: number;
  roomId: string;
  room: { name: string };
}

interface RateCardProps {
  rate: PeakSeasonRate;
  onEdit: (rate: PeakSeasonRate) => void;
  onDelete: (id: string) => void;
}

export function RateCard({ rate, onEdit, onDelete }: RateCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
    }).format(price);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{rate.room.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4" />
              {formatDate(rate.startDate)} - {formatDate(rate.endDate)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(rate)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(rate.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-2xl font-bold text-primary">
          <DollarSign className="h-6 w-6" />
          {formatPrice(rate.rate)}
          <span className="text-sm text-muted-foreground font-normal">/malam</span>
        </div>
      </CardContent>
    </Card>
  );
}

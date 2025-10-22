'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, ShoppingCart, TrendingUp, Calendar } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatPrice';

interface SummaryStats {
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  confirmedBookings: number;
}

interface SummaryCardsProps {
  summary: SummaryStats;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Pendapatan',
      value: formatPrice(summary.totalRevenue),
      description: 'Dari pesanan terkonfirmasi',
      icon: DollarSign,
    },
    {
      title: 'Total Pesanan',
      value: summary.totalBookings.toString(),
      description: 'Semua status pesanan',
      icon: ShoppingCart,
    },
    {
      title: 'Rata-rata Nilai',
      value: formatPrice(summary.averageBookingValue),
      description: 'Per pesanan terkonfirmasi',
      icon: TrendingUp,
    },
    {
      title: 'Pesanan Terkonfirmasi',
      value: summary.confirmedBookings.toString(),
      description: 'Status CONFIRMED & COMPLETED',
      icon: Calendar,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

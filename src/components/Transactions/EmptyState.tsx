'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  hasBookings: boolean;
}

export function EmptyState({ hasBookings }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <CreditCard className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {hasBookings ? 'Tidak Ada Hasil' : 'Belum Ada Transaksi'}
        </h3>
        <p className="text-muted-foreground mb-4">
          {hasBookings 
            ? 'Tidak ada transaksi yang sesuai dengan pencarian Anda' 
            : 'Anda belum memiliki transaksi apapun'}
        </p>
        {!hasBookings && (
          <Button asChild>
            <Link href="/properties">Cari Properti</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

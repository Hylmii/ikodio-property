import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Search } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  hasBookings: boolean;
}

export function EmptyState({ hasBookings }: EmptyStateProps) {
  if (!hasBookings) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum Ada Transaksi</h3>
          <p className="text-muted-foreground text-center mb-6">
            Anda belum memiliki transaksi. Mulai booking properti sekarang!
          </p>
          <Button asChild>
            <Link href="/properties">Cari Properti</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <Search className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Tidak Ada Hasil</h3>
        <p className="text-muted-foreground text-center">
          Tidak ada transaksi yang cocok dengan pencarian Anda
        </p>
      </CardContent>
    </Card>
  );
}
'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface OrderFiltersProps {
  activeTab: string;
  searchQuery: string;
  onTabChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  stats: {
    all: number;
    waitingConfirmation: number;
    confirmed: number;
    completed: number;
  };
}

export function OrderFilters({
  activeTab,
  searchQuery,
  onTabChange,
  onSearchChange,
  stats,
}: OrderFiltersProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Cari pesanan, nama tamu, atau properti..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            Semua ({stats.all})
          </TabsTrigger>
          <TabsTrigger value="WAITING_CONFIRMATION">
            Menunggu ({stats.waitingConfirmation})
          </TabsTrigger>
          <TabsTrigger value="CONFIRMED">
            Dikonfirmasi ({stats.confirmed})
          </TabsTrigger>
          <TabsTrigger value="COMPLETED">
            Selesai ({stats.completed})
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

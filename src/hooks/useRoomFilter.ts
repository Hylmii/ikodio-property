import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
}

export function useRoomFilter(rooms: Room[]) {
  const { toast } = useToast();
  const [filterDates, setFilterDates] = useState({ checkIn: '', checkOut: '' });
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filteredRoomIds, setFilteredRoomIds] = useState<string[]>([]);
  const [isLoadingFilter, setIsLoadingFilter] = useState(false);

  const applyFilter = async () => {
    if (!filterDates.checkIn || !filterDates.checkOut) return;

    setIsLoadingFilter(true);
    try {
      const available: string[] = [];
      for (const room of rooms) {
        const res = await fetch('/api/bookings/check-availability', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roomId: room.id,
            checkIn: filterDates.checkIn,
            checkOut: filterDates.checkOut,
          }),
        });
        const data = await res.json();
        if (data.available) {
          available.push(room.id);
        }
      }
      setFilteredRoomIds(available);
      setIsFilterActive(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to filter rooms',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFilter(false);
    }
  };

  const resetFilter = () => {
    setIsFilterActive(false);
    setFilteredRoomIds([]);
    setFilterDates({ checkIn: '', checkOut: '' });
  };

  return {
    filterDates,
    isFilterActive,
    filteredRoomIds,
    isLoadingFilter,
    setFilterDates,
    applyFilter,
    resetFilter,
  };
}

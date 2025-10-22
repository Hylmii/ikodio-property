import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useCompareRooms() {
  const { toast } = useToast();
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [compareDates, setCompareDates] = useState({ checkIn: '', checkOut: '' });
  const [isComparingPrices, setIsComparingPrices] = useState(false);
  const [compareResults, setCompareResults] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const toggleCompareSelection = (roomId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const compareRoomPrices = async () => {
    if (selectedForCompare.length < 2) {
      toast({
        title: 'Error',
        description: 'Please select at least 2 rooms to compare',
        variant: 'destructive',
      });
      return;
    }

    if (!compareDates.checkIn || !compareDates.checkOut) {
      toast({
        title: 'Error',
        description: 'Please select dates for comparison',
        variant: 'destructive',
      });
      return;
    }

    setIsComparingPrices(true);
    try {
      const res = await fetch('/api/rooms/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomIds: selectedForCompare,
          checkIn: compareDates.checkIn,
          checkOut: compareDates.checkOut,
        }),
      });
      const data = await res.json();
      setCompareResults(data);
      setShowCompareModal(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to compare prices',
        variant: 'destructive',
      });
    } finally {
      setIsComparingPrices(false);
    }
  };

  return {
    selectedForCompare,
    compareDates,
    isComparingPrices,
    compareResults,
    showCompareModal,
    setCompareDates,
    setShowCompareModal,
    toggleCompareSelection,
    compareRoomPrices,
  };
}

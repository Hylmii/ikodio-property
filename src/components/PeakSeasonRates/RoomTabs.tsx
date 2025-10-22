'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus } from 'lucide-react';

interface Room {
  id: string;
  name: string;
}

interface RoomTabsProps {
  rooms: Room[];
  selectedRoomId: string;
  onRoomChange: (roomId: string) => void;
  onAddRate: () => void;
}

export function RoomTabs({
  rooms,
  selectedRoomId,
  onRoomChange,
  onAddRate,
}: RoomTabsProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <Tabs value={selectedRoomId} onValueChange={onRoomChange}>
        <TabsList>
          {rooms.map((room) => (
            <TabsTrigger key={room.id} value={room.id}>
              {room.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <Button onClick={onAddRate}>
        <Plus className="mr-2 h-4 w-4" />
        Tambah Tarif
      </Button>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatPrice';

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

interface RoomListProps {
  rooms: Room[];
  onAdd: () => void;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
}

export function RoomList({ rooms, onAdd, onEdit, onDelete }: RoomListProps) {
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-slate-900 dark:text-white">Rooms</CardTitle>
          <Button 
            onClick={onAdd} 
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">No rooms added yet</p>
            <Button 
              onClick={onAdd} 
              variant="outline"
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Room
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="group border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-start bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">
                    {room.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {room.description}
                  </p>
                  <div className="flex gap-6 text-sm text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Capacity:</span> {room.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Price:</span> {formatPrice(room.basePrice)}/night
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(room)}
                    className="border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(room.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

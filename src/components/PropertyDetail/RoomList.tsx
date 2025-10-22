'use client';

import Image from 'next/image';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils/helpers';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
}

interface RoomListProps {
  rooms: Room[];
  selectedForCompare: string[];
  onCompareToggle: (roomId: string) => void;
  onBookClick: (room: Room) => void;
  onImageClick: (room: Room, index: number) => void;
  compareCount: number;
  onCompareClick: () => void;
  isComparingPrices: boolean;
}

export function RoomList({
  rooms,
  selectedForCompare,
  onCompareToggle,
  onBookClick,
  onImageClick,
  compareCount,
  onCompareClick,
  isComparingPrices,
}: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardContent className="py-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No rooms available for selected dates</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">Available Rooms</CardTitle>
            <CardDescription className="text-slate-600">Choose the perfect room for your stay</CardDescription>
          </div>
          {compareCount > 0 && (
            <Button
              onClick={onCompareClick}
              disabled={compareCount < 2 || isComparingPrices}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              Compare ({compareCount})
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isSelected={selectedForCompare.includes(room.id)}
            onToggle={() => onCompareToggle(room.id)}
            onBook={() => onBookClick(room)}
            onImageClick={(index: number) => onImageClick(room, index)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

function RoomCard({ room, isSelected, onToggle, onBook, onImageClick }: any) {
  return (
    <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggle}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <div className="flex-1">
              {/* Room Images Gallery */}
              {room.images && room.images.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {room.images.slice(0, 3).map((image: string, idx: number) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer group/img"
                      onClick={() => onImageClick(idx)}
                    >
                      <Image
                        src={image}
                        alt={`${room.name} - ${idx + 1}`}
                        fill
                        className="object-cover group-hover/img:scale-110 transition-transform"
                      />
                    </div>
                  ))}
                  {room.images.length > 3 && (
                    <div 
                      className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer bg-slate-900 flex items-center justify-center"
                      onClick={() => onImageClick(0)}
                    >
                      <span className="text-white font-bold">+{room.images.length - 3}</span>
                    </div>
                  )}
                </div>
              )}
              <h4 className="font-bold text-xl mb-2 text-slate-900 group-hover:text-slate-700 transition-colors">
                {room.name}
              </h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                {room.description}
              </p>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm bg-slate-100 px-3 py-1.5 rounded-full">
                  <Users className="h-4 w-4 text-slate-700" />
                  <span className="font-medium text-slate-700">{room.capacity} guests</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-slate-900">
                    {formatPrice(room.basePrice)}
                  </span>
                  <span className="text-sm text-slate-500">/night</span>
                </div>
              </div>
            </div>
          </div>
          <Button 
            onClick={onBook}
            size="lg"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Book Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

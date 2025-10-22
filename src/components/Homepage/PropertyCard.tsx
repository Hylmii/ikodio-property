'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Star, Users, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatPrice';

interface Room {
  id: string;
  basePrice: number;
  capacity: number;
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  rooms: Room[];
  averageRating: number;
  totalReviews: number;
}

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const getMinPrice = (rooms: Room[]) => {
    if (rooms.length === 0) return 0;
    return Math.min(...rooms.map(r => r.basePrice));
  };

  const getMaxCapacity = (rooms: Room[]) => {
    if (rooms.length === 0) return 0;
    return Math.max(...rooms.map(r => r.capacity || 0));
  };

  const minPrice = getMinPrice(property.rooms);
  const maxCapacity = getMaxCapacity(property.rooms);
  const imageUrl = property.images.length > 0 ? property.images[0] : '/placeholder.jpg';

  return (
    <Link href={`/properties/${property.id}`} className="group">
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white">
        <div className="relative h-72 overflow-hidden bg-slate-200">
          {property.images.length > 0 ? (
            <Image
              src={imageUrl}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200">
              <MapPin className="h-16 w-16 text-slate-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 text-white backdrop-blur-sm">
              {property.category.name}
            </span>
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="font-bold text-xl mb-1 text-white">{property.name}</h3>
            <div className="flex items-center gap-1 text-white/90">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">{property.city}, Indonesia</span>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
              <Star className="h-4 w-4 fill-slate-900 text-slate-900" />
              <span className="font-bold text-sm">
                {property.averageRating ? property.averageRating.toFixed(1) : 'New'}
              </span>
              {property.totalReviews > 0 && (
                <span className="text-xs text-slate-600">({property.totalReviews})</span>
              )}
            </div>
            {maxCapacity > 0 && (
              <div className="flex items-center gap-1 text-slate-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">{maxCapacity} guests</span>
              </div>
            )}
          </div>
          <p className="text-slate-600 text-sm mb-4 line-clamp-2">
            {property.description || 'Comfortable and modern property'}
          </p>
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span className="text-xs text-slate-500">Starting from</span>
              <p className="text-slate-900 font-bold text-2xl">
                {formatPrice(minPrice)}
                <span className="text-sm font-normal text-slate-500">/night</span>
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

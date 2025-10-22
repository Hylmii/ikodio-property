'use client';

import Image from 'next/image';
import { MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PropertyHeaderProps {
  property: {
    id: string;
    name: string;
    description: string;
    address: string;
    city: string;
    images: string[];
    category: { name: string };
    averageRating: number;
    totalReviews: number;
  };
  onImageClick: (index: number) => void;
}

export function PropertyHeader({ property, onImageClick }: PropertyHeaderProps) {
  const images = property.images || [];
  const hasImages = images.length > 0;

  return (
    <>
      {/* Hero Images */}
      {hasImages && (
        <div className="grid grid-cols-4 gap-4">
          <div 
            className="col-span-4 relative h-[500px] overflow-hidden rounded-2xl group shadow-lg cursor-pointer"
            onClick={() => onImageClick(0)}
          >
            <Image
              src={images[0]}
              alt={property.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-slate-900">
              {images.length} Photos
            </div>
          </div>
          {images.slice(1, 4).map((image, index) => (
            <div 
              key={index} 
              className="relative h-32 overflow-hidden rounded-xl group shadow-md cursor-pointer"
              onClick={() => onImageClick(index + 1)}
            >
              <Image
                src={image}
                alt={`${property.name} - ${index + 2}`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Property Info Card */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4">
            {/* Category Badge */}
            {property.category && (
              <div className="inline-flex w-fit px-3 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 text-white backdrop-blur-sm">
                {property.category.name}
              </div>
            )}
            
            {/* Title and Location */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-3xl md:text-4xl mb-3 font-bold text-slate-900 break-words">
                  {property.name}
                </CardTitle>
                <div className="flex items-center text-slate-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">{property.address}, {property.city}</span>
                </div>
              </div>
              
              {/* Rating Badge */}
              {property.totalReviews > 0 && (
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full flex-shrink-0">
                  <Star className="h-4 w-4 fill-slate-900 text-slate-900" />
                  <span className="font-bold text-sm">{property.averageRating?.toFixed(1) || 0}</span>
                  <span className="text-xs text-slate-600">({property.totalReviews})</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="border-t border-slate-100 pt-6">
            <h3 className="font-bold text-xl mb-3 text-slate-900">About This Property</h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

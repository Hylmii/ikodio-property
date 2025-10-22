'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2, ArrowRight } from 'lucide-react';
import { PropertyCard } from './PropertyCard';

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
  rooms: {
    id: string;
    basePrice: number;
    capacity: number;
  }[];
  averageRating: number;
  totalReviews: number;
}

export function FeaturedProperties() {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);

  useEffect(() => {
    fetchFeaturedProperties();
  }, []);

  const fetchProperties = async () => {
    setIsLoadingProperties(true);
    try {
      const response = await fetch('/api/properties?page=1&limit=6&sortBy=createdAt');
      const data = await response.json();
      
      if (response.ok) {
        setFeaturedProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoadingProperties(false);
    }
  };

  const fetchFeaturedProperties = fetchProperties;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium mb-4">
            <Star className="h-4 w-4 fill-slate-700" />
            <span>Featured Properties</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Properti Pilihan
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Temukan destinasi terbaik dengan fasilitas lengkap dan harga kompetitif
          </p>
        </div>

        {isLoadingProperties ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-slate-900 mx-auto mb-4" />
              <p className="text-slate-600">Loading properties...</p>
            </div>
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-500 text-lg">No properties available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}

        <div className="text-center mt-16">
          <Button 
            size="lg" 
            className="bg-slate-900 hover:bg-slate-800 text-white px-10 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all group" 
            asChild
          >
            <Link href="/properties" className="flex items-center gap-2">
              View All Properties
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

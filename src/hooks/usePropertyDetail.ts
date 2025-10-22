import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface Room {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  images: string[];
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; profileImage: string | null };
  reply: { comment: string; createdAt: string } | null;
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: { name: string };
  rooms: Room[];
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export function usePropertyDetail(propertyId: string) {
  const router = useRouter();
  const { toast } = useToast();
  const [property, setProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProperty();
  }, [propertyId]);

  const fetchProperty = async () => {
    try {
      const res = await fetch(`/api/properties/${propertyId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setProperty(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load property',
        variant: 'destructive',
      });
      router.push('/properties');
    } finally {
      setIsLoading(false);
    }
  };

  return { property, isLoading, refetch: fetchProperty };
}

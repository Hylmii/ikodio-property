'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { PropertyCard } from '@/components/TenantProperties/PropertyCard';
import { EmptyState } from '@/components/TenantProperties/EmptyState';

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: { id: string; name: string };
  _count: { rooms: number };
}

export default function TenantPropertiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchProperties();
      }
    }
  }, [status]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/properties');
      const data = await response.json();
      if (response.ok) setProperties(data.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (propertyId: string, propertyName: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus properti "${propertyName}"? Semua room yang terkait juga akan dihapus.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus properti');
      }

      toast({ title: 'Berhasil', description: 'Properti berhasil dihapus' });
      fetchProperties();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Properti Saya
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Kelola semua properti yang Anda miliki
            </p>
          </div>
          <Button 
            asChild
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Link href="/tenant/properties/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Properti
            </Link>
          </Button>
        </div>

        {properties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, Pencil, Trash2, MapPin, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
  _count: {
    rooms: number;
  };
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

      if (response.ok) {
        setProperties(data.data);
      }
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

      toast({
        title: 'Berhasil',
        description: 'Properti berhasil dihapus',
      });

      fetchProperties();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
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
            <h1 className="text-3xl font-bold">Properti Saya</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Kelola semua properti yang Anda miliki
            </p>
          </div>
          <Button asChild>
            <Link href="/tenant/properties/create">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Properti
            </Link>
          </Button>
        </div>

        {properties.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Belum Ada Properti</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 text-center">
                Mulai dengan menambahkan properti pertama Anda
              </p>
              <Button asChild>
                <Link href="/tenant/properties/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Properti
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  {property.images.length > 0 ? (
                    <Image
                      src={property.images[0]}
                      alt={property.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                      <ImageIcon className="h-16 w-16 text-slate-400 dark:text-slate-600" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold">
                    {property.category.name}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {property.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <span className="line-clamp-1">{property.address}, {property.city}</span>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {property._count.rooms} room tersedia
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/tenant/properties/${property.id}`}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(property.id, property.name)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

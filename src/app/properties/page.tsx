'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Search, MapPin, Star, Loader2, Filter } from 'lucide-react';
import { formatPrice } from '@/lib/utils/formatPrice';

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
  }[];
  averageRating: number;
  totalReviews: number;
}

export default function PropertiesPage() {
  const { toast } = useToast();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProperties();
  }, [searchQuery, city, sortBy, page]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        ...(searchQuery && { search: searchQuery }),
        ...(city && { city }),
        sortBy,
      });

      const response = await fetch(`/api/properties?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengambil data properti');
      }

      setProperties(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getMinPrice = (rooms: any[]) => {
    if (rooms.length === 0) return 0;
    return Math.min(...rooms.map(r => r.basePrice));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Temukan Properti Impian</h1>
          <p className="text-blue-100 text-lg">
            Jelajahi berbagai pilihan properti terbaik yang tersedia untuk Anda
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 -mt-16">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Cari nama properti..."
                className="pl-12 h-14 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 shadow-lg text-base"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>

          <div>
            <Select
              value={city || 'all'}
              onValueChange={(value) => {
                setCity(value === 'all' ? '' : value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-14 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 shadow-lg text-base">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Pilih Kota" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kota</SelectItem>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="Bandung">Bandung</SelectItem>
                <SelectItem value="Surabaya">Surabaya</SelectItem>
                <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                <SelectItem value="Bali">Bali</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={sortBy}
              onValueChange={(value) => {
                setSortBy(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-14 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 shadow-lg text-base">
                <SelectValue placeholder="Urutkan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Terbaru</SelectItem>
                <SelectItem value="name">Nama A-Z</SelectItem>
                <SelectItem value="price-asc">Harga Terendah</SelectItem>
                <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Memuat properti...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <Card className="py-16 border-2 border-dashed">
            <CardContent className="text-center">
              <MapPin className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Tidak Ada Properti</h3>
              <p className="text-slate-600 dark:text-slate-400">Tidak ada properti yang sesuai dengan pencarian Anda</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {properties.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`} className="group">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-blue-500 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="relative h-56 w-full overflow-hidden">
                      {property.images.length > 0 ? (
                        <Image
                          src={property.images[0]}
                          alt={property.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                          <MapPin className="h-16 w-16 text-slate-400 dark:text-slate-600" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold">
                        {property.category.name}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {property.name}
                        </h3>
                        {property.totalReviews > 0 && (
                          <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold">
                              {property.averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 text-sm">
                        {property.description}
                      </p>
                      <div className="flex items-center text-slate-600 dark:text-slate-400 mb-4">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="text-sm">{property.city}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {formatPrice(getMinPrice(property.rooms))}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">/malam</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="font-semibold"
                >
                  Previous
                </Button>
                <div className="px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border-2">
                  <span className="font-semibold">
                    Halaman {page} dari {totalPages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="font-semibold"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

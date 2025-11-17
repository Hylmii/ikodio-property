'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BasicInfoForm } from '@/components/PropertyCreate/BasicInfoForm';
import { FacilitiesForm } from '@/components/PropertyCreate/FacilitiesForm';
import { ImagesUploadSection } from '@/components/PropertyCreate/ImagesUploadSection';

interface Category {
  id: string;
  name: string;
}

export default function CreatePropertyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [facilities, setFacilities] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated' && session.user.role !== 'TENANT') {
      router.push('/');
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi field wajib
    if (!name || !description || !category || !address || !city || !province) {
      toast({ title: 'Error', description: 'Semua field informasi dasar harus diisi', variant: 'destructive' });
      return;
    }

    // Validasi latitude longitude
    if (!latitude || !longitude) {
      toast({ title: 'Error', description: 'Latitude dan Longitude harus diisi', variant: 'destructive' });
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast({ title: 'Error', description: 'Latitude dan Longitude harus berupa angka yang valid', variant: 'destructive' });
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast({ title: 'Error', description: 'Koordinat tidak valid. Lat: -90 s/d 90, Lng: -180 s/d 180', variant: 'destructive' });
      return;
    }

    if (images.length === 0) {
      toast({ title: 'Error', description: 'Upload minimal 1 foto properti', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        categoryId: category,
        address: address.trim(),
        city: city.trim(),
        province: province.trim(),
        latitude: lat,
        longitude: lng,
        images,
      };

      console.log('Submitting property:', payload);

      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.error || 'Gagal membuat properti');
      }

      toast({ title: 'Berhasil', description: 'Properti berhasil dibuat' });
      router.push('/tenant/properties');
    } catch (error: any) {
      console.error('Submit error:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/tenant/properties">
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Tambah Properti Baru
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Lengkapi informasi properti yang akan Anda tambahkan
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          <BasicInfoForm
            name={name}
            description={description}
            category={category}
            address={address}
            city={city}
            province={province}
            latitude={latitude}
            longitude={longitude}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onCategoryChange={setCategory}
            onAddressChange={setAddress}
            onCityChange={setCity}
            onProvinceChange={setProvince}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
          />

          <FacilitiesForm facilities={facilities} onChange={setFacilities} />

          <ImagesUploadSection images={images} onChange={setImages} />

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/tenant/properties">
              <Button 
                type="button" 
                variant="outline"
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Batal
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Properti
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

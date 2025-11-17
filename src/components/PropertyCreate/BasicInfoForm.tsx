import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getCoordinates } from "@/lib/utils/geocoding";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface BasicInfoFormProps {
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  province: string;
  latitude: string;
  longitude: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onProvinceChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
}

export function BasicInfoForm({
  name,
  description,
  category,
  address,
  city,
  province,
  latitude,
  longitude,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onAddressChange,
  onCityChange,
  onProvinceChange,
  onLatitudeChange,
  onLongitudeChange,
}: BasicInfoFormProps) {
  const [isLoadingGeo, setIsLoadingGeo] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await fetch('/api/categories?limit=100');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };
  
  const handleGetCoordinates = async () => {
    if (!city) {
      alert('Silakan isi kota terlebih dahulu');
      return;
    }
    
    setIsLoadingGeo(true);
    try {
      const result = await getCoordinates(city, province || 'Indonesia');
      if (result) {
        onLatitudeChange(result.latitude.toString());
        onLongitudeChange(result.longitude.toString());
      } else {
        alert('Gagal mendapatkan koordinat. Silakan isi manual.');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mendapatkan koordinat');
    } finally {
      setIsLoadingGeo(false);
    }
  };
  
  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-4">
        <CardTitle className="text-slate-900 dark:text-white">Informasi Dasar</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Lengkapi informasi dasar properti Anda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
            Nama Properti *
          </Label>
          <Input
            id="name"
            placeholder="Contoh: Villa Sunset Bali"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">
            Deskripsi *
          </Label>
          <Textarea
            id="description"
            placeholder="Deskripsikan properti Anda"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            rows={5}
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
            Kategori *
          </Label>
          <Select 
            value={category || undefined} 
            onValueChange={onCategoryChange}
            disabled={isLoadingCategories}
          >
            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
              <SelectValue placeholder={isLoadingCategories ? "Loading..." : "Pilih kategori"} />
            </SelectTrigger>
            <SelectContent>
              {categories.length === 0 && !isLoadingCategories && (
                <div className="text-sm text-slate-500 p-2">
                  Tidak ada kategori. Buat kategori terlebih dahulu.
                </div>
              )}
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">
            Alamat *
          </Label>
          <Input
            id="address"
            placeholder="Jl. Raya Ubud No. 123"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="city" className="text-slate-700 dark:text-slate-300 font-medium">
              Kota *
            </Label>
            <Input
              id="city"
              placeholder="Bali"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="province" className="text-slate-700 dark:text-slate-300 font-medium">
              Provinsi *
            </Label>
            <Input
              id="province"
              placeholder="Bali"
              value={province}
              onChange={(e) => onProvinceChange(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="latitude" className="text-slate-700 dark:text-slate-300 font-medium">
              Latitude *
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="-8.4095"
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="longitude" className="text-slate-700 dark:text-slate-300 font-medium">
              Longitude *
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="115.1889"
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
              className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleGetCoordinates}
            disabled={isLoadingGeo || !city}
            variant="outline"
            className="gap-2"
          >
            {isLoadingGeo ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Mengambil koordinat...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                Ambil Koordinat Otomatis
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

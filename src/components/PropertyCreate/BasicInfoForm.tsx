import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BasicInfoFormProps {
  name: string;
  description: string;
  category: string;
  address: string;
  city: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
}

export function BasicInfoForm({
  name,
  description,
  category,
  address,
  city,
  postalCode,
  latitude,
  longitude,
  onNameChange,
  onDescriptionChange,
  onCategoryChange,
  onAddressChange,
  onCityChange,
  onPostalCodeChange,
  onLatitudeChange,
  onLongitudeChange,
}: BasicInfoFormProps) {
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
          <Select value={category || undefined} onValueChange={onCategoryChange}>
            <SelectTrigger className="bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HOTEL">Hotel</SelectItem>
              <SelectItem value="VILLA">Villa</SelectItem>
              <SelectItem value="APARTMENT">Apartment</SelectItem>
              <SelectItem value="GUESTHOUSE">Guesthouse</SelectItem>
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
            <Label htmlFor="postalCode" className="text-slate-700 dark:text-slate-300 font-medium">
              Kode Pos *
            </Label>
            <Input
              id="postalCode"
              placeholder="80571"
              value={postalCode}
              onChange={(e) => onPostalCodeChange(e.target.value)}
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
      </CardContent>
    </Card>
  );
}

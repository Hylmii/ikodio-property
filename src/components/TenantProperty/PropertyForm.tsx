'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
}

interface PropertyFormProps {
  name: string;
  onNameChange: (value: string) => void;
  categoryId: string;
  onCategoryChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  address: string;
  onAddressChange: (value: string) => void;
  city: string;
  onCityChange: (value: string) => void;
  categories: Category[];
  cities: string[];
}

export function PropertyForm({
  name,
  onNameChange,
  categoryId,
  onCategoryChange,
  description,
  onDescriptionChange,
  address,
  onAddressChange,
  city,
  onCityChange,
  categories,
  cities
}: PropertyFormProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
          Property Name
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Enter property name"
          className="bg-white dark:bg-slate-700"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="category" className="text-slate-700 dark:text-slate-300 font-medium">
          Category
        </Label>
        <Select 
          value={categoryId || undefined} 
          onValueChange={onCategoryChange} 
          required
        >
          <SelectTrigger id="category" className="bg-white dark:bg-slate-700">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter property description"
          rows={4}
          className="bg-white dark:bg-slate-700"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-medium">
          Address
        </Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="Enter property address"
          className="bg-white dark:bg-slate-700"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="city" className="text-slate-700 dark:text-slate-300 font-medium">
          City
        </Label>
        <Select 
          value={city || undefined} 
          onValueChange={onCityChange} 
          required
        >
          <SelectTrigger id="city" className="bg-white dark:bg-slate-700">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((cityName) => (
              <SelectItem key={cityName} value={cityName}>
                {cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

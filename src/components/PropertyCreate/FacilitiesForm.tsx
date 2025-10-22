'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

const AVAILABLE_FACILITIES = [
  'WiFi',
  'AC',
  'TV',
  'Parkir',
  'Kolam Renang',
  'Gym',
  'Restaurant',
  'Laundry',
  'Room Service',
  'Security 24/7',
];

interface FacilitiesFormProps {
  facilities: string[];
  onChange: (facilities: string[]) => void;
}

export function FacilitiesForm({ facilities, onChange }: FacilitiesFormProps) {
  const handleToggleFacility = (facility: string) => {
    if (facilities.includes(facility)) {
      onChange(facilities.filter(f => f !== facility));
    } else {
      onChange([...facilities, facility]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <Label className="text-slate-900 dark:text-white font-semibold text-lg">
        Fasilitas Properti
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {AVAILABLE_FACILITIES.map((facility) => (
          <div key={facility} className="flex items-center space-x-2">
            <Checkbox
              id={facility}
              checked={facilities.includes(facility)}
              onCheckedChange={() => handleToggleFacility(facility)}
              className="border-slate-300 dark:border-slate-600"
            />
            <label
              htmlFor={facility}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-slate-700 dark:text-slate-300"
            >
              {facility}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Image from 'next/image';

interface ImageUploaderProps {
  existingImages: string[];
  newImages: File[];
  onNewImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveExisting: (index: number) => void;
  onRemoveNew: (index: number) => void;
}

export function ImageUploader({
  existingImages,
  newImages,
  onNewImageChange,
  onRemoveExisting,
  onRemoveNew
}: ImageUploaderProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <div>
        <Label htmlFor="images" className="text-slate-700 dark:text-slate-300 font-medium">
          Property Images
        </Label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Upload up to 10 images</p>
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
          <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            PNG, JPG, GIF up to 1MB each
          </p>
          <Input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={onNewImageChange}
            className="cursor-pointer mt-4"
          />
        </div>
      </div>

      {(existingImages.length > 0 || newImages.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
          {existingImages.map((img, idx) => (
            <div key={`existing-${idx}`} className="relative group">
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                <Image
                  src={img}
                  alt={`Property ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => onRemoveExisting(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {newImages.map((file, idx) => (
            <div key={`new-${idx}`} className="relative group">
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`New ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                onClick={() => onRemoveNew(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

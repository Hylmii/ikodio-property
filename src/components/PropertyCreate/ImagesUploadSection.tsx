'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImagesUploadSectionProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImagesUploadSection({ images, onChange }: ImagesUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'property');

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          uploadedUrls.push(data.data.url);
        }
      }

      onChange([...images, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <Label className="text-slate-900 dark:text-white font-semibold text-lg">
        Foto Properti
      </Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700">
              <Image
                src={image}
                alt={`Property ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              onClick={() => handleRemoveImage(index)}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <label
          htmlFor="image-upload"
          className="aspect-square border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
          ) : (
            <>
              <Upload className="h-10 w-10 text-slate-400 dark:text-slate-500 mb-2" />
              <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Upload Foto</span>
            </>
          )}
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
            disabled={isUploading}
          />
        </label>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Upload minimal 1 foto. Format: JPG, PNG (max 1MB per foto)
      </p>
    </div>
  );
}

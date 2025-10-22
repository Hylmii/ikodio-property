'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ImageGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export function ImageGallery({ 
  isOpen, 
  onClose, 
  images, 
  title, 
  currentIndex, 
  onIndexChange 
}: ImageGalleryProps) {
  const handleNext = () => {
    onIndexChange((currentIndex + 1) % images.length);
  };

  const handlePrevious = () => {
    onIndexChange((currentIndex - 1 + images.length) % images.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 bg-slate-900">
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-slate-900 to-transparent p-6 flex items-center justify-between">
            <div className="text-white">
              <h3 className="font-bold text-xl">{title}</h3>
              <p className="text-sm text-slate-300">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Main Image */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            <div className="relative w-full h-full">
              <Image
                src={images[currentIndex]}
                alt={`${title} - ${currentIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full p-3 shadow-lg transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full p-3 shadow-lg transition-all"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Thumbnails */}
          <div className="bg-slate-800 p-4 overflow-x-auto">
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => onIndexChange(index)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all ${
                    currentIndex === index 
                      ? 'ring-4 ring-white scale-110' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

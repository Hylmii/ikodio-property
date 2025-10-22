import { useState } from 'react';

export function useGallery() {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryTitle, setGalleryTitle] = useState('');

  const openGallery = (images: string[], index: number, title: string) => {
    setGalleryImages(images);
    setSelectedImageIndex(index);
    setGalleryTitle(title);
    setIsGalleryOpen(true);
  };

  const closeGallery = () => {
    setIsGalleryOpen(false);
  };

  return {
    selectedImageIndex,
    isGalleryOpen,
    galleryImages,
    galleryTitle,
    setSelectedImageIndex,
    openGallery,
    closeGallery,
  };
}

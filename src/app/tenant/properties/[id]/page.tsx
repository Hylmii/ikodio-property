'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PropertyForm } from '@/components/TenantProperty/PropertyForm';
import { ImageUploader } from '@/components/TenantProperty/ImageUploader';
import { RoomList } from '@/components/TenantProperty/RoomList';
import { RoomDialog } from '@/components/TenantProperty/RoomDialog';

interface Category {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  categoryId: string;
  images: string[];
  rooms: Room[];
}

export default function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const cities = ['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Bali', 'Medan', 'Semarang', 'Makassar'];
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchProperty();
        fetchCategories();
      }
    }
  }, [status]);

  const fetchProperty = async () => {
    try {
      const response = await fetch(`/api/properties/${resolvedParams.id}`);
      const data = await response.json();

      if (response.ok) {
        setProperty(data.data);
        setName(data.data.name);
        setCategoryId(data.data.categoryId);
        setDescription(data.data.description);
        setAddress(data.data.address);
        setCity(data.data.city);
        setExistingImages(data.data.images);
        setRooms(data.data.rooms || []);
      } else {
        toast({ title: 'Error', description: 'Properti tidak ditemukan', variant: 'destructive' });
        router.push('/tenant/properties');
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengambil data properti', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (response.ok) setCategories(data.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + newImages.length + files.length;

      if (totalImages > 5) {
        toast({ title: 'Error', description: 'Maksimal 5 gambar', variant: 'destructive' });
        return;
      }

      for (const file of files) {
        if (file.size > 1024 * 1024) {
          toast({ title: 'Error', description: `File ${file.name} terlalu besar. Maksimal 1MB`, variant: 'destructive' });
          return;
        }
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
          toast({ title: 'Error', description: `File ${file.name} bukan format gambar yang valid`, variant: 'destructive' });
          return;
        }
      }

      setNewImages([...newImages, ...files]);
    }
  };

  const removeExistingImage = (index: number) => setExistingImages(existingImages.filter((_, i) => i !== index));
  const removeNewImage = (index: number) => setNewImages(newImages.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (existingImages.length + newImages.length === 0) {
      toast({ title: 'Error', description: 'Minimal 1 gambar diperlukan', variant: 'destructive' });
      return;
    }
    if (!categoryId) {
      toast({ title: 'Error', description: 'Kategori harus dipilih', variant: 'destructive' });
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('categoryId', categoryId);
      formData.append('description', description);
      formData.append('address', address);
      formData.append('city', city);
      formData.append('existingImages', JSON.stringify(existingImages));
      newImages.forEach((image) => formData.append('newImages', image));

      const response = await fetch(`/api/properties/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengupdate properti');

      toast({ title: 'Berhasil', description: 'Properti berhasil diupdate' });
      router.push('/tenant/properties');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const openRoomDialog = (room?: Room) => {
    setEditingRoom(room || { name: '', description: '', capacity: 1, basePrice: 0 });
    setIsRoomDialogOpen(true);
  };

  const handleRoomChange = (field: string, value: string | number) => {
    setEditingRoom((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveRoom = async (room: Partial<Room>) => {
    if (!room.name?.trim()) {
      toast({ title: 'Error', description: 'Nama kamar harus diisi', variant: 'destructive' });
      return;
    }
    if ((room.capacity || 0) < 1) {
      toast({ title: 'Error', description: 'Kapasitas minimal 1 orang', variant: 'destructive' });
      return;
    }
    if ((room.basePrice || 0) < 0) {
      toast({ title: 'Error', description: 'Harga harus positif', variant: 'destructive' });
      return;
    }

    try {
      const roomData = { ...room, propertyId: resolvedParams.id };
      const url = room.id ? `/api/rooms/${room.id}` : '/api/rooms';
      const method = room.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan kamar');

      toast({ title: 'Berhasil', description: `Kamar berhasil ${room.id ? 'diupdate' : 'ditambahkan'}` });
      setIsRoomDialogOpen(false);
      fetchProperty();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kamar ini?')) return;

    try {
      const response = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menghapus kamar');

      toast({ title: 'Berhasil', description: 'Kamar berhasil dihapus' });
      fetchProperty();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/tenant/properties">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar Properti
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Properti</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Update informasi properti Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          <PropertyForm
            name={name}
            categoryId={categoryId}
            description={description}
            address={address}
            city={city}
            categories={categories}
            cities={cities}
            onNameChange={setName}
            onCategoryChange={setCategoryId}
            onDescriptionChange={setDescription}
            onAddressChange={setAddress}
            onCityChange={setCity}
          />

          <ImageUploader
            existingImages={existingImages}
            newImages={newImages}
            onNewImageChange={handleNewImageChange}
            onRemoveExisting={removeExistingImage}
            onRemoveNew={removeNewImage}
          />

          <RoomList
            rooms={rooms}
            onAdd={() => openRoomDialog()}
            onEdit={openRoomDialog}
            onDelete={handleDeleteRoom}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Link href="/tenant/properties">
              <Button 
                type="button" 
                variant="outline" 
                disabled={isSaving}
                className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Batal
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>

        <RoomDialog
          open={isRoomDialogOpen}
          room={editingRoom}
          onClose={() => setIsRoomDialogOpen(false)}
          onSave={handleSaveRoom}
          onChange={handleRoomChange}
        />
      </div>
    </div>
  );
}

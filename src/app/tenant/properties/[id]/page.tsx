'use client';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, Upload, X, Plus, Pencil, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomName, setRoomName] = useState('');
  const [roomDescription, setRoomDescription] = useState('');
  const [roomCapacity, setRoomCapacity] = useState(1);
  const [roomBasePrice, setRoomBasePrice] = useState(0);
  const [isSavingRoom, setIsSavingRoom] = useState(false);

  const cities = [
    'Jakarta',
    'Bandung',
    'Surabaya',
    'Yogyakarta',
    'Bali',
    'Medan',
    'Semarang',
    'Malang',
  ];

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
        toast({
          title: 'Error',
          description: 'Properti tidak ditemukan',
          variant: 'destructive',
        });
        router.push('/tenant/properties');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Gagal mengambil data properti',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();

      if (response.ok) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const totalImages = existingImages.length + newImages.length + files.length;

      if (totalImages > 5) {
        toast({
          title: 'Error',
          description: 'Maksimal 5 gambar',
          variant: 'destructive',
        });
        return;
      }

      for (const file of files) {
        if (file.size > 1024 * 1024) {
          toast({
            title: 'Error',
            description: `File ${file.name} terlalu besar. Maksimal 1MB`,
            variant: 'destructive',
          });
          return;
        }

        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(file.type)) {
          toast({
            title: 'Error',
            description: `File ${file.name} bukan format gambar yang valid`,
            variant: 'destructive',
          });
          return;
        }
      }

      setNewImages([...newImages, ...files]);
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast({
        title: 'Error',
        description: 'Minimal 1 gambar diperlukan',
        variant: 'destructive',
      });
      return;
    }

    if (!categoryId) {
      toast({
        title: 'Error',
        description: 'Kategori harus dipilih',
        variant: 'destructive',
      });
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

      newImages.forEach((image) => {
        formData.append('newImages', image);
      });

      const response = await fetch(`/api/properties/${resolvedParams.id}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupdate properti');
      }

      toast({
        title: 'Berhasil',
        description: 'Properti berhasil diupdate',
      });

      router.push('/tenant/properties');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openRoomDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setRoomName(room.name);
      setRoomDescription(room.description);
      setRoomCapacity(room.capacity);
      setRoomBasePrice(room.basePrice);
    } else {
      setEditingRoom(null);
      setRoomName('');
      setRoomDescription('');
      setRoomCapacity(1);
      setRoomBasePrice(0);
    }
    setIsRoomDialogOpen(true);
  };

  const handleSaveRoom = async () => {
    if (!roomName.trim()) {
      toast({
        title: 'Error',
        description: 'Nama kamar harus diisi',
        variant: 'destructive',
      });
      return;
    }

    if (roomCapacity < 1) {
      toast({
        title: 'Error',
        description: 'Kapasitas minimal 1 orang',
        variant: 'destructive',
      });
      return;
    }

    if (roomBasePrice < 0) {
      toast({
        title: 'Error',
        description: 'Harga harus positif',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingRoom(true);

    try {
      const roomData = {
        name: roomName,
        description: roomDescription,
        capacity: roomCapacity,
        basePrice: roomBasePrice,
        propertyId: resolvedParams.id,
      };

      const url = editingRoom
        ? `/api/rooms/${editingRoom.id}`
        : '/api/rooms';
      const method = editingRoom ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan kamar');
      }

      toast({
        title: 'Berhasil',
        description: `Kamar berhasil ${editingRoom ? 'diupdate' : 'ditambahkan'}`,
      });

      setIsRoomDialogOpen(false);
      fetchProperty();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kamar ini?')) {
      return;
    }

    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal menghapus kamar');
      }

      toast({
        title: 'Berhasil',
        description: 'Kamar berhasil dihapus',
      });

      fetchProperty();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return null;
  }

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
          <h1 className="text-3xl font-bold">Edit Properti</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Update informasi properti Anda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Informasi utama tentang properti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Properti</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Villa Bali Indah"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={categoryId} onValueChange={setCategoryId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {categories.length === 0 && (
                  <p className="text-sm text-amber-600">
                    Belum ada kategori. Silakan buat kategori terlebih dahulu.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Deskripsikan properti Anda..."
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lokasi</CardTitle>
              <CardDescription>Detail lokasi properti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Kota</Label>
                <Select value={city} onValueChange={setCity} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kota" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((cityOption) => (
                      <SelectItem key={cityOption} value={cityOption}>
                        {cityOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gambar Properti</CardTitle>
              <CardDescription>Upload hingga 5 gambar (maks. 1MB per gambar)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {existingImages.length + newImages.length < 5 && (
                <div>
                  <Label htmlFor="images" className="cursor-pointer">
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-slate-400" />
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        Klik untuk upload gambar
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        JPG, PNG, atau GIF (Maks. 1MB)
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="images"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif"
                    multiple
                    onChange={handleNewImageChange}
                    className="hidden"
                  />
                </div>
              )}

              {(existingImages.length > 0 || newImages.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className="relative group">
                      <div className="relative h-32 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-800">
                        <Image
                          src={image}
                          alt={`Gambar ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {newImages.map((file, index) => (
                    <div key={`new-${index}`} className="relative group">
                      <div className="relative h-32 rounded-lg overflow-hidden border-2 border-blue-500">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Gambar baru ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Baru
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Kamar</CardTitle>
                  <CardDescription>Kelola kamar dalam properti ini</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={() => openRoomDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Kamar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {rooms.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Belum ada kamar. Tambahkan kamar pertama Anda.
                </div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold">{room.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {room.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-slate-500">
                          <span>Kapasitas: {room.capacity} orang</span>
                          <span>Harga: Rp {room.basePrice.toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openRoomDialog(room)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/tenant/properties">
              <Button type="button" variant="outline" disabled={isSaving}>
                Batal
              </Button>
            </Link>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>

        <Dialog open={isRoomDialogOpen} onOpenChange={setIsRoomDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Kamar' : 'Tambah Kamar Baru'}</DialogTitle>
              <DialogDescription>
                {editingRoom ? 'Update informasi kamar' : 'Tambahkan kamar baru ke properti'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="roomName">Nama Kamar</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Contoh: Deluxe Room"
                  required
                  disabled={isSavingRoom}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomDescription">Deskripsi</Label>
                <Textarea
                  id="roomDescription"
                  value={roomDescription}
                  onChange={(e) => setRoomDescription(e.target.value)}
                  placeholder="Deskripsi kamar..."
                  rows={3}
                  disabled={isSavingRoom}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roomCapacity">Kapasitas (orang)</Label>
                  <Input
                    id="roomCapacity"
                    type="number"
                    min="1"
                    value={roomCapacity}
                    onChange={(e) => setRoomCapacity(parseInt(e.target.value) || 1)}
                    required
                    disabled={isSavingRoom}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomBasePrice">Harga (Rp)</Label>
                  <Input
                    id="roomBasePrice"
                    type="number"
                    min="0"
                    value={roomBasePrice}
                    onChange={(e) => setRoomBasePrice(parseInt(e.target.value) || 0)}
                    required
                    disabled={isSavingRoom}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRoomDialogOpen(false)}
                disabled={isSavingRoom}
              >
                Batal
              </Button>
              <Button onClick={handleSaveRoom} disabled={isSavingRoom}>
                {isSavingRoom && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSavingRoom ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

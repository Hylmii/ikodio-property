import { useState } from 'react';

export interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  basePrice: number;
}

export function usePropertyHandlers(
  propertyId: string,
  onSuccess: () => void,
  onError: (message: string) => void
) {
  const [isSaving, setIsSaving] = useState(false);

  const saveProperty = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal mengupdate properti');
      onSuccess();
    } catch (error: any) {
      onError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const saveRoom = async (room: Partial<Room>, fetchProperty: () => void) => {
    try {
      const roomData = { ...room, propertyId };
      const url = room.id ? `/api/rooms/${room.id}` : '/api/rooms';
      const method = room.id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menyimpan kamar');

      fetchProperty();
      return true;
    } catch (error: any) {
      onError(error.message);
      return false;
    }
  };

  const deleteRoom = async (roomId: string, fetchProperty: () => void) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal menghapus kamar');
      fetchProperty();
      return true;
    } catch (error: any) {
      onError(error.message);
      return false;
    }
  };

  return { isSaving, saveProperty, saveRoom, deleteRoom };
}

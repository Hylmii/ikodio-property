'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';
import { PropertyRoomSelectors } from '@/components/CalendarReport/PropertyRoomSelectors';
import { EmptyCalendarState } from '@/components/CalendarReport/EmptyCalendarState';

interface Property {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  basePrice: number;
}

export default function PropertyCalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchProperties();
      }
    }
  }, [status]);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchRooms();
    } else {
      setRooms([]);
      setSelectedRoomId('');
    }
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/properties?tenantOnly=true');
      const data = await response.json();
      if (response.ok) setProperties(data.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({ title: 'Error', description: 'Failed to fetch properties', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`/api/properties/${selectedPropertyId}`);
      const data = await response.json();
      if (response.ok && data.data.rooms) setRooms(data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Property Availability Calendar</h1>
          <p className="text-slate-600 mt-1">
            View room availability and booking status by date
          </p>
        </div>

        <Card className="mb-8 shadow-lg border-slate-200">
          <CardHeader className="bg-white border-b border-slate-200">
            <CardTitle className="text-slate-900">Select Property & Room</CardTitle>
            <CardDescription className="text-slate-600">
              Choose a property and room to view the availability calendar
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <PropertyRoomSelectors
              properties={properties}
              rooms={rooms}
              selectedPropertyId={selectedPropertyId}
              selectedRoomId={selectedRoomId}
              onPropertyChange={setSelectedPropertyId}
              onRoomChange={setSelectedRoomId}
            />
          </CardContent>
        </Card>

        {selectedPropertyId && selectedRoomId && (
          <AvailabilityCalendar
            propertyId={selectedPropertyId}
            roomId={selectedRoomId}
          />
        )}

        <EmptyCalendarState
          hasProperties={properties.length > 0}
          hasSelection={!!selectedPropertyId}
        />
      </div>
    </div>
  );
}

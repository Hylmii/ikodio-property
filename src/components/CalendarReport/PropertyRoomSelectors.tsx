import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Property {
  id: string;
  name: string;
}

interface Room {
  id: string;
  name: string;
  basePrice: number;
}

interface PropertyRoomSelectorsProps {
  properties: Property[];
  rooms: Room[];
  selectedPropertyId: string;
  selectedRoomId: string;
  onPropertyChange: (value: string) => void;
  onRoomChange: (value: string) => void;
}

export function PropertyRoomSelectors({
  properties,
  rooms,
  selectedPropertyId,
  selectedRoomId,
  onPropertyChange,
  onRoomChange,
}: PropertyRoomSelectorsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label className="text-slate-700 font-semibold">Property</Label>
        <Select value={selectedPropertyId} onValueChange={onPropertyChange}>
          <SelectTrigger className="border-slate-300 focus:ring-slate-900">
            <SelectValue placeholder="Select Property" />
          </SelectTrigger>
          <SelectContent>
            {properties.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700 font-semibold">Room</Label>
        <Select
          value={selectedRoomId}
          onValueChange={onRoomChange}
          disabled={!selectedPropertyId || rooms.length === 0}
        >
          <SelectTrigger className="border-slate-300 focus:ring-slate-900">
            <SelectValue placeholder={rooms.length === 0 ? 'Select property first' : 'Select Room'} />
          </SelectTrigger>
          <SelectContent>
            {rooms.map(room => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Property {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  images: string[];
  category: {
    id: string;
    name: string;
  };
  _count: {
    rooms: number;
  };
}

interface PropertyCardProps {
  property: Property;
  onDelete: (id: string, name: string) => void;
}

export function PropertyCard({ property, onDelete }: PropertyCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        {property.images.length > 0 ? (
          <Image
            src={property.images[0]}
            alt={property.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
            <ImageIcon className="h-16 w-16 text-slate-400 dark:text-slate-600" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold">
          {property.category.name}
        </div>
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {property.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
          <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
          <span className="line-clamp-1">{property.address}, {property.city}</span>
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {property._count.rooms} room tersedia
        </div>
        <div className="flex gap-2 pt-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/tenant/properties/${property.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(property.id, property.name)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

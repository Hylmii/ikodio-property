import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ProfileHeaderProps {
  name: string;
  email: string;
  avatar?: string;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ name, email, avatar, onAvatarChange }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-6 mb-8">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="text-2xl">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <label htmlFor="avatar" className="absolute bottom-0 right-0 cursor-pointer">
          <Button size="icon" variant="secondary" className="rounded-full h-8 w-8" asChild>
            <div>
              <Upload className="h-4 w-4" />
              <input
                id="avatar"
                type="file"
                accept="image/*"
                onChange={onAvatarChange}
                className="hidden"
              />
            </div>
          </Button>
        </label>
      </div>
      <div>
        <h1 className="text-3xl font-bold mb-1">{name}</h1>
        <p className="text-slate-500">{email}</p>
      </div>
    </div>
  );
}

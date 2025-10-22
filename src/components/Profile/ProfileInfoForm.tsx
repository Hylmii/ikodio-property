import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ProfileInfoFormProps {
  name: string;
  email: string;
  phone: string;
  isLoading: boolean;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
}

export function ProfileInfoForm({
  name,
  email,
  phone,
  isLoading,
  onNameChange,
  onPhoneChange,
  onSubmit,
}: ProfileInfoFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Profil</CardTitle>
        <CardDescription>Update informasi profil Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nama Lengkap</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Nama lengkap"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Nomor Telepon</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="08xxxxxxxxxx"
          />
        </div>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Simpan Perubahan
        </Button>
      </CardContent>
    </Card>
  );
}

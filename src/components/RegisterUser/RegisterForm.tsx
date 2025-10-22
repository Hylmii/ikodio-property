import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Phone, Lock } from 'lucide-react';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

interface RegisterFormProps {
  formData: RegisterFormData;
  isLoading: boolean;
  onChange: (field: keyof RegisterFormData, value: string) => void;
}

export function RegisterForm({ formData, isLoading, onChange }: RegisterFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Lengkap</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="pl-10"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            placeholder="nama@example.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Nomor Telepon</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="08123456789"
            className="pl-10"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Minimal 6 karakter"
            className="pl-10"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            className="pl-10"
            value={formData.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>
      </div>
    </div>
  );
}

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

interface TenantRegisterFormProps {
  formData: RegisterFormData;
  isLoading: boolean;
  onChange: (field: keyof RegisterFormData, value: string) => void;
}

export function TenantRegisterForm({ formData, isLoading, onChange }: TenantRegisterFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white font-medium">Nama Lengkap</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-white/70" />
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
            value={formData.name}
            onChange={(e) => onChange('name', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white font-medium">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/70" />
          <Input
            id="email"
            type="email"
            placeholder="nama@example.com"
            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-white font-medium">Nomor Telepon</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-white/70" />
          <Input
            id="phone"
            type="tel"
            placeholder="08123456789"
            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
            value={formData.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white font-medium">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
          <Input
            id="password"
            type="password"
            placeholder="Minimal 6 karakter"
            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
            value={formData.password}
            onChange={(e) => onChange('password', e.target.value)}
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white font-medium">Konfirmasi Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Ulangi password"
            className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
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

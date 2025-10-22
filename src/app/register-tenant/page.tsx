'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Loader2 } from 'lucide-react';
import { TenantRegisterForm } from '@/components/RegisterTenant/TenantRegisterForm';
import { TenantRegisterLinks } from '@/components/RegisterTenant/TenantRegisterLinks';

export default function RegisterTenantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Password dan konfirmasi password tidak sama',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register-tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registrasi gagal');
      }

      toast({
        title: 'Registrasi Berhasil',
        description: 'Silakan cek email Anda untuk verifikasi akun',
      });

      setTimeout(() => {
        router.push('/login-tenant');
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Registrasi Gagal',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Daftar sebagai Tenant</CardTitle>
          <CardDescription className="text-center">
            Mulai kelola dan sewakan properti Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <TenantRegisterForm
              formData={formData}
              isLoading={isLoading}
              onChange={handleFieldChange}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Mendaftar...' : 'Daftar'}
            </Button>
          </form>
          <TenantRegisterLinks />
        </CardContent>
      </Card>
    </div>
  );
}

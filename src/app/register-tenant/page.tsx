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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-800"></div>
      
      {/* Subtle animated overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Modern card */}
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md"></div>
              <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-full shadow-lg border border-white/30">
                <Building2 className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
            Daftar Tenant
          </CardTitle>
          <CardDescription className="text-base text-white/90 font-medium">
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
            <Button 
              type="submit" 
              className="w-full bg-white hover:bg-white/90 text-emerald-600 font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-0" 
              disabled={isLoading}
            >
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

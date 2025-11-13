'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Lock, Loader2 } from 'lucide-react';

export default function LoginTenantPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('tenant-credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Check if error is about unverified email
        const isUnverifiedError = result.error.includes('belum diverifikasi');
        
        toast({
          title: 'Login Gagal',
          description: result.error,
          variant: 'destructive',
          action: isUnverifiedError ? (
            <button
              onClick={() => router.push('/resend-verification')}
              className="text-xs underline"
            >
              Kirim Ulang
            </button>
          ) : undefined,
        });
      } else {
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali!',
        });
        router.push('/tenant/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat login',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-slate-900 dark:via-emerald-900 dark:to-teal-900 px-4 py-12 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-xl dark:bg-slate-800/90 relative z-10">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur-lg opacity-75 animate-pulse"></div>
              <div className="relative p-4 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-full shadow-lg">
                <Building2 className="h-14 w-14 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Portal Tenant
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-slate-300">
            Login untuk mengelola properti Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                  placeholder="Masukkan password"
                  className="pl-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register-tenant" className="text-primary hover:underline font-medium">
                Daftar sekarang
              </Link>
            </p>
            <p className="mt-2 text-muted-foreground">
              Email belum terverifikasi?{' '}
              <Link href="/resend-verification" className="text-primary hover:underline font-medium">
                Kirim ulang link verifikasi
              </Link>
            </p>
            <p className="mt-2 text-muted-foreground">
              Login sebagai user?{' '}
              <Link href="/login-user" className="text-primary hover:underline font-medium">
                Klik di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

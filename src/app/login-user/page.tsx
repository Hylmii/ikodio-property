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
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

export default function LoginUserPage() {
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

    console.log('🔐 Login attempt with:', formData.email);

    try {
      const result = await signIn('user-credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('📊 SignIn result:', result);

      if (result?.error) {
        console.error('❌ Login error:', result.error);
        
        // Check if error is about unverified email
        const isUnverifiedError = result.error.includes('belum diverifikasi');
        
        toast({
          title: 'Login Gagal',
          description: result.error === 'CredentialsSignin' 
            ? 'Email atau password salah' 
            : result.error,
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
      } else if (result?.ok) {
        console.log('✅ Login successful');
        toast({
          title: 'Login Berhasil',
          description: 'Selamat datang kembali!',
        });
        router.push('/profile');
        router.refresh();
      } else {
        console.warn('⚠️ Unexpected result:', result);
        toast({
          title: 'Error',
          description: 'Terjadi kesalahan yang tidak terduga',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('💥 Exception during login:', error);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-12">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
              <Building2 className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Login sebagai User
          </CardTitle>
          <CardDescription className="text-center text-base">
            Masukkan email dan password untuk melanjutkan
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/reset-password" className="text-xs text-blue-600 hover:underline">
                  Lupa password?
                </Link>
              </div>
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>

          <SocialLoginButtons callbackUrl="/profile" />

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              Belum punya akun?{' '}
              <Link href="/register-user" className="text-primary hover:underline font-medium">
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
              Login sebagai tenant?{' '}
              <Link href="/login-tenant" className="text-primary hover:underline font-medium">
                Klik di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

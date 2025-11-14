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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700"></div>
      
      {/* Animated mesh gradient overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Glass card */}
      <Card className="w-full max-w-md border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl relative z-10">
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
            Selamat Datang
          </CardTitle>
          <CardDescription className="text-base text-white/90 font-medium">
            Login untuk melanjutkan ke akun Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white font-medium">Password</Label>
                <Link href="/reset-password" className="text-xs text-white/90 hover:text-white hover:underline font-medium">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-white/70" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  className="pl-10 bg-white/20 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/50"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-white hover:bg-white/90 text-blue-600 font-bold shadow-lg hover:shadow-xl transition-all duration-200 border-0" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/30" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/10 backdrop-blur-sm px-2 text-white/80 font-medium">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>

          <SocialLoginButtons callbackUrl="/profile" />

          <div className="mt-6 text-center text-sm space-y-2">
            <p className="text-white/90">
              Belum punya akun?{' '}
              <Link href="/register-user" className="text-white hover:underline font-bold">
                Daftar sekarang
              </Link>
            </p>
            <p className="text-white/90">
              Email belum terverifikasi?{' '}
              <Link href="/resend-verification" className="text-white hover:underline font-bold">
                Kirim ulang link verifikasi
              </Link>
            </p>
            <p className="text-white/90">
              Login sebagai tenant?{' '}
              <Link href="/login-tenant" className="text-white hover:underline font-bold">
                Klik di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

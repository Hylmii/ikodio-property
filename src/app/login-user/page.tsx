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
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800"></div>
      
      {/* Subtle animated overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-slate-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Modern card */}
      <Card className="w-full max-w-md border border-white/10 bg-white/5 backdrop-blur-3xl shadow-2xl relative z-10">
        <CardHeader className="space-y-1 pb-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-2xl blur-xl"></div>
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-xl">
                <Building2 className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-slate-300">
            Sign in to continue to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200 font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@example.com"
                  className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-cyan-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-200 font-medium">Password</Label>
                <Link href="/reset-password" className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-medium">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  className="pl-10 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:border-cyan-500"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-slate-400 font-medium">
                Atau lanjutkan dengan
              </span>
            </div>
          </div>

          <SocialLoginButtons callbackUrl="/profile" />

          <div className="mt-6 text-center text-sm space-y-2">
            <p className="text-slate-300">
              Belum punya akun?{' '}
              <Link href="/register-user" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold">
                Daftar sekarang
              </Link>
            </p>
            <p className="text-slate-300">
              Email belum terverifikasi?{' '}
              <Link href="/resend-verification" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold">
                Kirim ulang link verifikasi
              </Link>
            </p>
            <p className="text-slate-300">
              Login sebagai tenant?{' '}
              <Link href="/login-tenant" className="text-cyan-400 hover:text-cyan-300 hover:underline font-semibold">
                Klik di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

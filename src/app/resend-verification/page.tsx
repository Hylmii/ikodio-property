'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ResendVerificationPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: 'Error',
        description: 'Email wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Format email tidak valid',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengirim email verifikasi');
      }

      setIsSuccess(true);
      toast({
        title: 'Berhasil',
        description: data.message || 'Email verifikasi telah dikirim',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                Email Terkirim!
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Kami telah mengirim link verifikasi baru ke email Anda
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Silakan cek inbox atau folder spam Anda
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                 Link akan kedaluwarsa dalam 1 jam
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Email dikirim ke: <span className="font-semibold">{email}</span>
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/login-user')}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Kembali ke Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Kirim ke Email Lain
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/login-user"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Login
        </Link>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
              <Mail className="h-8 w-8 text-slate-900 dark:text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
              Kirim Ulang Verifikasi
            </CardTitle>
            <CardDescription className="text-base">
              Masukkan email Anda untuk menerima link verifikasi baru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 dark:text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@contoh.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-12 text-base"
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <span className="font-semibold">Catatan:</span> Link verifikasi akan dikirim ke email yang terdaftar dan belum diverifikasi.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-base font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Kirim Link Verifikasi
                  </>
                )}
              </Button>

              <div className="text-center space-y-2 pt-4 border-t">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sudah verifikasi?{' '}
                  <Link
                    href="/login-user"
                    className="font-semibold text-slate-900 dark:text-white hover:underline"
                  >
                    Login di sini
                  </Link>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Belum punya akun?{' '}
                  <Link
                    href="/register-user"
                    className="font-semibold text-slate-900 dark:text-white hover:underline"
                  >
                    Daftar sekarang
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

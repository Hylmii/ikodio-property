'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { VerificationSuccess } from '@/components/VerifyEmail/VerificationSuccess';
import { VerificationError } from '@/components/VerifyEmail/VerificationError';
import { PasswordForm } from '@/components/VerifyEmail/PasswordForm';

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    console.log('🔍 [CLIENT] Starting token verification...');
    console.log('🔍 [CLIENT] Token:', token?.substring(0, 20) + '...');
    
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      console.log('📊 [CLIENT] Response status:', response.status);
      console.log('📊 [CLIENT] Response data:', data);

      if (response.ok) {
        console.log('✅ [CLIENT] Token is valid');
        setEmail(data.data.email);
        if (data.data.isVerified) {
          console.log('ℹ️  [CLIENT] User already verified');
          setStatus('success');
        } else {
          console.log('📝 [CLIENT] User needs to set password, showing form');
          // Status stays as 'loading' to show password form
        }
      } else {
        console.error('❌ [CLIENT] Token validation failed:', data.error);
        if (response.status === 400 && data.error?.includes('sudah diverifikasi')) {
          console.log('ℹ️  [CLIENT] User already verified (from error)');
          setStatus('success');
        } else if (response.status === 410 || data.error?.includes('kadaluarsa')) {
          console.log('⏰ [CLIENT] Token expired');
          setStatus('expired');
        } else {
          console.log('❌ [CLIENT] Invalid token');
          setStatus('error');
        }
      }
    } catch (error) {
      console.error('💥 [CLIENT] Exception during verification:', error);
      setStatus('error');
    }
  };

  const handleSubmit = async () => {
    console.log('📝 [CLIENT] Starting password submission...');
    
    if (!password || !confirmPassword) {
      console.log('❌ [CLIENT] Missing password fields');
      toast({ title: 'Error', description: 'Semua field harus diisi', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ [CLIENT] Password mismatch');
      toast({ title: 'Error', description: 'Password tidak cocok', variant: 'destructive' });
      return;
    }

    if (password.length < 8) {
      console.log('❌ [CLIENT] Password too short');
      toast({ title: 'Error', description: 'Password minimal 8 karakter', variant: 'destructive' });
      return;
    }

    console.log('✅ [CLIENT] Password validation passed');
    console.log('📤 [CLIENT] Sending POST request...');
    console.log('📤 [CLIENT] Data:', { token: token?.substring(0, 10) + '...', passwordLength: password.length, confirmPasswordLength: confirmPassword.length });
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();
      
      console.log('📊 [CLIENT] POST Response status:', response.status);
      console.log('📊 [CLIENT] POST Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Verifikasi gagal');
      }

      console.log('✅ [CLIENT] Verification successful!');
      toast({ title: 'Berhasil', description: 'Email berhasil diverifikasi!' });
      setStatus('success');

      console.log('🔄 [CLIENT] Redirecting to login in 2 seconds...');
      setTimeout(() => {
        router.push('/login-user');
      }, 2000);
    } catch (error: any) {
      console.error('❌ [CLIENT] Verification failed:', error);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="w-full max-w-md">
        {status === 'loading' && email && (
          <PasswordForm
            email={email}
            password={password}
            confirmPassword={confirmPassword}
            isSubmitting={isSubmitting}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onSubmit={handleSubmit}
          />
        )}

        {status === 'loading' && !email && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {status === 'success' && <VerificationSuccess />}

        {(status === 'error' || status === 'expired') && (
          <VerificationError
            message={
              status === 'expired'
                ? 'Link verifikasi telah kadaluarsa. Silakan minta link baru.'
                : 'Link verifikasi tidak valid. Silakan coba lagi.'
            }
          />
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, Lock, Loader2, Eye, EyeOff, User } from 'lucide-react';
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons';

export default function LoginUserPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('🔐 Login attempt with:', formData.email);

    try {
      console.log('🔐 Attempting login with:', formData.email);
      const result = await signIn('user-credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('📊 SignIn result:', result);
      console.log('📊 Result type:', typeof result);
      console.log('📊 Has error?', result?.error ? 'YES' : 'NO');

      if (result?.error) {
        console.error('❌ Login error:', result.error);
        console.error('❌ Error type:', typeof result.error);
        
        // Check if error is about unverified email
        const isUnverifiedError = result.error.includes('belum diverifikasi');
        
        // Map error messages
        let errorMessage = 'Email atau password salah';
        
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Email atau password salah';
        } else if (result.error === 'Configuration') {
          errorMessage = 'Email atau password salah';
        } else if (result.error.includes('belum diverifikasi')) {
          errorMessage = result.error;
        } else if (result.error.includes('salah')) {
          errorMessage = result.error;
        } else if (result.error.includes('social login')) {
          errorMessage = result.error;
        } else if (result.error) {
          errorMessage = result.error;
        }
        
        console.log('🔔 Calling toast with:', { title: 'Login Gagal', description: errorMessage });
        toast({
          title: 'Login Gagal',
          description: errorMessage,
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
    <div className="min-h-screen flex">
      {/* Left Side - Hero Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 relative overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          {/* Brand */}
          <div className="mb-12">
            <h1 className="text-5xl font-black tracking-tight mb-4">IKODIO</h1>
            <div className="w-20 h-1 bg-cyan-400 rounded-full"></div>
          </div>

          <h2 className="text-4xl font-bold mb-4 leading-tight">Find Your Perfect Stay</h2>
          <p className="text-xl opacity-90 mb-12">Compare prices across dates and book the best accommodation for your next adventure.</p>
          
          {/* Testimonial Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="flex mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
              ))}
            </div>
            <p className="text-sm mb-4 leading-relaxed">"Ikodio helped me find amazing deals for my vacation. The booking process was seamless and customer service was outstanding!"</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center font-semibold">
                SJ
              </div>
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm opacity-75">Verified Guest</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-2">
              IKODIO
            </h1>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/60 p-8 lg:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
              <p className="text-slate-600">Sign in to continue to your account</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <Label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="w-full h-12 pl-12 pr-4 border-[1.5px] border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                    Password
                  </Label>
                  <Link href="/reset-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full h-12 pl-12 pr-12 border-[1.5px] border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                className="w-full h-13 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/40 transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-4 text-slate-500 tracking-wider font-medium">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <SocialLoginButtons callbackUrl="/profile" />
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-2 text-sm text-slate-600">
              <p>
                Don't have an account?{' '}
                <Link href="/register-user" className="text-blue-600 font-medium hover:text-blue-700">
                  Sign up
                </Link>
              </p>
              <p>
                Email not verified?{' '}
                <Link href="/resend-verification" className="text-blue-600 font-medium hover:text-blue-700">
                  Resend verification
                </Link>
              </p>
              <p>
                Login as tenant?{' '}
                <Link href="/login-tenant" className="text-blue-600 font-medium hover:text-blue-700">
                  Click here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

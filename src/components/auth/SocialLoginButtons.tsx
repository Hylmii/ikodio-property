'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SocialLoginButtonsProps {
  callbackUrl?: string;
}

export function SocialLoginButtons({ callbackUrl = '/' }: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error('Social login error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('google')}
        disabled={!!isLoading}
      >
        {isLoading === 'google' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FcGoogle className="mr-2 h-5 w-5" />
        )}
        Continue with Google
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('facebook')}
        disabled={!!isLoading}
      >
        {isLoading === 'facebook' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaFacebook className="mr-2 h-5 w-5 text-[#1877F2]" />
        )}
        Continue with Facebook
      </Button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => handleSocialLogin('twitter')}
        disabled={!!isLoading}
      >
        {isLoading === 'twitter' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FaTwitter className="mr-2 h-5 w-5 text-[#1DA1F2]" />
        )}
        Continue with X (Twitter)
      </Button>
    </div>
  );
}

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

function ErrorNotificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const error = searchParams.get('error');
    const message = searchParams.get('message');
    
    if (error) {
      toast({
        title: 'Akses Ditolak',
        description: error,
        variant: 'destructive',
        duration: 6000,
      });
      
      // Remove error from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('error');
      router.replace(url.pathname + url.search);
    }
    
    if (message) {
      toast({
        title: 'Informasi',
        description: message,
        duration: 5000,
      });
      
      // Remove message from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, toast, router]);

  return null;
}

export function ErrorNotification() {
  return (
    <Suspense fallback={null}>
      <ErrorNotificationContent />
    </Suspense>
  );
}

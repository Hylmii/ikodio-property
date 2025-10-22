'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { ReviewCard } from '@/components/Reviews/ReviewCard';
import { ReviewReplyDialog } from '@/components/Reviews/ReviewReplyDialog';
import { EmptyReviews } from '@/components/Reviews/EmptyReviews';

interface Property {
  id: string;
  name: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    profilePicture?: string | null;
  };
  reply?: {
    comment: string;
    createdAt: Date;
  } | null;
}

export default function TenantReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login-tenant');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'TENANT') {
        router.push('/');
      } else {
        fetchProperties();
      }
    }
  }, [status]);

  useEffect(() => {
    if (selectedPropertyId) {
      fetchReviews();
    } else {
      setReviews([]);
    }
  }, [selectedPropertyId]);

  const fetchProperties = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/properties?tenantOnly=true');
      const data = await response.json();

      if (response.ok) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const response = await fetch(`/api/reviews?propertyId=${selectedPropertyId}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat review',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleReply = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setReplyDialogOpen(true);
  };

  const handleReplySuccess = () => {
    fetchReviews();
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Review Properti</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Kelola review dari pelanggan Anda
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Pilih Properti</CardTitle>
            <CardDescription>
              Pilih properti untuk melihat review
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Properti</Label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih properti" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedPropertyId && (
          <div className="space-y-4">
            {isLoadingReviews ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : reviews.length === 0 ? (
              <EmptyReviews />
            ) : (
              reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  canReply={true}
                  onReply={() => handleReply(review.id)}
                />
              ))
            )}
          </div>
        )}

        {!selectedPropertyId && properties.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-slate-600 dark:text-slate-400 text-center">
                Silakan pilih properti untuk melihat review
              </p>
            </CardContent>
          </Card>
        )}

        <ReviewReplyDialog
          open={replyDialogOpen}
          reviewId={selectedReviewId}
          onClose={() => setReplyDialogOpen(false)}
          onSuccess={handleReplySuccess}
        />
      </div>
    </div>
  );
}

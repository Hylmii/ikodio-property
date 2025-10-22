'use client';

import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils/helpers';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
    profileImage: string | null;
  };
  reply: {
    comment: string;
    createdAt: string;
  } | null;
}

interface ReviewsSectionProps {
  reviews: Review[];
  totalReviews: number;
}

export function ReviewsSection({ reviews, totalReviews }: ReviewsSectionProps) {
  return (
    <Card className="border-0 shadow-lg bg-white overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900">Guest Reviews</CardTitle>
        <CardDescription className="text-slate-600">
          {totalReviews > 0 ? `${totalReviews} reviews from our guests` : 'No reviews yet'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl">
            <Star className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">
              Be the first to review this property
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold">
                    {review.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{review.user.name}</div>
                    <div className="text-xs text-slate-500">
                      {formatDate(new Date(review.createdAt))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 fill-slate-900 text-slate-900" />
                  <span className="font-bold text-sm">{review.rating}</span>
                </div>
              </div>
              <p className="text-slate-600 leading-relaxed">{review.comment}</p>
              {review.reply && (
                <div className="ml-6 mt-4 p-4 bg-slate-50 rounded-xl border-l-4 border-slate-900">
                  <div className="text-xs font-bold text-slate-900 mb-2">
                    Reply from owner
                  </div>
                  <p className="text-sm text-slate-600">{review.reply.comment}</p>
                  <div className="text-xs text-slate-500 mt-2">
                    {formatDate(new Date(review.reply.createdAt))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

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

interface ReviewCardProps {
  review: Review;
  onReply?: () => void;
  canReply?: boolean;
}

export function ReviewCard({ review, onReply, canReply }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.user.profilePicture || ''} />
            <AvatarFallback>{getInitials(review.user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold">{review.user.name}</p>
                <p className="text-sm text-slate-500">
                  {formatDistanceToNow(new Date(review.createdAt), { 
                    addSuffix: true,
                    locale: idLocale 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-slate-700 mb-4">{review.comment}</p>

            {review.reply && (
              <div className="mt-4 pl-4 border-l-2 border-slate-200">
                <p className="text-sm font-semibold text-slate-600 mb-1">
                  Balasan dari Pemilik
                </p>
                <p className="text-sm text-slate-600">{review.reply.comment}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {formatDistanceToNow(new Date(review.reply.createdAt), { 
                    addSuffix: true,
                    locale: idLocale 
                  })}
                </p>
              </div>
            )}

            {canReply && !review.reply && onReply && (
              <button
                onClick={onReply}
                className="text-sm text-primary hover:underline mt-2"
              >
                Balas Review
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

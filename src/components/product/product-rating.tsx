import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductRatingProps {
  rating: number;
  reviews: number;
  className?: string;
}

export function ProductRating({ rating, reviews, className }: ProductRatingProps) {
  const fullStars = Math.min(5, Math.max(0, Math.round(rating)));

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      aria-label={`Valoración ${rating} de 5, ${reviews} reseñas`}
    >
      <div className="flex gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              'size-3.5',
              index < fullStars ? 'fill-red-600 text-red-600' : 'fill-neutral-200 text-neutral-200',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-neutral-400">({reviews})</span>
    </div>
  );
}

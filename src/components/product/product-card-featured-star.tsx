import { Star } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductCardFeaturedStarProps {
  className?: string;
  label?: string;
}

/** Estrella roja (outline) en la esquina de la imagen para productos destacados. */
export function ProductCardFeaturedStar({
  className,
  label = 'Producto destacado',
}: ProductCardFeaturedStarProps) {
  return (
    <span
      className={cn(
        'absolute right-2 top-2 z-[2] flex size-7 items-center justify-center text-[#E30613]',
        className,
      )}
      aria-label={label}
    >
      <Star className="size-5" strokeWidth={2} aria-hidden="true" />
    </span>
  );
}

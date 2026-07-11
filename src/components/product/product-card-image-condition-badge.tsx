import { useMemo } from 'react';

import { ProductCardPillRow } from '@/components/product/product-card-pill';
import { buildProductCardPillBadges } from '@/lib/product-card-pill-badges';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductCardImageConditionBadgeProps {
  product: ProductBadgeSource & { name: string; category?: string | null };
  className?: string;
}

/** Fila de pills sobre la imagen: condición/Original (navy) + specs (gris-azul). */
export function ProductCardImageConditionBadge({
  product,
  className,
}: ProductCardImageConditionBadgeProps) {
  const badges = useMemo(() => buildProductCardPillBadges(product), [product]);
  if (badges.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none absolute bottom-1.5 left-1.5 z-[2] max-w-[calc(100%-0.75rem)] sm:bottom-2 sm:left-2',
        className,
      )}
      aria-hidden="true"
    >
      <ProductCardPillRow badges={badges} size="image" />
    </div>
  );
}

import { useMemo } from 'react';

import { ProductCardPill } from '@/components/product/product-card-pill';
import { buildProductCardSpecBadges } from '@/lib/product-card-spec-badges';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';
import type { ProductAttribute } from '@/types/product';

interface ProductCardSpecBadgesProps {
  product: ProductBadgeSource & { attributes?: ProductAttribute[] };
  className?: string;
}

export function ProductCardSpecBadges({ product, className }: ProductCardSpecBadgesProps) {
  const badges = useMemo(
    () => buildProductCardSpecBadges(product as Parameters<typeof buildProductCardSpecBadges>[0]),
    [product],
  );

  if (badges.length === 0) return null;

  return (
    <ul
      className={cn('flex min-w-0 flex-wrap gap-0.5', className)}
      aria-label="Especificaciones del equipo"
    >
      {badges.map((badge) => (
        <li key={badge.id}>
          {badge.id === 'condicion' ? (
            <ProductCardPill label={badge.label} variant="primary" />
          ) : (
            <ProductCardPill label={badge.label} variant="secondary" />
          )}
        </li>
      ))}
    </ul>
  );
}

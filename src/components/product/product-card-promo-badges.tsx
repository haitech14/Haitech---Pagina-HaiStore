import { useMemo } from 'react';

import { ProductCardPillRow } from '@/components/product/product-card-pill';
import {
  HOME_LANDING_PROMO_BADGE_LABELS,
  type HomeLandingPromoBadgeId,
} from '@/lib/home-landing-product-badges';
import {
  buildProductCardPillBadges,
  type ProductCardPillBadge,
} from '@/lib/product-card-pill-badges';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';

export { HOME_LANDING_PROMO_BADGE_LABELS };

interface ProductCardPromoBadgesProps {
  product?: ProductBadgeSource & { name: string; category?: string | null };
  pillBadges?: readonly ProductCardPillBadge[];
  promoBadges?: readonly HomeLandingPromoBadgeId[];
  /** @deprecated Usar `product` o `pillBadges`; se mantiene por compatibilidad. */
  estadoLabel?: string | null;
  className?: string;
  size?: 'card' | 'image';
}

export function ProductCardPromoBadges({
  product,
  pillBadges,
  promoBadges = [],
  estadoLabel,
  className,
  size = 'card',
}: ProductCardPromoBadgesProps) {
  const resolvedPillBadges = useMemo(() => {
    if (pillBadges) return pillBadges;
    if (product) return buildProductCardPillBadges(product);

    const trimmedEstado = estadoLabel?.trim();
    if (!trimmedEstado) return [];
    return [{ id: 'estado', label: trimmedEstado, variant: 'primary' as const }];
  }, [estadoLabel, pillBadges, product]);

  if (resolvedPillBadges.length === 0 && promoBadges.length === 0) return null;

  return (
    <ProductCardPillRow
      badges={resolvedPillBadges}
      promoBadges={promoBadges}
      size={size}
      {...(className != null ? { className } : {})}
    />
  );
}

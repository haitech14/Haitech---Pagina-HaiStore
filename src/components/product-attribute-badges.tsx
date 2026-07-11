import { ProductCardPill } from '@/components/product/product-card-pill';
import {
  buildProductDetailBadges,
  formatBadgeDisplayValue,
  isNuevoConditionBadge,
  isPrimaryProductBadge,
  type ProductBadgeSource,
  type ProductDetailBadge,
} from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductAttributeBadgesProps {
  product: ProductBadgeSource;
  /** Tarjetas: solo Condición, Velocidad, Formato y ADF (sin Color u otros). */
  compact?: boolean;
  /** La marca se muestra aparte arriba del título en tarjetas de catálogo. */
  hideBrand?: boolean;
  className?: string;
}

function badgeDisplayText(badge: ProductDetailBadge, compact: boolean): string {
  if (isPrimaryProductBadge(badge.id)) {
    return formatBadgeDisplayValue(badge, { compact });
  }
  return badge.value.trim();
}

function badgeVariant(badge: ProductDetailBadge): 'primary' | 'secondary' {
  if (badge.id === 'condicion') return 'primary';
  return 'secondary';
}

export function ProductAttributeBadges({
  product,
  compact = false,
  hideBrand = false,
  className,
}: ProductAttributeBadgesProps) {
  const badges = buildProductDetailBadges(product, { primaryOnly: compact }).filter(
    (badge) => !isNuevoConditionBadge(badge),
  );
  const brand = hideBrand ? '' : product.brand?.trim();

  if (badges.length === 0 && !brand) return null;

  return (
    <ul
      className={cn(
        'flex w-full min-w-0',
        compact
          ? 'flex-nowrap gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label="Características del producto"
    >
      {brand ? (
        <li className="shrink-0">
          <ProductCardPill label={brand} variant="primary" />
        </li>
      ) : null}
      {badges.map((badge) => (
        <li key={badge.id} className="shrink-0">
          <ProductCardPill label={badgeDisplayText(badge, compact)} variant={badgeVariant(badge)} />
        </li>
      ))}
    </ul>
  );
}

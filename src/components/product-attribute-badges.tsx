import { Badge } from '@/components/ui/badge';
import {
  buildProductDetailBadges,
  formatBadgeDisplayValue,
  isPrimaryProductBadge,
  type ProductBadgeSource,
  type ProductDetailBadge,
} from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductAttributeBadgesProps {
  product: ProductBadgeSource;
  /** Tarjetas: solo Condición, Velocidad, Formato y ADF (sin Color u otros). */
  compact?: boolean;
  className?: string;
}

function badgeDisplayText(badge: ProductDetailBadge): string {
  if (isPrimaryProductBadge(badge.id)) {
    return formatBadgeDisplayValue(badge);
  }
  return badge.value.trim();
}

export function ProductAttributeBadges({
  product,
  compact = false,
  className,
}: ProductAttributeBadgesProps) {
  const badges = buildProductDetailBadges(product, { primaryOnly: compact });

  if (badges.length === 0) return null;

  return (
    <ul
      className={cn(
        'flex flex-nowrap gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label="Características del producto"
    >
      {badges.map((badge) => (
        <li key={badge.id} className="shrink-0">
          <Badge
            variant="secondary"
            className={cn(
              'whitespace-nowrap rounded-md border border-neutral-200 bg-neutral-50 font-medium text-neutral-800',
              compact
                ? 'px-1.5 py-0 text-[0.6rem] leading-relaxed sm:text-[0.65rem]'
                : 'px-2 py-0.5 text-xs',
            )}
          >
            {badgeDisplayText(badge)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

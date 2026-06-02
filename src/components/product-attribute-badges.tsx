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

function badgeDisplayText(badge: ProductDetailBadge, compact: boolean): string {
  if (isPrimaryProductBadge(badge.id)) {
    return formatBadgeDisplayValue(badge, { compact });
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
        'flex w-full min-w-0 pb-0.5',
        compact
          ? 'flex-nowrap gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label="Características del producto"
    >
      {badges.map((badge) => (
        <li key={badge.id} className="shrink-0">
          <Badge
            variant="secondary"
            className={cn(
              'whitespace-nowrap rounded-md border border-neutral-300 bg-neutral-200 font-medium text-neutral-700',
              compact
                ? 'px-1 py-0 text-[0.5rem] leading-tight sm:text-[0.55rem]'
                : 'px-2 py-0.5 text-xs',
            )}
          >
            {badgeDisplayText(badge, compact)}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

import { Badge } from '@/components/ui/badge';
import {
  buildProductDetailBadges,
  formatBadgeDisplayValue,
  isNuevoConditionBadge,
  isPrimaryProductBadge,
  type ProductBadgeSource,
  type ProductDetailBadge,
} from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

const INLINE_ATTR_LABELS = /^(color|modelo de equipo)$/i;
const MAX_INLINE_VALUE_LEN = 28;

function isInlineBadge(badge: ProductDetailBadge): boolean {
  if (badge.id === 'condicion') return false;
  if (isPrimaryProductBadge(badge.id)) return true;
  if (INLINE_ATTR_LABELS.test(badge.label)) {
    return badge.value.trim().length <= MAX_INLINE_VALUE_LEN;
  }
  return false;
}

function inlineBadgeText(badge: ProductDetailBadge): string {
  if (/^color$/i.test(badge.label)) return badge.value.trim();
  if (/^modelo de equipo$/i.test(badge.label)) return badge.value.trim();
  return formatBadgeDisplayValue(badge);
}

const INLINE_BADGE_CLASS =
  'whitespace-nowrap rounded-md border border-neutral-300 bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-700';

const BRAND_BADGE_CLASS =
  'whitespace-nowrap rounded-md border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50';

const BLOCK_BADGE_CLASS =
  'block w-full min-w-0 truncate rounded-md border border-neutral-300 bg-neutral-200 px-2 py-1 text-left text-xs font-medium text-neutral-700';

interface ProductQuickViewBadgesProps {
  product: ProductBadgeSource;
  className?: string;
}

export function ProductQuickViewBadges({ product, className }: ProductQuickViewBadgesProps) {
  const brand = product.brand?.trim();
  const allBadges = buildProductDetailBadges(product).filter((badge) => !isNuevoConditionBadge(badge));
  const inlineBadges = allBadges.filter(isInlineBadge);
  const blockBadges = allBadges.filter((badge) => !isInlineBadge(badge));

  if (!brand && inlineBadges.length === 0 && blockBadges.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {brand || inlineBadges.length > 0 ? (
        <ul
          className="flex min-w-0 flex-wrap gap-1.5"
          aria-label="Características del producto"
        >
          {brand ? (
            <li className="shrink-0">
              <Badge variant="outline" className={BRAND_BADGE_CLASS}>
                {brand}
              </Badge>
            </li>
          ) : null}
          {inlineBadges.map((badge) => (
            <li key={badge.id} className="shrink-0">
              <Badge variant="secondary" className={INLINE_BADGE_CLASS}>
                {inlineBadgeText(badge)}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}

      {blockBadges.map((badge) => (
        <p
          key={badge.id}
          className={BLOCK_BADGE_CLASS}
          title={badge.value.trim()}
        >
          {badge.value.trim()}
        </p>
      ))}
    </div>
  );
}

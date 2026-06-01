import { Badge } from '@/components/ui/badge';
import {
  buildProductDetailBadges,
  formatBadgeDisplayValue,
  type ProductBadgeSource,
} from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';

interface ProductAttributeBadgesProps {
  product: ProductBadgeSource;
  /** Tarjetas de listado: solo Condición, Velocidad, Formato y ADF. */
  compact?: boolean;
  className?: string;
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
        'flex gap-1.5',
        compact
          ? 'flex-nowrap overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap',
        className,
      )}
      aria-label="Características del producto"
    >
      {badges.map((badge) => (
        <li key={badge.id} className={compact ? 'shrink-0' : undefined}>
          <Badge
            variant="secondary"
            className={cn(
              'whitespace-nowrap rounded-md border border-neutral-200 bg-neutral-50 font-medium text-neutral-800',
              compact
                ? 'px-1.5 py-0 text-[0.6rem] leading-relaxed sm:text-[0.65rem]'
                : 'px-2.5 py-1 text-xs',
            )}
          >
            {compact ? (
              formatBadgeDisplayValue(badge)
            ) : (
              <>
                <span className="font-semibold text-neutral-900">{badge.label}:</span>{' '}
                {badge.value}
              </>
            )}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

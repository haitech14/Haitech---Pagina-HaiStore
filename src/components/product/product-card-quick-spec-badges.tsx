import { useMemo } from 'react';

import { Badge } from '@/components/ui/badge';
import { buildProductCardQuickSpecBadges } from '@/lib/product-card-quick-specs';
import type { ProductBadgeSource } from '@/lib/product-detail-badges';
import { cn } from '@/lib/utils';
import type { ProductAttribute } from '@/types/product';

const CARD_HOVER_REVEAL_CLASS =
  'grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 max-md:grid-rows-[1fr] max-md:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 motion-reduce:grid-rows-[1fr] motion-reduce:opacity-100 motion-reduce:transition-none';

interface ProductCardQuickSpecBadgesProps {
  product: ProductBadgeSource & { attributes?: ProductAttribute[] };
  className?: string;
  /** Oculta los badges hasta hover/focus en la tarjeta (`group`). */
  revealOnHover?: boolean;
}

export function ProductCardQuickSpecBadges({
  product,
  className,
  revealOnHover = false,
}: ProductCardQuickSpecBadgesProps) {
  const badges = useMemo(() => buildProductCardQuickSpecBadges(product), [product]);

  if (badges.length === 0) return null;

  const badgeList = (
    <ul
      className={cn(
        'mt-0.5 flex min-w-0 flex-nowrap items-center gap-0.5 overflow-x-auto',
        '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      aria-label="Especificaciones del equipo"
    >
      {badges.map((badge) => (
        <li key={badge.id} className="shrink-0">
          <Badge
            variant="secondary"
            className={cn(
              'whitespace-nowrap rounded border border-[#E5E7EB] bg-[#F5F5F7] px-1 py-px text-[0.5625rem] font-normal leading-none text-[#555555] sm:text-[0.625rem]',
              badge.tone === 'condition' && 'font-semibold',
            )}
          >
            {badge.label}
          </Badge>
        </li>
      ))}
    </ul>
  );

  if (!revealOnHover) return badgeList;

  return (
    <div className={CARD_HOVER_REVEAL_CLASS}>
      <div className="min-h-0 overflow-hidden">{badgeList}</div>
    </div>
  );
}

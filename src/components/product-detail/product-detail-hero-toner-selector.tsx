import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { TonerCardRolePrices } from '@/components/product-detail/product-detail-role-prices';
import { cn } from '@/lib/utils';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';

const TONER_SECTION_TITLE = 'Toner';

interface ProductDetailHeroTonerSelectorProps {
  cards: ConfigureTonerCard[];
  selectedOptionIds: Set<string>;
  onToggle: (card: ConfigureTonerCard) => void;
  className?: string;
}

export function ProductDetailHeroTonerSelector({
  cards,
  selectedOptionIds,
  onToggle,
  className,
}: ProductDetailHeroTonerSelectorProps) {
  if (cards.length === 0) return null;

  return (
    <div className={cn('mt-3', className)}>
      <p className="text-sm font-semibold leading-snug text-[#0f1f3d]">
        {TONER_SECTION_TITLE}
      </p>
      <div
        role="group"
        aria-label={TONER_SECTION_TITLE}
        className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-2"
      >
        {cards.map((card) => {
          const selected = selectedOptionIds.has(card.optionId);
          return (
            <button
              key={card.optionId}
              type="button"
              aria-pressed={selected}
              className={cn(
                'flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                selected
                  ? 'border-red-600 bg-red-50/80'
                  : 'border-border/70 bg-white hover:bg-muted/30',
              )}
              onClick={() => onToggle(card)}
            >
              <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 sm:size-11">
                <ProductCardHoverImage
                  candidates={card.imageCandidates}
                  alt=""
                  className="size-full"
                  imageClassName="size-full object-contain p-0.5"
                />
              </div>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold leading-snug text-[#0f1f3d] sm:text-sm">
                  {card.title}
                </span>
                <span className="mt-0.5 block truncate text-[0.6875rem] leading-snug text-muted-foreground">
                  {card.code}
                </span>
                <TonerCardRolePrices prices={card.prices} />
              </span>
              <span
                className={cn(
                  'size-4 shrink-0 rounded-full border-2 border-border/80',
                  selected && 'border-red-600 bg-red-600',
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

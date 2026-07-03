import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { TonerCardRolePrices } from '@/components/product-detail/product-detail-role-prices';
import { cn } from '@/lib/utils';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';

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
    <div
      className={cn(
        'rounded-lg border border-border/70 bg-muted/15 p-3 sm:p-3.5',
        className,
      )}
    >
      <div className="mb-2.5 flex items-center gap-2">
        <p className="text-sm font-semibold text-[#0f1f3d]">Agregar tóner compatible</p>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
          Opcional
        </span>
      </div>

      <div role="group" aria-label="Tóner compatible opcional" className="flex flex-col gap-2">
        {cards.map((card) => {
          const selected = selectedOptionIds.has(card.optionId);
          return (
            <button
              key={card.optionId}
              type="button"
              aria-pressed={selected}
              className={cn(
                'flex min-h-11 w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                selected
                  ? 'border-red-600/40 bg-white'
                  : 'border-border/60 bg-white hover:bg-muted/20',
              )}
              onClick={() => onToggle(card)}
            >
              <span
                className={cn(
                  'flex size-4 shrink-0 items-center justify-center rounded border-2',
                  selected ? 'border-red-600 bg-red-600' : 'border-border bg-background',
                )}
                aria-hidden="true"
              >
                {selected ? (
                  <span className="size-1.5 rounded-sm bg-white" />
                ) : null}
              </span>

              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20">
                <ProductCardHoverImage
                  candidates={card.imageCandidates}
                  alt=""
                  className="size-full"
                  imageClassName="size-full object-contain p-0.5"
                />
              </div>

              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium leading-snug text-[#0f1f3d] sm:text-sm">
                  {card.title}
                </span>
                {card.code ? (
                  <span className="mt-0.5 block truncate text-[0.6875rem] text-muted-foreground">
                    {card.code}
                  </span>
                ) : null}
                <TonerCardRolePrices prices={card.prices} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

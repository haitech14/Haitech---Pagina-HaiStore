import { ImageOff } from 'lucide-react';

import { ProductCardHoverImage } from '@/components/product/product-card-hover-image';
import { ProductDetailHeroCollapsibleSection } from '@/components/product-detail/product-detail-hero-collapsible-section';
import { TonerCardRolePrices } from '@/components/product-detail/product-detail-role-prices';
import { cn } from '@/lib/utils';
import type { ConfigureHeroAccessoryCard } from '@/lib/product-configure-hero-options';

interface ProductDetailHeroAccessorySelectorProps {
  cards: ConfigureHeroAccessoryCard[];
  selectedOptionIds: Set<string>;
  onToggle: (card: ConfigureHeroAccessoryCard) => void;
  className?: string;
}

function AccessoryCardNoImage() {
  return (
    <span className="flex flex-col items-center justify-center gap-1 text-muted-foreground">
      <ImageOff className="size-5 text-muted-foreground/70" aria-hidden="true" />
      <span className="text-[0.625rem] font-semibold sm:text-[0.6875rem]">Sin imagen</span>
    </span>
  );
}

export function ProductDetailHeroAccessorySelector({
  cards,
  selectedOptionIds,
  onToggle,
  className,
}: ProductDetailHeroAccessorySelectorProps) {
  if (cards.length === 0) return null;

  return (
    <ProductDetailHeroCollapsibleSection
      title="Accesorios"
      badge="Opcional"
      panelAriaLabel="Accesorios opcionales"
      className={className}
    >
      <div
        role="group"
        aria-label="Accesorios opcionales"
        className="grid grid-cols-1 gap-2"
      >
        {cards.map((card) => {
          const selected = selectedOptionIds.has(card.optionId);
          return (
            <button
              key={card.optionId}
              type="button"
              aria-pressed={selected}
              className={cn(
                'relative rounded-md border px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                selected
                  ? 'border-red-600/40 bg-white'
                  : 'border-border/60 bg-white hover:bg-muted/20',
              )}
              onClick={() => onToggle(card)}
            >
              <span
                className={cn(
                  'absolute left-2 top-2 z-10 flex size-4 shrink-0 items-center justify-center rounded border-2',
                  selected ? 'border-red-600 bg-red-600' : 'border-border bg-background',
                )}
                aria-hidden="true"
              >
                {selected ? (
                  <span className="size-1.5 rounded-sm bg-white" />
                ) : null}
              </span>

              <div className="flex items-center gap-2 pl-6">
                <div className="flex aspect-square size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/60 bg-muted/20 p-0.5">
                  <ProductCardHoverImage
                    candidates={card.imageCandidates}
                    alt=""
                    className="size-full"
                    imageClassName="size-full object-contain"
                    placeholder={<AccessoryCardNoImage />}
                  />
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="line-clamp-3 text-[0.6875rem] font-medium leading-snug text-[#0f1f3d] sm:text-xs">
                    {card.title}
                    {card.code ? (
                      <span className="font-normal text-muted-foreground"> ({card.code})</span>
                    ) : null}
                  </span>

                  <TonerCardRolePrices
                    prices={card.prices}
                    align="start"
                    className="block w-full"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </ProductDetailHeroCollapsibleSection>
  );
}

import { cn } from '@/lib/utils';
import type { ProductFeatureCard } from '@/types/product-detail';

interface ProductDetailFeatureGridProps {
  cards: ProductFeatureCard[];
  className?: string;
}

export function ProductDetailFeatureGrid({ cards, className }: ProductDetailFeatureGridProps) {
  if (cards.length === 0) return null;

  return (
    <ul
      className={cn(
        'grid grid-cols-1 overflow-hidden border border-border/60 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isLastRowLg = index >= cards.length - (cards.length % 3 || 3);
        const isThirdColLg = (index + 1) % 3 === 0;

        return (
          <li
            key={card.title}
            className={cn(
              'flex gap-3 border-border/60 p-4 sm:gap-3.5 sm:p-5',
              'border-b sm:[&:nth-child(odd)]:border-r',
              !isLastRowLg && 'lg:border-b',
              !isThirdColLg && 'lg:border-r',
            )}
          >
            <Icon
              className="mt-0.5 size-6 shrink-0 text-red-600 sm:size-7"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold leading-snug text-[#0f1f3d] sm:text-[0.9375rem]">
                {card.title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                {card.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

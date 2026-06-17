import { cn } from '@/lib/utils';
import type { ProductFeatureCard } from '@/types/product-detail';

interface ProductDetailFeatureGridProps {
  cards: ProductFeatureCard[];
  className?: string;
}

export function ProductDetailFeatureGrid({ cards, className }: ProductDetailFeatureGridProps) {
  if (cards.length === 0) return null;

  const totalRowsSm = Math.ceil(cards.length / 2);
  const totalRowsLg = Math.ceil(cards.length / 3);

  return (
    <ul
      className={cn(
        'grid grid-cols-1 overflow-hidden rounded-md border border-border/60 bg-white sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const rowSm = Math.floor(index / 2);
        const colSm = index % 2;
        const rowLg = Math.floor(index / 3);
        const colLg = index % 3;
        const isLastRow = index === cards.length - 1;
        const isLastRowSm = rowSm === totalRowsSm - 1;
        const isLastRowLg = rowLg === totalRowsLg - 1;

        return (
          <li
            key={card.title}
            className={cn(
              'flex gap-3 border-border/60 bg-white p-4 sm:gap-3.5 sm:p-5',
              !isLastRow && 'border-b',
              colSm === 0 && 'sm:border-r',
              isLastRowSm && 'sm:border-b-0',
              'lg:border-r-0',
              colLg < 2 && 'lg:border-r',
              isLastRowLg && 'lg:border-b-0',
            )}
          >
            <Icon
              className="mt-0.5 size-6 shrink-0 text-red-600 sm:size-[1.625rem]"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <div className="min-w-0 space-y-1">
              <p className="text-sm font-bold leading-snug text-[#0f1f3d]">{card.title}</p>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-[0.8125rem]">
                {card.description}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

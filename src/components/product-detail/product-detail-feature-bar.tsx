import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight } from '@/types/product-detail';

interface ProductDetailFeatureBarProps {
  items: ProductDescriptionHighlight[];
  className?: string;
}

export function ProductDetailFeatureBar({ items, className }: ProductDetailFeatureBarProps) {
  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        'mt-5 overflow-hidden rounded-lg border border-border/60 bg-background sm:mt-6',
        className,
      )}
      aria-label="Características destacadas del producto"
    >
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item, index) => {
          const Icon = item.icon;
          const isLastColMobile = index % 2 === 1;
          const isLastColSm = index % 3 === 2;
          const isNotLastLg = index < items.length - 1;

          return (
            <li
              key={`${item.title}-${item.subtitle}`}
              className={cn(
                'flex flex-col items-center justify-center gap-1.5 px-3 py-4 text-center sm:px-4',
                index < items.length - 2 && 'border-b border-border/60 lg:border-b-0',
                index < items.length - (items.length % 2 === 0 ? 2 : 1) &&
                  'max-sm:border-b max-sm:border-border/60',
                !isLastColMobile && 'border-r border-border/60 sm:border-r-0',
                !isLastColSm && 'sm:border-r sm:border-border/60 lg:border-r-0',
                isNotLastLg && 'lg:border-r lg:border-border/60',
              )}
            >
              <Icon className="size-6 text-muted-foreground sm:size-7" strokeWidth={1.25} aria-hidden="true" />
              <p className="text-sm font-bold leading-tight text-[#0f1f3d]">{item.title}</p>
              <p className="text-[0.65rem] leading-snug text-muted-foreground sm:text-xs">{item.subtitle}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

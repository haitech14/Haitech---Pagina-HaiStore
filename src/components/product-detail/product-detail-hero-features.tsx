import { cn } from '@/lib/utils';
import type { ProductDescriptionHighlight } from '@/types/product-detail';

interface ProductDetailHeroFeaturesProps {
  highlights: ProductDescriptionHighlight[];
  className?: string;
}

export function ProductDetailHeroFeatures({ highlights, className }: ProductDetailHeroFeaturesProps) {
  if (highlights.length === 0) return null;

  return (
    <div className={cn('border-y border-border/50 py-3.5 sm:py-4', className)}>
      <ul className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 sm:gap-x-2 sm:gap-y-0">
        {highlights.map((item) => {
          const Icon = item.icon;

          return (
            <li
              key={item.title}
              className="flex min-w-0 flex-col items-center gap-1.5 px-1 text-center sm:gap-2"
            >
              <Icon
                className="size-6 shrink-0 text-[#0f1f3d] sm:size-7"
                strokeWidth={1.25}
                aria-hidden="true"
              />
              <div className="space-y-0.5">
                <p className="text-[0.625rem] font-bold uppercase leading-tight tracking-wide text-[#0f1f3d] sm:text-[0.6875rem]">
                  {item.title}
                </p>
                <p className="text-[0.625rem] font-normal leading-snug text-muted-foreground sm:text-[0.6875rem]">
                  {item.subtitle}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

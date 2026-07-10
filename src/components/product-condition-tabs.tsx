import { useSearchParams } from 'react-router-dom';

import { scrollToCategoryProducts } from '@/lib/category-path';
import {
  PRODUCT_CONDITION_LABELS,
  PRODUCT_CONDITIONS,
  parseProductCondition,
  type ProductCondition,
} from '@/lib/product-condition';
import { cn } from '@/lib/utils';

interface ProductConditionTabsProps {
  activeCondition: ProductCondition | null;
  counts?: Partial<Record<ProductCondition, number>>;
  className?: string;
}

export function ProductConditionTabs({
  activeCondition,
  counts,
  className,
}: ProductConditionTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectCondition = (condition: ProductCondition | null) => {
    const next = new URLSearchParams(searchParams);
    if (condition) next.set('estado', condition);
    else next.delete('estado');
    setSearchParams(next, { replace: true, preventScrollReset: true });
    requestAnimationFrame(() => scrollToCategoryProducts('smooth'));
  };

  return (
    <div
      className={cn(
        'flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        className,
      )}
      role="tablist"
      aria-label="Filtrar por condición del producto"
    >
      {PRODUCT_CONDITIONS.map((condition) => {
        const count = counts?.[condition];
        const disabled = count === 0;
        return (
          <button
            key={condition}
            type="button"
            role="tab"
            aria-selected={activeCondition === condition}
            aria-disabled={disabled}
            disabled={disabled}
            className={cn(
              'min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
              activeCondition === condition
                ? 'border-red-600 bg-red-600 text-white'
                : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300',
              disabled && 'pointer-events-none opacity-45',
            )}
            onClick={() => selectCondition(condition)}
          >
            {PRODUCT_CONDITION_LABELS[condition]}
          </button>
        );
      })}
    </div>
  );
}

export function useCategoryConditionFilter(): ProductCondition | null {
  const [searchParams] = useSearchParams();
  return parseProductCondition(searchParams.get('estado'));
}

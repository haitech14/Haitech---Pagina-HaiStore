import { GitCompare, X } from 'lucide-react';

import { ProductCompareDialog } from '@/components/product/product-compare-dialog';
import { ProductCardImage } from '@/components/product/product-card-image';
import { Button } from '@/components/ui/button';
import { useProductCompare } from '@/context/product-compare-context';
import { mobileBottomOffsetStyle, useMobileBottomInset } from '@/context/mobile-bottom-inset-context';
import { MAX_COMPARE_PRODUCTS } from '@/lib/compare-product';
import { cn } from '@/lib/utils';

export function ProductCompareTray() {
  const { items, remove, setCompareOpen } = useProductCompare();
  const bottomInset = useMobileBottomInset();

  if (items.length === 0) {
    return <ProductCompareDialog />;
  }

  return (
    <>
      <div
        className="fixed left-1/2 z-40 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 rounded-xl border bg-background p-3 shadow-lg"
        style={mobileBottomOffsetStyle(bottomInset, 1)}
        role="region"
        aria-label="Productos seleccionados para comparar"
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold">
            Comparar ({items.length}/{MAX_COMPARE_PRODUCTS})
          </p>
          <Button
            type="button"
            size="sm"
            className="min-h-9 bg-red-600 hover:bg-red-500"
            onClick={() => setCompareOpen(true)}
          >
            <GitCompare className="size-4" aria-hidden="true" />
            Ver comparativo
          </Button>
        </div>
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                'flex min-w-[5.5rem] shrink-0 flex-col items-center gap-1.5 rounded-md border bg-muted/30 p-2 sm:min-w-[6rem]',
              )}
            >
              {item.image ? (
                <ProductCardImage
                  src={item.image}
                  alt=""
                  className="h-16 w-full max-w-[5rem] object-contain sm:h-[4.5rem] sm:max-w-[5.5rem]"
                  loading="lazy"
                />
              ) : (
                <span className="flex h-16 w-full max-w-[5rem] items-center justify-center text-lg font-bold text-muted-foreground sm:h-[4.5rem] sm:max-w-[5.5rem]">
                  {item.name.charAt(0)}
                </span>
              )}
              <button
                type="button"
                className="flex size-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Quitar ${item.name}`}
                onClick={() => remove(item.id)}
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <ProductCompareDialog />
    </>
  );
}

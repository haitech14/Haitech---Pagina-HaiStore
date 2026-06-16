import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, ShoppingCart } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/cart-context';
import { productPath } from '@/lib/product-path';
import { cn } from '@/lib/utils';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

interface ProductDetailComboProps {
  items: ProductComboItem[];
  mainProduct: Product;
  catalogProducts?: Product[];
  title?: string;
  subtitle?: string;
  className?: string;
  /** Dentro de otra sección (sin borde exterior duplicado). */
  embedded?: boolean;
}

export function ProductDetailCombo({
  items,
  mainProduct,
  catalogProducts = [],
  title = 'Suelen comprar frecuentemente',
  subtitle,
  className,
  embedded = false,
}: ProductDetailComboProps) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.defaultSelected])),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const { selectedCount, totalPen } = useMemo(() => {
    const picked = items.filter((item) => selected[item.id]);
    return {
      selectedCount: picked.length,
      totalPen: picked.reduce((acc, item) => acc + item.pricePen, 0),
    };
  }, [items, selected]);

  const handleAddCombo = () => {
    const picked = items.filter((item) => selected[item.id]);
    picked.forEach((item, index) => {
      const realProduct = item.productId
        ? catalogProducts.find((row) => row.id === item.productId)
        : undefined;

      if (realProduct) {
        addItem(realProduct, { openDrawer: index === picked.length - 1 });
        return;
      }

      addItem(
        {
          id: `${mainProduct.id}-${item.id}`,
          name: item.name,
          description: `Consumible para ${mainProduct.name}`,
          price: item.priceUsd ?? Math.round(item.pricePen / 3.7),
          currency: 'USD',
          image_url: item.image,
          stock: 10,
          category: 'Tóner y Suministros',
          created_at: new Date().toISOString(),
        },
        { openDrawer: index === picked.length - 1 },
      );
    });
  };

  if (items.length === 0) return null;

  const resolvedSubtitle =
    subtitle ?? `Toner y consumibles compatibles con tu ${mainProduct.brand ?? 'equipo'}`;

  return (
    <section
      className={cn(
        'overflow-hidden bg-white',
        embedded ? className : cn('rounded-lg border border-border/60', className),
      )}
      aria-labelledby="combo-titulo"
    >
      {!embedded ? (
        <div className="border-b border-border/60 px-4 py-3.5 sm:px-5">
          <h2 id="combo-titulo" className="text-base font-bold text-[#0f1f3d] sm:text-lg">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{resolvedSubtitle}</p>
        </div>
      ) : (
        <h2 id="combo-titulo" className="sr-only">
          {title}
        </h2>
      )}

      <div className={cn('relative bg-white', embedded ? '' : 'px-4 py-3.5 sm:px-5')}>
        <div className="overflow-hidden pr-8 sm:pr-10" ref={emblaRef}>
          <ul className="flex gap-2.5 sm:gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="min-w-0 flex-[0_0_44%] sm:flex-[0_0_200px] lg:flex-[0_0_calc(33.333%-0.5rem)]"
              >
                <article
                  className={cn(
                    'relative flex h-full flex-col rounded-lg border bg-white p-2.5 transition-colors sm:p-3',
                    selected[item.id] ? 'border-red-600/40 ring-1 ring-red-600/20' : 'border-border/60',
                  )}
                >
                  <div className="absolute left-2 top-2 z-10 sm:left-2.5 sm:top-2.5">
                    <Checkbox
                      id={`combo-${item.id}`}
                      checked={selected[item.id]}
                      onCheckedChange={(checked) =>
                        setSelected((prev) => ({ ...prev, [item.id]: checked === true }))
                      }
                      className="size-4 border-border bg-white data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                      aria-label={`Incluir ${item.name}`}
                    />
                  </div>

                  <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted/25 p-3 pt-5">
                    <img
                      src={item.image}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <p className="mt-2 line-clamp-2 text-[0.6875rem] font-semibold leading-snug text-[#0f1f3d] sm:text-xs">
                    {item.name}
                  </p>

                  <p className="mt-1.5 text-sm font-bold text-[#0f1f3d]">
                    {item.priceUsd != null ? (
                      <DualPrice usd={item.priceUsd} />
                    ) : (
                      <>
                        S/{' '}
                        {item.pricePen.toLocaleString('es-PE', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </>
                    )}
                  </p>

                  {item.productId ? (
                    <Link
                      to={productPath(item.productId)}
                      className="mt-auto inline-flex items-center gap-0.5 pt-2 text-[0.6875rem] font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:text-xs"
                    >
                      Ver producto
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Ver más consumibles"
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-muted-foreground shadow-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:right-4 sm:size-9"
          >
            <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          'flex flex-col gap-2.5 border-t border-border/60 bg-muted/25 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4',
          embedded ? 'mt-3 rounded-lg px-3 sm:px-4' : 'px-4 sm:px-5',
        )}
      >
        <p className="text-xs text-muted-foreground sm:text-sm">
          <span>
            {selectedCount} producto{selectedCount !== 1 ? 's' : ''} seleccionado
            {selectedCount !== 1 ? 's' : ''}
          </span>
          <span className="mx-2 hidden text-border sm:inline" aria-hidden="true">
            |
          </span>
          <span className="block sm:inline">
            Total adicional:{' '}
            <span className="font-bold text-[#0f1f3d]">
              S/ {totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </span>
        </p>

        <Button
          type="button"
          className="h-9 shrink-0 gap-2 rounded-lg bg-red-600 px-4 text-xs font-bold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:h-10 sm:text-sm"
          onClick={handleAddCombo}
          disabled={selectedCount === 0}
        >
          <ShoppingCart className="size-4" strokeWidth={1.5} aria-hidden="true" />
          Agregar seleccionados al carrito
        </Button>
      </div>
    </section>
  );
}

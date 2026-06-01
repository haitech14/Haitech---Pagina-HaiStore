import { useCallback, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronRight, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/cart-context';
import type { ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductDetailComboProps {
  items: ProductComboItem[];
  mainProduct: Product;
  /** Dentro de la pestaña «Toner y Consumibles» (sin borde exterior duplicado). */
  embedded?: boolean;
}

export function ProductDetailCombo({ items, mainProduct, embedded = false }: ProductDetailComboProps) {
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
    items
      .filter((item) => selected[item.id])
      .forEach((item) => {
        addItem({
          id: `${mainProduct.id}-${item.id}`,
          name: item.name,
          description: `Accesorio para ${mainProduct.name}`,
          price: Math.round(item.pricePen / 3.7),
          currency: 'USD',
          image_url: item.image,
          stock: 10,
          category: 'Accesorios',
          created_at: new Date().toISOString(),
        });
      });
  };

  if (items.length === 0) return null;

  return (
    <section
      className={cn(
        'overflow-hidden bg-white',
        embedded ? '' : 'rounded-xl border border-neutral-200',
      )}
      aria-labelledby="combo-titulo"
    >
      {!embedded && (
        <div className="border-b border-neutral-200 px-4 py-4 sm:px-5">
          <h2 id="combo-titulo" className="text-base font-bold text-neutral-900">
            Complementa tu compra
          </h2>
          <p className="mt-1 text-sm text-neutral-500">Accesorios recomendados para tu impresora</p>
        </div>
      )}
      {embedded && (
        <h2 id="combo-titulo" className="sr-only">
          Toner y consumibles recomendados
        </h2>
      )}

      <div className={cn('relative bg-white', embedded ? '' : 'px-4 py-4 sm:px-5')}>
        <div className="overflow-hidden pr-10" ref={emblaRef}>
          <ul className="flex gap-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="min-w-0 flex-[0_0_46%] sm:flex-[0_0_240px] lg:flex-[0_0_260px]"
              >
                <article
                  className={cn(
                    'relative flex h-full flex-col rounded-lg border bg-white p-3 transition-colors',
                    selected[item.id] ? 'border-red-300' : 'border-neutral-200',
                  )}
                >
                  <Checkbox
                    id={`combo-${item.id}`}
                    checked={selected[item.id]}
                    onCheckedChange={(checked) =>
                      setSelected((prev) => ({ ...prev, [item.id]: checked === true }))
                    }
                    className="absolute left-3 top-3 z-10 border-neutral-400 data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600"
                    aria-label={`Incluir ${item.name}`}
                  />

                  <div className="mt-6 flex aspect-[4/3] items-center justify-center rounded-md bg-neutral-50 p-2">
                    <img
                      src={item.image}
                      alt=""
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-neutral-900">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm font-bold text-neutral-900">
                    S/ {item.pricePen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>

        {items.length > 1 && (
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Ver más accesorios"
            className="absolute right-4 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:right-5"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        className={cn(
          'flex flex-col gap-3 border-t border-neutral-200 bg-neutral-100/80 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2 lg:flex-nowrap',
          embedded ? 'mt-4 rounded-lg px-3 sm:px-4' : 'px-4 sm:px-5',
        )}
      >
        <p className="shrink-0 text-sm text-neutral-600">
          {selectedCount} accesorio{selectedCount !== 1 ? 's' : ''} seleccionado
          {selectedCount !== 1 ? 's' : ''}
        </p>

        <p className="shrink-0 text-sm text-neutral-600 lg:flex-1 lg:text-center">
          Total adicional:{' '}
          <span className="font-bold text-neutral-900">
            S/ {totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>

        <Button
          type="button"
          className="h-10 w-full shrink-0 gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-500 focus-visible:ring-red-600 sm:w-auto lg:ml-auto"
          onClick={handleAddCombo}
          disabled={selectedCount === 0}
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
          Agregar seleccionados al carrito
        </Button>
      </div>
    </section>
  );
}

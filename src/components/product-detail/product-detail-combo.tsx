import { useCallback, useEffect, useMemo, useState } from 'react';
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
  /** Variante secundaria: cabecera compacta y rejilla fija para pocos ítems. */
  compact?: boolean;
  /** Aún más pequeño: ideal arriba del precio en la columna hero. */
  mini?: boolean;
}

function ComboCard({
  item,
  selected,
  onToggle,
  compact = false,
  mini = false,
}: {
  item: ProductComboItem;
  selected: boolean;
  onToggle: (checked: boolean) => void;
  compact?: boolean;
  mini?: boolean;
}) {
  return (
    <article
      className={cn(
        'relative flex h-full flex-col rounded-lg border bg-white transition-colors',
        mini ? 'p-1.5' : compact ? 'p-2' : 'p-2.5 sm:p-3',
        selected ? 'border-red-600/40 ring-1 ring-red-600/20' : 'border-border/60',
      )}
    >
      <div
        className={cn(
          'absolute left-1 top-1 z-10',
          !mini && !compact && 'sm:left-2.5 sm:top-2.5',
          compact && !mini && 'sm:left-2.5 sm:top-2.5',
        )}
      >
        <Checkbox
          id={`combo-${item.id}`}
          checked={selected}
          onCheckedChange={(checked) => onToggle(checked === true)}
          className={cn(
            'border-border bg-white data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600',
            mini ? 'size-2.5' : compact ? 'size-3' : 'size-4',
          )}
          aria-label={`Incluir ${item.name}`}
        />
      </div>

      <div
        className={cn(
          'flex items-center justify-center rounded-md bg-muted/25',
          mini
            ? 'aspect-[4/3] max-h-20 p-0.5 pt-2.5'
            : compact
              ? 'aspect-[5/4] p-1.5 pt-4'
              : 'aspect-[4/3] p-3 pt-5',
        )}
      >
        <img
          src={item.image}
          alt=""
          className="max-h-full max-w-full object-contain"
          loading="lazy"
        />
      </div>

      <p
        className={cn(
          'line-clamp-2 font-semibold leading-snug text-[#0f1f3d]',
          mini
            ? 'mt-0.5 text-[0.625rem] leading-tight'
            : compact
              ? 'mt-1.5 text-[0.625rem]'
              : 'mt-2 text-[0.6875rem] sm:text-xs',
        )}
      >
        {item.name}
      </p>

      <p
        className={cn(
          'font-bold text-[#0f1f3d]',
          mini ? 'mt-px text-[0.5625rem]' : compact ? 'mt-1 text-[0.6875rem]' : 'mt-1.5 text-sm',
        )}
      >
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

      {item.productId && !mini ? (
        <Link
          to={productPath(item.productId)}
          className={cn(
            'mt-auto inline-flex items-center gap-0.5 font-bold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
            compact ? 'pt-1 text-[0.625rem]' : 'pt-2 text-[0.6875rem] sm:text-xs',
          )}
        >
          Ver producto
          <ChevronRight className={cn(compact ? 'size-3' : 'size-3.5')} aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}

export function ProductDetailCombo({
  items,
  mainProduct,
  catalogProducts = [],
  title = 'Suelen comprar frecuentemente',
  subtitle,
  className,
  embedded = false,
  compact = false,
  mini = false,
}: ProductDetailComboProps) {
  const { addItem } = useCart();
  const [selected, setSelected] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.defaultSelected])),
  );

  const itemsKey = useMemo(
    () => items.map((item) => `${item.id}:${item.defaultSelected}`).join('|'),
    [items],
  );

  useEffect(() => {
    setSelected(Object.fromEntries(items.map((item) => [item.id, item.defaultSelected])));
  }, [itemsKey]);

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
  const useGrid = (compact || mini) && items.length <= 3;
  const isMiniLayout = mini && compact;

  return (
    <section
      className={cn(
        'overflow-hidden',
        isMiniLayout
          ? 'rounded-md border border-border/40 bg-muted/10'
          : compact
            ? 'rounded-lg border border-border/40 bg-muted/15'
            : embedded
              ? className
              : cn('rounded-lg border border-border/60 bg-white', className),
      )}
      aria-labelledby="combo-titulo"
    >
      {isMiniLayout ? (
        <div className="border-b border-border/40 px-2 py-1">
          <h2 id="combo-titulo" className="text-[0.6875rem] font-bold text-[#0f1f3d]">
            {title}
          </h2>
          <p className="mt-px line-clamp-1 text-[0.5625rem] text-muted-foreground">{resolvedSubtitle}</p>
        </div>
      ) : compact ? (
        <div className="border-b border-border/40 px-3 py-2.5 sm:px-3.5">
          <h2 id="combo-titulo" className="text-sm font-bold text-[#0f1f3d]">
            {title}
          </h2>
          <p className="mt-0.5 text-[0.6875rem] text-muted-foreground sm:text-xs">{resolvedSubtitle}</p>
        </div>
      ) : !embedded ? (
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

      <div
        className={cn(
          'relative bg-transparent',
          isMiniLayout ? 'px-2 py-1.5' : compact ? 'px-3 py-3 sm:px-3.5' : embedded ? '' : 'px-4 py-3.5 sm:px-5',
        )}
      >
        {useGrid ? (
          <ul
            className={cn(
              'grid',
              isMiniLayout
                ? 'grid-cols-3 gap-1.5'
                : cn('grid-cols-1 gap-2', items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'),
            )}
          >
            {items.map((item) => (
              <li key={item.id}>
                <ComboCard
                  item={item}
                  selected={selected[item.id]}
                  compact={compact}
                  mini={mini}
                  onToggle={(checked) =>
                    setSelected((prev) => ({ ...prev, [item.id]: checked }))
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="overflow-hidden pr-8 sm:pr-10" ref={emblaRef}>
              <ul className="flex gap-2.5 sm:gap-3">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="min-w-0 flex-[0_0_44%] sm:flex-[0_0_200px] lg:flex-[0_0_calc(33.333%-0.5rem)]"
                  >
                    <ComboCard
                      item={item}
                      selected={selected[item.id]}
                      compact={compact}
                      mini={mini}
                      onToggle={(checked) =>
                        setSelected((prev) => ({ ...prev, [item.id]: checked }))
                      }
                    />
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
          </>
        )}
      </div>

      <div
        className={cn(
          'flex flex-col gap-1.5 border-t border-border/40 bg-muted/20 sm:flex-row sm:items-center sm:justify-between',
            isMiniLayout
            ? 'px-2 py-1 sm:gap-2'
            : cn(
                'gap-2 py-2 sm:gap-3',
                compact ? 'px-3 sm:px-3.5' : embedded ? 'mt-3 rounded-lg px-3 sm:px-4' : 'px-4 sm:px-5',
              ),
        )}
      >
        <p
          className={cn(
            'text-muted-foreground',
            isMiniLayout ? 'text-[0.5625rem] leading-tight' : 'text-[0.6875rem] sm:text-xs',
          )}
        >
          <span>
            {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
          </span>
          {selectedCount > 0 ? (
            <>
              <span className="mx-1 hidden text-border sm:inline" aria-hidden="true">
                |
              </span>
              <span className="block sm:inline">
                +{' '}
                <span className="font-semibold text-[#0f1f3d]">
                  S/ {totalPen.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            </>
          ) : null}
        </p>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'shrink-0 gap-1 rounded-md border-red-600/30 font-bold text-red-600 hover:bg-red-50 focus-visible:ring-red-600',
            isMiniLayout
              ? 'h-6 px-1.5 text-[0.5625rem]'
              : 'h-9 gap-1.5 px-3 text-[0.6875rem] sm:text-xs',
          )}
          onClick={handleAddCombo}
          disabled={selectedCount === 0}
        >
          <ShoppingCart className={cn(isMiniLayout ? 'size-3' : 'size-3.5')} strokeWidth={1.5} aria-hidden="true" />
          Agregar al carrito
        </Button>
      </div>
    </section>
  );
}

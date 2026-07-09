import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronDown, ChevronRight, ShoppingCart } from 'lucide-react';

import { DualPrice } from '@/components/product/product-dual-price';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/context/cart-context';
import { productPath } from '@/lib/product-path';
import { cn, penToUsd } from '@/lib/utils';
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
  /** Tarjetas horizontales con botón + (complementos del equipo). */
  layout?: 'default' | 'complement';
  /** Si es complement, inicia plegado hasta que el usuario lo expanda. */
  defaultCollapsed?: boolean;
  /** Si es false, muestra el contenido siempre expandido sin acordeón. */
  collapsible?: boolean;
  /** Oculta el título interno (cuando el padre ya lo muestra). */
  hideTitle?: boolean;
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
        mini ? 'p-1.5' : compact ? 'p-2.5' : 'p-2.5 sm:p-3',
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
              ? 'aspect-[5/4] p-2 pt-5'
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
              ? 'mt-1.5 text-xs'
              : 'mt-2 text-[0.6875rem] sm:text-xs',
        )}
      >
        {item.name}
      </p>

      <p
        className={cn(
          'font-bold text-[#0f1f3d]',
          mini ? 'mt-px text-[0.5625rem]' : compact ? 'mt-1 text-xs sm:text-sm' : 'mt-1.5 text-sm',
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

function comboItemUsd(item: ProductComboItem): number {
  return item.priceUsd ?? penToUsd(item.pricePen);
}

function ComplementSelectableCard({
  item,
  selected,
  onToggle,
}: {
  item: ProductComboItem;
  selected: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const inputId = `complement-${item.id}`;
  const unitUsd = comboItemUsd(item);

  return (
    <label
      htmlFor={inputId}
      className={cn(
        'flex h-full w-full min-w-0 cursor-pointer flex-row items-center gap-2 rounded-lg border bg-white p-2 text-left transition-colors sm:gap-2.5 sm:p-2.5',
        selected ? 'border-red-600 ring-1 ring-red-600/25' : 'border-border/60 hover:border-border',
      )}
    >
      <Checkbox
        id={inputId}
        checked={selected}
        onCheckedChange={(checked) => onToggle(checked === true)}
        className="size-3.5 shrink-0 border-border data-[state=checked]:border-red-600 data-[state=checked]:bg-red-600 sm:size-4"
        aria-label={`Incluir ${item.name}`}
      />

      <span className="relative size-11 shrink-0 overflow-hidden rounded-md border border-border/40 bg-muted/25 sm:size-12">
        <img
          src={item.image}
          alt=""
          className="size-full object-contain p-0.5"
          loading="lazy"
        />
      </span>

      <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
        <span className="line-clamp-2 text-pretty text-[0.625rem] font-medium leading-snug text-[#0f1f3d] sm:text-[0.6875rem]">
          {item.name}
        </span>
        <span className="truncate text-[0.6875rem] font-bold tabular-nums text-red-600 sm:text-xs">
          <DualPrice usd={unitUsd} className="text-[0.6875rem] font-bold sm:text-xs" />
        </span>
      </span>
    </label>
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
  layout = 'default',
  defaultCollapsed = false,
  collapsible = true,
  hideTitle = false,
}: ProductDetailComboProps) {
  const { addItem } = useCart();
  const [open, setOpen] = useState(!defaultCollapsed);
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

  const { selectedCount, totalUsd } = useMemo(() => {
    const picked = items.filter((item) => selected[item.id]);
    return {
      selectedCount: picked.length,
      totalUsd: picked.reduce((acc, item) => acc + comboItemUsd(item), 0),
    };
  }, [items, selected]);

  const handleAddItem = (item: ProductComboItem, openDrawer = true) => {
    const realProduct = item.productId
      ? catalogProducts.find((row) => row.id === item.productId)
      : undefined;

    if (realProduct) {
      addItem(realProduct, { openDrawer });
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
      { openDrawer },
    );
  };

  const handleAddCombo = () => {
    const picked = items.filter((item) => selected[item.id]);
    picked.forEach((item, index) => {
      handleAddItem(item, index === picked.length - 1);
    });
  };

  if (items.length === 0) return null;

  if (layout === 'complement') {
    const panelId = 'complement-equipo-panel';
    const isExpanded = collapsible ? open : true;

    return (
      <section
        className={cn(
          '@container/complement min-w-0 overflow-hidden rounded-xl border border-border/60 bg-white',
          className,
        )}
        aria-labelledby="combo-titulo"
      >
        {collapsible ? (
          <button
            type="button"
            className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:px-4"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="min-w-0 flex-1">
              <span id="combo-titulo" className="block text-left text-base font-bold text-[#0f1f3d] sm:text-lg">
                {title}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground sm:text-sm">
                {open
                  ? 'Selecciona los complementos que deseas incluir (una opción por columna).'
                  : selectedCount > 0
                    ? `${selectedCount} seleccionado${selectedCount !== 1 ? 's' : ''} · + `
                    : 'Toca para ver complementos opcionales para tu equipo.'}
                {!open && selectedCount > 0 ? (
                  <DualPrice usd={totalUsd} className="inline font-semibold text-[#0f1f3d]" />
                ) : null}
              </span>
            </span>
            <ChevronDown
              className={cn(
                'mt-1 size-5 shrink-0 text-muted-foreground transition-transform',
                open && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>
        ) : hideTitle ? (
          <h2 id="combo-titulo" className="sr-only">
            {title}
          </h2>
        ) : (
          <div className="px-3 py-3 sm:px-4">
            <h2 id="combo-titulo" className="text-base font-bold text-[#0f1f3d] sm:text-lg">
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{subtitle}</p>
            ) : (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
                Selecciona los complementos que deseas incluir (una opción por columna).
              </p>
            )}
          </div>
        )}

        {isExpanded ? (
          <div
            id={panelId}
            className={cn(
              'px-3 pb-3 sm:px-4 sm:pb-4',
              collapsible && 'border-t border-border/40',
            )}
          >
            <ul
              className="mt-3 grid list-none gap-2 p-0 sm:mt-4 sm:gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {items.map((item) => (
                <li key={item.id} className="min-w-0">
                  <ComplementSelectableCard
                    item={item}
                    selected={Boolean(selected[item.id])}
                    onToggle={(checked) =>
                      setSelected((prev) => ({ ...prev, [item.id]: checked }))
                    }
                  />
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground sm:text-sm">
                <span>
                  {selectedCount} seleccionado{selectedCount !== 1 ? 's' : ''}
                </span>
                {selectedCount > 0 ? (
                  <>
                    <span className="mx-1 text-border" aria-hidden="true">
                      |
                    </span>
                    <span>
                      +{' '}
                      <span className="font-semibold text-[#0f1f3d]">
                        <DualPrice usd={totalUsd} className="inline font-semibold text-[#0f1f3d]" />
                      </span>
                    </span>
                  </>
                ) : null}
              </p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 shrink-0 gap-1.5 rounded-md border-red-600/30 px-3.5 text-xs font-bold text-red-600 hover:bg-red-50 focus-visible:ring-red-600 sm:text-sm"
                onClick={handleAddCombo}
                disabled={selectedCount === 0}
              >
                <ShoppingCart className="size-3.5" strokeWidth={1.5} aria-hidden="true" />
                Agregar seleccionados
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

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
        <div className="border-b border-border/40 px-3.5 py-3 sm:px-4">
          <h2 id="combo-titulo" className="text-sm font-bold text-[#0f1f3d] sm:text-base">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{resolvedSubtitle}</p>
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
          isMiniLayout ? 'px-2 py-1.5' : compact ? 'px-3.5 py-3.5 sm:px-4' : embedded ? '' : 'px-4 py-3.5 sm:px-5',
        )}
      >
        {useGrid ? (
          <ul
            className={cn(
              'grid',
              isMiniLayout
                ? 'grid-cols-3 gap-1.5'
                : cn('grid-cols-1 gap-2.5', items.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'),
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
            :             cn(
                'gap-2 py-2.5 sm:gap-3',
                compact ? 'px-3.5 sm:px-4' : embedded ? 'mt-3 rounded-lg px-3 sm:px-4' : 'px-4 sm:px-5',
              ),
        )}
      >
        <p
          className={cn(
            'text-muted-foreground',
            isMiniLayout ? 'text-[0.5625rem] leading-tight' : 'text-xs sm:text-sm',
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
                  <DualPrice usd={totalUsd} className="inline font-semibold text-[#0f1f3d]" />
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
              : 'h-10 gap-1.5 px-3.5 text-xs sm:text-sm',
          )}
          onClick={handleAddCombo}
          disabled={selectedCount === 0}
        >
          <ShoppingCart className={cn(isMiniLayout ? 'size-3' : 'size-3.5')} strokeWidth={1.5} aria-hidden="true" />
          Comprar
        </Button>
      </div>
    </section>
  );
}

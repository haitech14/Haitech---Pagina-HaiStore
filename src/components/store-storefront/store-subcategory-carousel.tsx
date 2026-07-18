import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ResponsiveStaticImage } from '@/components/ui/responsive-static-image';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { CATEGORY_STRIP_TRACK_WRAPPER_CLASS } from '@/lib/category-strip-layout';
import { resolveSubcategoryAttributeLabels } from '@/lib/subcategory-attribute-labels';
import { resolveSubcategoryImage } from '@/lib/subcategory-product-image';
import { formatSubcategoryTabLabel } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const CAROUSEL_GAP_CLASS = 'gap-2 sm:gap-2.5';

/** Placeholder mientras llega el árbol (evita salto de layout). */
export function StoreSubcategoryCarouselSkeleton({
  count = 3,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn('flex gap-2 sm:gap-2.5', className)}
      aria-hidden="true"
      role="presentation"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex min-h-[11.5rem] min-w-[9.5rem] max-w-[12.5rem] flex-col items-center gap-2.5 rounded-xl border border-border/50 bg-white px-3 py-3.5 sm:min-h-[12.75rem] sm:min-w-[10.5rem] sm:gap-3 sm:py-4"
        >
          <div className="size-[4.25rem] animate-pulse rounded-lg bg-neutral-100 sm:size-[5rem]" />
          <div className="h-3 w-20 animate-pulse rounded bg-neutral-100" />
          <div className="h-2.5 w-16 animate-pulse rounded bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

interface StoreSubcategoryCarouselProps {
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  parentName?: string | null;
  parentImage?: string | null;
  products?: Product[];
  onSelect: (subSlug: string | null) => void;
  /** Prefetch del catálogo al pasar el cursor (páginas de categoría). */
  onPrefetch?: (subSlug: string) => void;
  /** Carrusel horizontal (default) o lista vertical junto al banner. */
  layout?: 'carousel' | 'stack';
  /** Etiqueta accesible (p. ej. «Categorías» cuando se reutiliza para raíces). */
  ariaLabel?: string;
  className?: string;
}

function SubcategoryCarouselCard({
  label,
  image,
  attributes,
  isActive,
  onSelect,
  onPrefetch,
}: {
  label: string;
  image: string | null;
  attributes: string[];
  isActive: boolean;
  onSelect: () => void;
  onPrefetch?: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      className={cn(
        'flex h-full min-h-[11.5rem] w-full min-w-[9.5rem] max-w-[12.5rem] flex-col items-center gap-2.5 rounded-xl border bg-white px-3 py-3.5 text-center shadow-[0_1px_4px_rgba(15,31,61,0.06)] transition-all sm:min-h-[12.75rem] sm:min-w-[10.5rem] sm:gap-3 sm:px-3.5 sm:py-4',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        isActive
          ? 'border-red-600 ring-1 ring-red-600/20'
          : 'border-border/70 hover:border-border hover:shadow-[0_2px_8px_rgba(15,31,61,0.08)]',
      )}
    >
      <span className="flex size-[4.25rem] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30 p-1 sm:size-[5rem] sm:p-1.5">
        {image ? (
          <ResponsiveStaticImage
            src={image}
            alt=""
            className="max-h-full max-w-full object-contain"
            wrapperClassName="flex size-full items-center justify-center"
            variant={image.startsWith('/categories/') ? 'category' : 'product-card'}
            loading="lazy"
          />
        ) : (
          <span className="text-base font-bold text-muted-foreground sm:text-lg" aria-hidden="true">
            {label.charAt(0)}
          </span>
        )}
      </span>

      <span className="flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-1.5">
        <span className="block min-h-[2.5rem] text-pretty text-xs font-semibold leading-snug text-foreground sm:min-h-[2.75rem] sm:text-[0.8125rem]">
          {label}
        </span>
        <span className="flex min-h-[1.25rem] w-full flex-wrap items-start justify-center gap-1">
          {attributes.map((attribute) => (
            <span
              key={attribute}
              className="inline-flex max-w-full truncate rounded-full bg-muted/60 px-1.5 py-0.5 text-[0.625rem] font-medium leading-none text-muted-foreground"
            >
              {attribute}
            </span>
          ))}
        </span>
      </span>
    </button>
  );
}

export function StoreSubcategoryCarousel({
  subcategories,
  activeSubSlug,
  parentName = null,
  parentImage = null,
  products = [],
  onSelect,
  onPrefetch,
  layout = 'carousel',
  ariaLabel = 'Subcategorías',
  className,
}: StoreSubcategoryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    watchDrag: emblaShouldWatchDrag,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const fitsInView = !canScrollPrev && !canScrollNext;

  const items = useMemo(
    () =>
      subcategories.map((sub) => ({
        sub,
        label: formatSubcategoryTabLabel(sub.name, parentName),
        // Stock/tree primero: no esperar al grid de productos.
        image: resolveSubcategoryImage(sub, products, parentImage, { preferStock: true }),
        attributes: resolveSubcategoryAttributeLabels(sub, products),
      })),
    [parentImage, parentName, products, subcategories],
  );

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi, items.length]);

  if (subcategories.length === 0) return null;

  if (layout === 'stack') {
    return (
      <section
        aria-label={ariaLabel}
        className={cn('w-full', className)}
        role="tablist"
      >
        <ul className="flex max-h-[min(70vw,22rem)] flex-col gap-2 overflow-y-auto sm:max-h-[24rem]">
          {items.map(({ sub, label, image, attributes }) => {
            const isActive = activeSubSlug === sub.slug;
            return (
              <li key={sub.id} className="flex min-w-0 shrink-0">
                <SubcategoryCarouselCard
                  label={label}
                  image={image}
                  attributes={attributes}
                  isActive={isActive}
                  onSelect={() => onSelect(isActive ? null : sub.slug)}
                  {...(onPrefetch ? { onPrefetch: () => onPrefetch(sub.slug) } : {})}
                />
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

  const arrowClass = cn(
    'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm sm:size-9',
    'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-30',
  );

  return (
    <section
      aria-label={ariaLabel}
      className={cn('w-full', className)}
      role="tablist"
    >
      <div className={cn(CATEGORY_STRIP_TRACK_WRAPPER_CLASS, 'relative')}>
        {canScrollNext ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-muted/30 via-muted/20 to-transparent"
            aria-hidden="true"
          />
        ) : null}

        {items.length > 2 ? (
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(arrowClass, '-left-1')}
            aria-label={`${ariaLabel} anteriores`}
          >
            <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        ) : null}

        <div ref={emblaRef} className="overflow-hidden px-0.5">
          <ul
            className={cn('flex', CAROUSEL_GAP_CLASS, fitsInView && 'w-full justify-center')}
            role="list"
          >
            {items.map(({ sub, label, image, attributes }) => {
              const isActive = activeSubSlug === sub.slug;
              return (
                <li key={sub.id} className="flex min-w-0 shrink-0">
                  <SubcategoryCarouselCard
                    label={label}
                    image={image}
                    attributes={attributes}
                    isActive={isActive}
                    onSelect={() => onSelect(isActive ? null : sub.slug)}
                    {...(onPrefetch ? { onPrefetch: () => onPrefetch(sub.slug) } : {})}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        {items.length > 2 ? (
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(arrowClass, '-right-1')}
            aria-label={`${ariaLabel} siguientes`}
          >
            <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

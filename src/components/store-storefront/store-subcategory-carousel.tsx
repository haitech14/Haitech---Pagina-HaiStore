import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ResponsiveStaticImage } from '@/components/ui/responsive-static-image';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { CATEGORY_STRIP_TRACK_WRAPPER_CLASS } from '@/lib/category-strip-layout';
import { resolveSubcategoryImage } from '@/lib/subcategory-product-image';
import { formatSubcategoryTabLabel } from '@/lib/store-category-display';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const CAROUSEL_GAP_CLASS = 'gap-2 sm:gap-2.5';

interface StoreSubcategoryCarouselProps {
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  parentName?: string | null;
  parentImage?: string | null;
  products?: Product[];
  onSelect: (subSlug: string | null) => void;
  /** Carrusel horizontal (default) o lista vertical junto al banner. */
  layout?: 'carousel' | 'stack';
  className?: string;
}

function SubcategoryCarouselCard({
  label,
  image,
  isActive,
  onSelect,
}: {
  label: string;
  image: string | null;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onSelect}
      className={cn(
        'flex w-full min-w-[10.5rem] max-w-[14rem] items-center gap-2.5 rounded-xl border bg-white px-2.5 py-2 text-left shadow-[0_1px_4px_rgba(15,31,61,0.06)] transition-all sm:min-w-[11.5rem] sm:gap-3 sm:px-3 sm:py-2.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
        isActive
          ? 'border-red-600 ring-1 ring-red-600/20'
          : 'border-border/70 hover:border-border hover:shadow-[0_2px_8px_rgba(15,31,61,0.08)]',
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted/30 p-1 sm:size-12">
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
          <span className="text-[0.625rem] font-bold text-muted-foreground" aria-hidden="true">
            {label.charAt(0)}
          </span>
        )}
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 text-pretty text-xs font-semibold leading-snug text-foreground sm:text-[0.8125rem]">
        {label}
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
  layout = 'carousel',
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

  const items = useMemo(
    () =>
      subcategories.map((sub) => ({
        sub,
        label: formatSubcategoryTabLabel(sub.name, parentName),
        image: resolveSubcategoryImage(sub, products, parentImage),
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
        aria-label="Subcategorías"
        className={cn('w-full', className)}
        role="tablist"
      >
        <ul className="flex max-h-[min(52vw,10.5rem)] flex-col gap-2 overflow-y-auto sm:max-h-[12rem] md:max-h-[13rem]">
          {items.map(({ sub, label, image }) => {
            const isActive = activeSubSlug === sub.slug;
            return (
              <li key={sub.id} className="min-w-0 shrink-0">
                <SubcategoryCarouselCard
                  label={label}
                  image={image}
                  isActive={isActive}
                  onSelect={() => onSelect(isActive ? null : sub.slug)}
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
      aria-label="Subcategorías"
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
            aria-label="Subcategorías anteriores"
          >
            <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        ) : null}

        <div ref={emblaRef} className="overflow-hidden px-0.5">
          <ul className={cn('flex', CAROUSEL_GAP_CLASS)} role="list">
            {items.map(({ sub, label, image }) => {
              const isActive = activeSubSlug === sub.slug;
              return (
                <li key={sub.id} className="min-w-0 shrink-0">
                  <SubcategoryCarouselCard
                    label={label}
                    image={image}
                    isActive={isActive}
                    onSelect={() => onSelect(isActive ? null : sub.slug)}
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
            aria-label="Subcategorías siguientes"
          >
            <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </section>
  );
}

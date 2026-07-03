import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { Skeleton } from '@/components/ui/skeleton';
import { buildHomeCategoryStripItems, type HomeCategoryStripItem } from '@/data/home-category-strip';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { CATEGORY_STRIP_TRACK_WRAPPER_CLASS } from '@/lib/category-strip-layout';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import { categoryImageSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const CATEGORY_CAROUSEL_GAP_CLASS = 'gap-3 sm:gap-4';
const CATEGORY_STRIP_SCROLL_STEP = 6;
const CATEGORY_SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-1rem)/2.5)] md:flex-[0_0_calc((100%-2rem)/4)] lg:flex-[0_0_calc((100%-5rem)/6)]';

const HOVER_REVEAL_CLASS = cn(
  'max-h-0 overflow-hidden opacity-0 transition-all duration-300 ease-out',
  'group-hover:max-h-32 group-hover:opacity-100',
  'group-focus-visible:max-h-32 group-focus-visible:opacity-100',
);

function CategoryShowcaseCard({
  item,
  priority = false,
}: {
  item: HomeCategoryStripItem;
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(item.image) && !hasError;

  return (
    <Link
      to={item.href}
      className={cn(
        'group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-muted/80 text-center shadow-[0_2px_12px_rgba(15,31,61,0.09)]',
        'transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,31,61,0.11)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      )}
      aria-label={`${item.name}: ${item.description}. ${item.ctaLabel}`}
    >
      <div className="relative mx-2.5 mt-2.5 overflow-hidden rounded-xl bg-muted/55 sm:mx-3 sm:mt-2.5">
        <div className="flex aspect-[5/4] w-full items-center justify-center px-2 py-2 sm:px-3 sm:py-2.5">
          {showImage ? (
            (() => {
              const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(item.image!);
              return (
                <picture className="flex size-full items-center justify-center">
                  <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
                  <img
                    src={fallbackSrc}
                    alt=""
                    width={280}
                    height={224}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 ease-out group-hover:scale-[1.03] group-focus-visible:scale-[1.03]"
                    loading={priority ? 'eager' : 'lazy'}
                    {...(priority ? { fetchPriority: 'high' as const } : {})}
                    sizes={sizes}
                    onError={() => setHasError(true)}
                  />
                </picture>
              );
            })()
          ) : (
            <div
              className="flex size-20 items-center justify-center rounded-full bg-muted font-hero text-2xl font-bold text-muted-foreground"
              aria-hidden="true"
            >
              {item.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-2.5 pb-3 pt-0.5 sm:px-3 sm:pb-3.5 sm:pt-1">
        <p className="text-pretty text-center font-hero text-[0.875rem] font-bold leading-tight text-foreground sm:text-[0.9375rem]">
          {item.name}
        </p>

        <div className={cn('mt-2 flex flex-col items-center gap-2', HOVER_REVEAL_CLASS)}>
          <p className="text-pretty text-center text-xs leading-relaxed text-muted-foreground sm:text-[0.8125rem]">
            {item.description}
          </p>

          <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-red-600 sm:text-[0.8125rem]">
            {item.ctaLabel}
            <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CategoryStripSkeleton() {
  return (
    <ul className={cn('flex', CATEGORY_CAROUSEL_GAP_CLASS)} role="list">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className={CATEGORY_SLIDE_CLASS}>
          <div className="flex flex-col rounded-2xl border border-border bg-muted/80 p-2.5 shadow-[0_2px_12px_rgba(15,31,61,0.09)]">
            <Skeleton className="aspect-[5/4] w-full rounded-xl" />
            <Skeleton className="mx-auto mt-1 h-4 w-20" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CategoryStrip() {
  const { data: categoryTreeData, isLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;

  const items = useMemo(
    () => buildHomeCategoryStripItems(buildLandingMenuCategoriesFromTree(categoryTree)),
    [categoryTree],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
    skipSnaps: false,
    slidesToScroll: CATEGORY_STRIP_SCROLL_STEP,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  const arrowClass = cn(
    'absolute top-[42%] z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm',
    'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-30',
  );

  if (!isLoading && items.length === 0) return null;

  return (
    <section aria-label="Categorías de productos" className="bg-white">
      <div className="container pb-8 pt-11 sm:pb-10 sm:pt-12 lg:pt-14">
        <div className={cn(CATEGORY_STRIP_TRACK_WRAPPER_CLASS, 'relative')}>
          {canScrollNext ? (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-white via-white/85 to-transparent"
              aria-hidden="true"
            />
          ) : null}

          {items.length > 1 ? (
            <button
              type="button"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              className={cn(arrowClass, '-left-1')}
              aria-label="Categorías anteriores"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
          ) : null}

          <div ref={emblaRef} className="overflow-hidden px-0.5">
            {isLoading ? (
              <CategoryStripSkeleton />
            ) : (
              <ul className={cn('flex', CATEGORY_CAROUSEL_GAP_CLASS)} role="list">
                {items.map((item, index) => (
                  <li key={item.id} className={CATEGORY_SLIDE_CLASS}>
                    <CategoryShowcaseCard item={item} priority={index < 6} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {items.length > 1 ? (
            <button
              type="button"
              onClick={scrollNext}
              disabled={!canScrollNext}
              className={cn(arrowClass, '-right-1')}
              aria-label="Categorías siguientes"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}

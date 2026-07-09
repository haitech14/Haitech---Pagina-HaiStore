import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  resolveHomeHeroCategoryCarouselItems,
  type HomeHeroCategoryCarouselItem,
} from '@/data/home-hero-category-carousel';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { categoryImageSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const CAROUSEL_GAP_CLASS = 'gap-2 sm:gap-2.5';
/** 6 categorías visibles en desktop; menos en pantallas pequeñas. */
const SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.5rem)/2.2)] sm:flex-[0_0_calc((100%-1.25rem)/3)] md:flex-[0_0_calc((100%-1.875rem)/4)] lg:flex-[0_0_calc((100%-3.125rem)/6)] xl:flex-[0_0_calc((100%-3.125rem)/6)]';

const carouselArrowClass =
  'absolute top-[42%] z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-white/90 text-[#86868b] shadow-[0_2px_8px_rgba(15,31,61,0.12)] backdrop-blur-[2px] transition-colors hover:border-border/70 hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

function CategoryCarouselTile({
  item,
  priority = false,
}: {
  item: HomeHeroCategoryCarouselItem;
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(item.image) && !hasError;

  return (
    <Link
      to={item.href}
      className={cn(
        'group flex h-full min-h-[10.25rem] flex-col overflow-hidden rounded-2xl bg-[#ececee] p-3 transition-shadow duration-300 sm:min-h-[10.75rem] sm:p-3.5',
        'hover:shadow-[0_4px_16px_rgba(15,31,61,0.08)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
      aria-label={`${item.name}. ${item.description}. Ver productos`}
    >
      <div className="flex aspect-[4/3] items-center justify-center p-1.5 transition-transform duration-300 group-hover:scale-[0.97] group-focus-visible:scale-[0.97] sm:p-2">
        {showImage ? (
          (() => {
            const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(item.image!);
            return (
              <picture className="flex size-full items-center justify-center">
                <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
                <img
                  src={fallbackSrc}
                  alt=""
                  width={240}
                  height={180}
                  className="size-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]"
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
            className="flex size-full items-center justify-center rounded-xl bg-[#e0e0e4] font-hero text-2xl font-bold text-[#86868b]"
            aria-hidden="true"
          >
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col items-center pb-0.5 pt-1 text-center">
        <p className="text-pretty text-xs font-bold leading-snug text-[#111111] sm:text-[0.8125rem]">
          {item.name}
        </p>

        <div
          className={cn(
            'flex max-h-0 flex-col items-center overflow-hidden opacity-0 transition-all duration-300 ease-out',
            'group-hover:max-h-20 group-hover:opacity-100 group-hover:mt-1.5',
            'group-focus-visible:max-h-20 group-focus-visible:opacity-100 group-focus-visible:mt-1.5',
          )}
        >
          <p className="text-pretty text-[0.6875rem] leading-snug text-[#666666] sm:text-xs">
            {item.description}
          </p>
          <span className="mt-1.5 inline-flex items-center gap-0.5 text-[0.6875rem] font-semibold text-[#E30613] sm:text-xs">
            Ver productos
            <ArrowRight className="size-3 shrink-0" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

function CategoryCarouselSkeleton() {
  return (
    <ul className={cn('flex overflow-hidden', CAROUSEL_GAP_CLASS)} role="list">
      {Array.from({ length: 6 }).map((_, index) => (
        <li key={index} className={SLIDE_CLASS}>
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
        </li>
      ))}
    </ul>
  );
}

function CategoryCarouselTrack({ items }: { items: HomeHeroCategoryCarouselItem[] }) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const itemsKey = useMemo(() => items.map((item) => item.id).join('|'), [items]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, itemsKey]);

  const showControls = items.length > 2;

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex', CAROUSEL_GAP_CLASS)} role="list" aria-label="Categorías de productos">
          {items.map((item, index) => (
            <li key={item.id} className={SLIDE_CLASS}>
              <CategoryCarouselTile item={item} priority={index < 4} />
            </li>
          ))}
        </ul>
      </div>

      {showControls ? (
        <>
          <button
            type="button"
            className={cn(carouselArrowClass, 'left-2 sm:left-3')}
            aria-label="Categorías anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(carouselArrowClass, 'right-2 sm:right-3')}
            aria-label="Categorías siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

export function HomeHeroCategoryCarousel() {
  const { data: categoryTreeData, isLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;

  const items = useMemo(
    () => resolveHomeHeroCategoryCarouselItems(categoryTree),
    [categoryTree],
  );

  if (!isLoading && items.length === 0) return null;

  return (
    <div aria-label="Categorías destacadas">
      {isLoading ? <CategoryCarouselSkeleton /> : <CategoryCarouselTrack items={items} />}
    </div>
  );
}

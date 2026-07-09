import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  buildHomeCategoryStripItems,
  resolveHomeCategoryStripCategories,
  type HomeCategoryStripItem,
} from '@/data/home-category-strip';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { loadCatalogIndex } from '@/lib/catalog-featured';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { categoryImageSources } from '@/lib/responsive-image';
import { cn, formatPenFromUsdDisplay } from '@/lib/utils';

const CATEGORY_STRIP_TITLE_ID = 'home-category-strip-title';
const CAROUSEL_GAP_CLASS = 'gap-5';
const CATEGORY_CARD_IMAGE_CLASS =
  'h-[5.75rem] w-full rounded-xl bg-[#f5f5f7] p-3.5 sm:h-[6.25rem] sm:p-4 lg:h-[7rem] lg:p-4';
const CATEGORY_CARD_IMAGE_INNER_CLASS =
  'size-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.03]';
const CATEGORY_CARD_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)] lg:flex-[0_0_calc((100%-5rem)/5)] xl:flex-[0_0_calc((100%-3.75rem)/4)]';
const SKELETON_CARD_COUNT = 5;

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/40 bg-white/90 text-[#86868b] shadow-sm transition-colors hover:border-border/70 hover:bg-white hover:text-[#1d1d1f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

function resolveCategoryPriceLabel(item: HomeCategoryStripItem): string | null {
  if (item.priceSubtext) return item.priceSubtext;
  if (item.priceFromUsd != null && item.priceFromUsd > 0) {
    return `Desde ${formatPenFromUsdDisplay(item.priceFromUsd, item.name)}`;
  }
  return null;
}

function CategoryStripTile({
  item,
  priority = false,
}: {
  item: HomeCategoryStripItem;
  priority?: boolean;
}) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(item.image) && !hasError;
  const priceLabel = resolveCategoryPriceLabel(item);

  return (
    <article
      className={cn(
        'group relative flex h-full w-full flex-col rounded-2xl border border-border/35 bg-white p-4 shadow-[0_1px_4px_rgba(15,31,61,0.04)] transition-shadow duration-300 sm:p-5',
        'hover:shadow-[0_4px_16px_rgba(15,31,61,0.06)]',
      )}
    >
      {item.badge ? (
        <span className="absolute right-2.5 top-2.5 z-[2] rounded-full border border-[#E30613]/25 bg-[#E30613]/[0.07] px-1.5 py-px text-[0.5625rem] font-medium leading-tight text-[#E30613] sm:text-[0.625rem]">
          {item.badge}
        </span>
      ) : null}

      <div className={CATEGORY_CARD_IMAGE_CLASS}>
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
                  className={CATEGORY_CARD_IMAGE_INNER_CLASS}
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
            className="flex size-full items-center justify-center rounded-xl bg-[#f0f0f2] font-hero text-3xl font-bold text-[#86868b]"
            aria-hidden="true"
          >
            {item.name.charAt(0)}
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-1 flex-col sm:mt-4">
        <h3 className="text-pretty text-[0.8125rem] font-semibold leading-snug text-[#1d1d1f] sm:text-sm">
          {item.name}
        </h3>
        {priceLabel ? (
          <p className="mt-1 text-[0.6875rem] font-normal text-[#888888] sm:text-xs">{priceLabel}</p>
        ) : item.priceSubtext ? (
          <p className="mt-1 text-[0.6875rem] font-normal text-[#888888] sm:text-xs">{item.priceSubtext}</p>
        ) : null}
        <div className="mt-auto pt-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="h-7 min-h-7 w-full rounded-md border-[#E30613]/35 bg-transparent px-2 py-1 text-[0.6875rem] font-medium text-[#E30613] shadow-none hover:border-[#E30613]/60 hover:bg-[#E30613]/[0.04] hover:text-[#c20510]"
          >
            <Link to={item.href} aria-label={`${item.name}. ${item.ctaLabel}`}>
              {item.ctaLabel}
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

function CategoryStripSkeleton() {
  return (
    <div className="relative px-10 sm:px-12">
      <ul className={cn('flex overflow-hidden', CAROUSEL_GAP_CLASS)} role="list">
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, index) => (
          <li key={index} className={CATEGORY_CARD_SLIDE_CLASS}>
            <Skeleton className="h-[16rem] w-full rounded-2xl" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryStripCarousel({ items }: { items: HomeCategoryStripItem[] }) {
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
    <div className="flex flex-col gap-4">
      <div className={cn('relative', showControls && 'px-10 sm:px-12')}>
        {showControls ? (
          <>
            <button
              type="button"
              className={cn(carouselArrowClass, 'left-0')}
              aria-label="Categorías anteriores"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(carouselArrowClass, 'right-0')}
              aria-label="Categorías siguientes"
              disabled={!canScrollNext}
              onClick={scrollNext}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : null}

        <div className="overflow-hidden" ref={emblaRef}>
          <ul className={cn('flex', CAROUSEL_GAP_CLASS)} role="list">
            {items.map((item, index) => (
              <li key={item.id} className={CATEGORY_CARD_SLIDE_CLASS}>
                <CategoryStripTile item={item} priority={index < 5} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="sr-only">{items.length} categorías</p>
    </div>
  );
}

export function CategoryStrip() {
  const { data: categoryTreeData, isLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;
  const [catalogReady, setCatalogReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void loadCatalogIndex()
      .then(() => {
        if (!cancelled) setCatalogReady(true);
      })
      .catch(() => {
        if (!cancelled) setCatalogReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = useMemo(
    () => buildHomeCategoryStripItems(resolveHomeCategoryStripCategories(categoryTree)),
    [categoryTree, catalogReady],
  );

  if (!isLoading && items.length === 0) return null;

  return (
    <section aria-labelledby={CATEGORY_STRIP_TITLE_ID} className="home-landing-sans bg-[#fafafa]">
      <div className="container py-10 sm:py-12 lg:py-14">
        <h2
          id={CATEGORY_STRIP_TITLE_ID}
          className="home-section-title mb-5 text-center text-balance text-xl font-bold tracking-tight text-[#111111] sm:mb-6 sm:text-2xl lg:mb-7 lg:text-[1.75rem] lg:leading-tight"
        >
          Explora nuestras categorías
        </h2>

        {isLoading ? <CategoryStripSkeleton /> : <CategoryStripCarousel items={items} />}
      </div>
    </section>
  );
}

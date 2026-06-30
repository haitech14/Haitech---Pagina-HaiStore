import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import type { Category } from '@/data/categories';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { categoryLandingPath } from '@/lib/category-path';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { CATEGORY_STRIP_TRACK_WRAPPER_CLASS } from '@/lib/category-strip-layout';
import { categoryImageSources } from '@/lib/responsive-image';
import { CarouselDots } from '@/components/ui/carousel-dots';
import { cn } from '@/lib/utils';

const CATEGORY_SLIDE_CLASS =
  'min-w-0 flex-[0_0_calc((100%-0.5rem)/2.5)] sm:flex-[0_0_calc((100%-0.75rem)/4)] md:flex-[0_0_calc((100%-1rem)/5)] lg:flex-[0_0_calc((100%-1.25rem)/6)] xl:flex-[0_0_calc((100%-1.25rem)/6)]';

function CategoryImage({ category, priority }: { category: Category; priority?: boolean }) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(category.image) && !hasError;

  return (
    <div className="flex size-[6.25rem] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] ring-1 ring-border/50 sm:size-36 md:size-40 lg:size-44">
      {showImage ? (
        (() => {
          const { webpSrcSet, fallbackSrc, sizes } = categoryImageSources(category.image!);
          return (
            <picture className="flex size-[88%] items-center justify-center">
              <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
              <img
                src={fallbackSrc}
                alt=""
                width={176}
                height={176}
                className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                loading={priority ? 'eager' : 'lazy'}
                {...(priority ? { fetchPriority: 'high' as const } : {})}
                sizes={sizes}
                onError={() => setHasError(true)}
              />
            </picture>
          );
        })()
      ) : (
        <div className="flex size-[70%] items-center justify-center rounded-full bg-neutral-300/60">
          <category.icon
            className="size-10 text-muted-foreground/50 transition-colors group-hover:text-red-600/40 sm:size-12"
            aria-hidden="true"
            strokeWidth={1.25}
          />
        </div>
      )}
    </div>
  );
}

function CategoryCard({ category, priority }: { category: Category; priority?: boolean }) {
  return (
    <Link
      to={categoryLandingPath(category.slug)}
      className="group flex w-full flex-col items-center gap-1.5 rounded-lg py-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-2"
      aria-label={`Ver productos de ${category.name}`}
    >
      <div className="rounded-full transition-shadow group-hover:ring-2 group-hover:ring-red-600/40 group-hover:ring-offset-2 group-hover:ring-offset-background">
        <CategoryImage category={category} {...(priority ? { priority: true } : {})} />
      </div>

      <p className="line-clamp-2 text-balance text-xs font-medium leading-snug text-foreground sm:text-sm">
        {category.name}
      </p>
    </Link>
  );
}

export function CategoryStrip() {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const categoryStripItems = useMemo(
    () => buildLandingMenuCategoriesFromTree(categoryTree),
    [categoryTree],
  );

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
    skipSnaps: false,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setScrollSnaps(emblaApi.scrollSnapList());
    };

    update();
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  const arrowClass = cn(
    'absolute top-[38%] z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/60 bg-white shadow-sm',
    'transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-30',
    'hidden sm:flex',
  );

  return (
    <section aria-labelledby="categorias-titulo">
      <div className="container pb-4 pt-3 sm:pb-5 sm:pt-4">
        <header className="mx-auto mb-5 max-w-3xl text-center sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
            <h2
              id="categorias-titulo"
              className="text-balance text-xl font-bold tracking-tight text-[#0f1f3d] sm:text-2xl"
            >
              Explora nuestras categorías
            </h2>
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
          </div>
        </header>

        <div className={cn(CATEGORY_STRIP_TRACK_WRAPPER_CLASS, 'relative')}>
          {canScrollNext ? (
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-background via-background/80 to-transparent sm:hidden"
              aria-hidden="true"
            />
          ) : null}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(arrowClass, '-left-1 lg:-left-3')}
            aria-label="Categorías anteriores"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div ref={emblaRef} className="overflow-hidden px-0.5">
            <ul className="flex gap-1 sm:gap-1.5 lg:gap-2" role="list" aria-label="Categorías de productos">
              {categoryStripItems.map((category, index) => (
                <li key={category.slug} className={CATEGORY_SLIDE_CLASS}>
                  <CategoryCard
                    category={category}
                    {...(index < 4 ? { priority: true as const } : {})}
                  />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(arrowClass, '-right-1 lg:-right-3')}
            aria-label="Categorías siguientes"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {scrollSnaps.length > 1 ? (
          <CarouselDots
            count={scrollSnaps.length}
            selectedIndex={selectedIndex}
            onSelect={scrollTo}
            ariaLabel="Páginas del carrusel de categorías"
            className="mt-3 sm:hidden"
          />
        ) : null}
      </div>
    </section>
  );
}

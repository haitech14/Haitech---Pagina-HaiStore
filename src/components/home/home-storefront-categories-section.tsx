import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

import {
  HOME_STOREFRONT_CATEGORIES,
  type HomeStorefrontCategoryCard,
} from '@/data/home-storefront-mockup';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

/** 2 filas × 5 columnas por vista; el resto se pagina en carrusel. */
const CATEGORIES_PER_PAGE = 10;

const categoryGridClass =
  'grid grid-cols-2 gap-x-2 gap-y-0 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-0 lg:grid-cols-5 lg:gap-x-4 lg:gap-y-0';

function chunkCategories(
  items: readonly HomeStorefrontCategoryCard[],
  size: number,
): HomeStorefrontCategoryCard[][] {
  const pages: HomeStorefrontCategoryCard[][] = [];
  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }
  return pages;
}

function CategoryCard({
  category,
  priority = false,
}: {
  category: HomeStorefrontCategoryCard;
  priority?: boolean;
}) {
  return (
    <Link
      to={category.href}
      className={cn(
        'group relative flex min-h-[10rem] items-center justify-center overflow-visible bg-transparent',
        'sm:min-h-[11.5rem] lg:min-h-[13rem]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
      aria-label={category.label}
    >
      <img
        src={`${category.imageSrc}?v=color-1`}
        alt=""
        width={640}
        height={640}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
        className={cn(
          'h-[10.5rem] w-auto max-w-[100%] object-contain object-center sm:h-[12rem] lg:h-[13.5rem]',
          'origin-center transition-transform duration-300 ease-out will-change-transform',
          'group-hover:scale-[0.88] motion-reduce:transition-none motion-reduce:group-hover:scale-100',
        )}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'low' as const } : {})}
      />

      <span
        className={cn(
          'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-1',
          'text-center text-sm font-extrabold uppercase tracking-[0.06em] text-white',
          'drop-shadow-[0_1px_3px_rgba(0,0,0,0.65)] sm:text-base lg:text-lg',
        )}
      >
        {category.label}
      </span>
    </Link>
  );
}

function CategoryGrid({
  categories,
  priority = false,
}: {
  categories: readonly HomeStorefrontCategoryCard[];
  priority?: boolean;
}) {
  return (
    <ul className={categoryGridClass} role="list">
      {categories.map((category, index) => (
        <li key={category.id} className="min-w-0">
          <CategoryCard category={category} priority={priority && index < 5} />
        </li>
      ))}
    </ul>
  );
}

export function HomeStorefrontCategoriesSection() {
  const categories = HOME_STOREFRONT_CATEGORIES;
  const pages = chunkCategories(categories, CATEGORIES_PER_PAGE);
  const hasCarousel = categories.length > CATEGORIES_PER_PAGE;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSnaps();
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', updateSnaps);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', updateSnaps);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      aria-labelledby="home-storefront-categories-title"
      className="bg-white"
    >
      <div className="container py-6 sm:py-8">
        <header className="mb-4 text-center sm:mb-5">
          <p className="text-sm font-medium text-[#6B7280] sm:text-base">Categorías</p>
          <h2
            id="home-storefront-categories-title"
            className="mt-1 text-balance text-xl font-extrabold tracking-tight text-[#111111] sm:text-2xl lg:text-[1.75rem]"
          >
            Explora nuestra gama de productos
          </h2>
        </header>

        {hasCarousel ? (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <ul className="flex touch-pan-y" role="list">
                {pages.map((page, pageIndex) => (
                  <li key={pageIndex} className="min-w-0 flex-[0_0_100%]">
                    <CategoryGrid categories={page} priority={pageIndex === 0} />
                  </li>
                ))}
              </ul>
            </div>

            {scrollSnaps.length > 1 ? (
              <div
                className="mt-4 flex items-center justify-center gap-1.5"
                role="tablist"
                aria-label="Paginación de categorías"
              >
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    role="tab"
                    aria-selected={index === selectedIndex}
                    aria-label={`Ir al grupo ${index + 1} de categorías`}
                    onClick={() => scrollTo(index)}
                    className={cn(
                      'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                      index === selectedIndex ? 'bg-[#E30613]' : 'bg-neutral-300 hover:bg-neutral-400',
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <CategoryGrid categories={categories} priority />
        )}
      </div>
    </section>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { ProductShowcaseCard } from '@/components/product-showcase-card';
import type { FeaturedProduct } from '@/data/featured-products';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

export interface ProductCarouselSectionProps {
  sectionId: string;
  title: string;
  subtitle?: string;
  products: FeaturedProduct[];
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Oculta cabecera y enlace (p. ej. cuando la envuelve una sección con tabs). */
  hideHeader?: boolean;
  /** Flechas laterales (secciones de inicio). */
  showNavArrows?: boolean;
}

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 sm:size-10';

export function ProductCarouselSection({
  sectionId,
  title,
  subtitle,
  products,
  viewAllHref = '/tienda',
  viewAllLabel = 'Ver todos',
  hideHeader = false,
  showNavArrows = false,
}: ProductCarouselSectionProps) {
  const titleId = `${sectionId}-titulo`;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
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

  const productIdsKey = useMemo(() => products.map((product) => product.id).join('|'), [products]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, productIdsKey]);

  const showDots = scrollSnaps.length > 1;
  const showArrows = showNavArrows && products.length > 0;

  const sectionLabel = hideHeader ? undefined : titleId;

  return (
    <section aria-labelledby={sectionLabel}>
      {!hideHeader ? (
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <h2
              id={titleId}
              className="text-2xl font-bold tracking-tight text-[#0f1f3d] sm:text-[1.75rem]"
            >
              {title}
            </h2>
            {subtitle ? (
              <p className="mt-2 text-sm text-muted-foreground sm:text-[0.95rem]">{subtitle}</p>
            ) : null}
          </div>
          <Link
            to={viewAllHref}
            className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:pt-1"
          >
            {viewAllLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <div className={cn('relative', showArrows && 'px-10 sm:px-12')}>
          {showArrows ? (
            <>
              <button
                type="button"
                className={cn(carouselArrowClass, 'left-0')}
                aria-label="Productos anteriores"
                disabled={!canScrollPrev}
                onClick={scrollPrev}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className={cn(carouselArrowClass, 'right-0')}
                aria-label="Productos siguientes"
                disabled={!canScrollNext}
                onClick={scrollNext}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </>
          ) : null}

          <div className="overflow-hidden" ref={emblaRef}>
            {products.length > 0 ? (
              <ul className="flex flex-nowrap gap-3 sm:gap-4">
                {products.map((product) => (
                  <li
                    key={product.id}
                    className="min-w-0 shrink-0 flex-[0_0_78%] sm:flex-[0_0_calc((100%-1rem)/2)] md:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-3rem)/4)] xl:flex-[0_0_calc((100%-4rem)/5)]"
                  >
                    <ProductShowcaseCard product={product} variant="featured" brandTone="accent" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground" role="status">
                No hay productos en esta categoría por ahora.
              </p>
            )}
          </div>
        </div>

        {showDots && products.length > 0 && (
          <div
            className="flex items-center justify-center gap-1.5"
            role="tablist"
            aria-label={`Páginas del carrusel: ${title || sectionId}`}
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Ir a la página ${index + 1} de ${scrollSnaps.length}`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  selectedIndex === index
                    ? 'bg-red-600'
                    : 'bg-neutral-300 hover:bg-neutral-400',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

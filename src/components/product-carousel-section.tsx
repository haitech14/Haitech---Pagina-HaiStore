import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
}

export function ProductCarouselSection({
  sectionId,
  title,
  subtitle,
  products,
  viewAllHref = '/tienda',
  viewAllLabel = 'Ver todos',
}: ProductCarouselSectionProps) {
  const titleId = `${sectionId}-titulo`;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

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

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, products]);

  const showDots = scrollSnaps.length > 1;

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2
            id={titleId}
            className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.75rem]"
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-2 text-sm text-neutral-500 sm:text-[0.95rem]">{subtitle}</p>
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

      <div className="flex flex-col gap-4">
        <div className="overflow-hidden" ref={emblaRef}>
          {products.length > 0 ? (
            <ul className="flex gap-4">
              {products.map((product) => (
                <li
                  key={product.id}
                  className="min-w-0 flex-[0_0_82%] sm:flex-[0_0_48%] md:flex-[0_0_32%] lg:flex-[0_0_calc((100%-4rem)/5)]"
                >
                  <ProductShowcaseCard product={product} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-12 text-center text-sm text-neutral-500" role="status">
              No hay productos en esta categoría por ahora.
            </p>
          )}
        </div>

        {showDots && products.length > 0 && (
          <div
            className="flex justify-center gap-2"
            role="tablist"
            aria-label={`Páginas del carrusel: ${title}`}
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
                  'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
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

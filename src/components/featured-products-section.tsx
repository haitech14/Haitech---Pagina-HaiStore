import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';

import { ProductShowcaseCard } from '@/components/product-showcase-card';
import type { FeaturedProduct } from '@/data/featured-products';
import { chunkFeaturedProducts, FEATURED_PRODUCTS_PER_VIEW } from '@/lib/featured-carousel';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

/** Cinco tarjetas por fila (gap-4 = 1rem × 4 huecos entre 5 columnas). */
const FEATURED_PAGE_ITEM_CLASS =
  'min-w-0 w-full sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-4rem)/5)] lg:max-w-[calc((100%-4rem)/5)] lg:flex-[0_0_calc((100%-4rem)/5)]';

export interface FeaturedProductsSectionProps {
  products: FeaturedProduct[];
}

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const titleId = 'productos-destacados-titulo';
  const pages = useMemo(() => chunkFeaturedProducts(products), [products]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

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
    setSelectedIndex(0);
  }, [emblaApi, pages]);

  const showDots = pages.length > 1;

  return (
    <section aria-labelledby={titleId} className="w-full">
      <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <span
            className="mb-3 block h-1 w-10 rounded-full bg-red-600"
            aria-hidden="true"
          />
          <h2
            id={titleId}
            className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
          >
            Productos destacados
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:text-[0.95rem]">
            Descubre nuestros productos más populares con ofertas exclusivas
          </p>
        </div>
        <Link
          to="/tienda"
          className="inline-flex min-h-11 shrink-0 items-center gap-1 self-start text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 sm:pt-1"
        >
          Ver todos los productos
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="flex flex-col gap-7">
        <div className="overflow-hidden pb-2" ref={emblaRef}>
          <ul className="flex touch-pan-y">
            {pages.map((page, pageIndex) => (
              <li key={pageIndex} className="min-w-0 shrink-0 flex-[0_0_100%]">
                <ul className="flex flex-wrap gap-4 lg:flex-nowrap">
                  {page.map((product) => (
                    <li key={product.id} className={FEATURED_PAGE_ITEM_CLASS}>
                      <ProductShowcaseCard
                        product={product}
                        variant="featured"
                      />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        {showDots ? (
          <div
            className="flex items-center justify-center gap-1 pt-2"
            role="tablist"
            aria-label="Páginas del carrusel de productos destacados"
          >
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Ir a la vista ${index + 1} de ${pages.length} (productos ${index * FEATURED_PRODUCTS_PER_VIEW + 1} a ${Math.min((index + 1) * FEATURED_PRODUCTS_PER_VIEW, products.length)} de ${products.length})`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'size-2.5 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  selectedIndex === index
                    ? 'bg-red-600'
                    : 'bg-neutral-300 hover:bg-neutral-400',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

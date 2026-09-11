import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { StoreCatalogProductCard } from '@/components/store-storefront/store-catalog-product-card';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  HAITECH_PRODUCT_CAROUSEL_ARROW,
  HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT,
  HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT,
  HAITECH_PRODUCT_CAROUSEL_GAP,
  HAITECH_PRODUCT_CAROUSEL_SLIDE,
} from '@/lib/haitech-product-carousel-layout';
import { cn, uniqueById } from '@/lib/utils';
import type { Product } from '@/types/product';

export function HaitechHomeProductCarousel({
  products,
  className,
  ariaLabel = 'Productos',
}: {
  products: readonly Product[];
  className?: string;
  ariaLabel?: string;
}) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const slides = useMemo(() => uniqueById(products), [products]);
  const showNav = slides.length > 1;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });

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
  }, [emblaApi, products]);

  if (slides.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      {showNav ? (
        <>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_LEFT)}
            aria-label="Productos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, HAITECH_PRODUCT_CAROUSEL_ARROW_RIGHT)}
            aria-label="Productos siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', HAITECH_PRODUCT_CAROUSEL_GAP)} role="list" aria-label={ariaLabel}>
          {slides.map((product) => (
            <li key={product.id} className={HAITECH_PRODUCT_CAROUSEL_SLIDE}>
              <StoreCatalogProductCard product={product} variant="carousel" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

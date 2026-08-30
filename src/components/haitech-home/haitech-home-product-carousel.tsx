import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { HaitechHomeProductCard } from '@/components/haitech-home/haitech-home-product-card';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import {
  HAITECH_PRODUCT_CAROUSEL_ARROW,
  HAITECH_PRODUCT_CAROUSEL_GAP,
  HAITECH_PRODUCT_CAROUSEL_GUTTER,
  HAITECH_PRODUCT_CAROUSEL_SLIDE,
} from '@/lib/haitech-product-carousel-layout';
import { cn } from '@/lib/utils';

export function HaitechHomeProductCarousel({
  products,
  className,
  ariaLabel = 'Productos',
}: {
  products: readonly HaitechShopProduct[];
  className?: string;
  ariaLabel?: string;
}) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const showNav = products.length > 1;

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

  if (products.length === 0) return null;

  return (
    <div className={cn('relative', showNav && HAITECH_PRODUCT_CAROUSEL_GUTTER, className)}>
      {showNav ? (
        <>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, 'left-0')}
            aria-label="Productos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(HAITECH_PRODUCT_CAROUSEL_ARROW, 'right-0')}
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
          {products.map((product) => (
            <li key={product.id} className={HAITECH_PRODUCT_CAROUSEL_SLIDE}>
              <HaitechHomeProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

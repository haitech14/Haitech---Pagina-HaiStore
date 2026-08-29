import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { HaitechHomeProductCard } from '@/components/haitech-home/haitech-home-product-card';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const GAP = 'gap-2.5 sm:gap-3 md:gap-4';
/** ~1.15 móvil (peek) · 2.2 sm · 3 md · 5 desktop. */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.625rem)/1.15)] sm:flex-[0_0_calc((100%-0.75rem)/2.15)] md:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-4rem)/5)]';

const arrowClass =
  'absolute top-[42%] z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#E30613] shadow-[0_2px_10px_rgba(15,31,61,0.10)] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:flex sm:size-10 sm:top-[228px]';

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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
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
    <div className={cn('relative px-0 sm:px-8 lg:px-10', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex', GAP)} role="list" aria-label={ariaLabel}>
          {products.map((product) => (
            <li key={product.id} className={SLIDE}>
              <HaitechHomeProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>

      {products.length > 1 ? (
        <>
          <button
            type="button"
            className={cn(arrowClass, 'left-0 sm:-left-4 lg:-left-5')}
            aria-label="Productos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(arrowClass, 'right-0 sm:-right-4 lg:-right-5')}
            aria-label="Productos siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

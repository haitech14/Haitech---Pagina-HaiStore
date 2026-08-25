import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { QtcProductCard } from '@/components/qtc-replica/qtc-product-card';
import type { QtcProductCardData } from '@/data/qtc-replica';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const GAP = 'gap-3';
/** ~1.5 móvil · 3 tablet · 6 desktop (ancho ~165–180px). */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/1.55)] sm:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-3.75rem)/6)]';

const arrowClass =
  'absolute top-[180px] z-10 flex size-[38px] -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-[#1A1A1A] shadow-[0_4px_14px_rgba(15,31,61,0.14)] transition-colors hover:text-[#7228F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7228F5]/40 disabled:pointer-events-none disabled:opacity-30';

export function QtcProductCarousel({
  products,
  className,
  ariaLabel = 'Productos',
}: {
  products: readonly QtcProductCardData[];
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

  if (products.length === 0) return null;

  return (
    <div className={cn('relative', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex', GAP)} role="list" aria-label={ariaLabel}>
          {products.map((product) => (
            <li key={product.id} className={SLIDE}>
              <QtcProductCard product={product} />
            </li>
          ))}
        </ul>
      </div>

      {products.length > 1 ? (
        <>
          <button
            type="button"
            className={cn(arrowClass, '-left-2 sm:-left-3 lg:-left-4')}
            aria-label="Productos anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(arrowClass, '-right-2 sm:-right-3 lg:-right-4')}
            aria-label="Productos siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

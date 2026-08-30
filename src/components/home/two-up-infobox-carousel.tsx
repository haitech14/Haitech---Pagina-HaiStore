import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const SLIDE_TWO_UP =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-0.875rem)/2)] md:flex-[0_0_calc((100%-1rem)/2)] lg:flex-[0_0_calc((100%-1rem)/2)]';

const ARROW =
  'absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#E30613] shadow-sm transition hover:border-[#E30613]/30 disabled:pointer-events-none disabled:opacity-0 sm:size-8';

type TwoUpInfoboxCarouselProps = {
  items: readonly { id: string }[];
  renderItem: (item: { id: string }, index: number) => ReactNode;
  ariaLabel: string;
  className?: string;
  hideArrowsFrom?: 'lg' | 'md' | 'never';
};

/** Carrusel horizontal: 2 infoboxes visibles por fila. */
export function TwoUpInfoboxCarousel({
  items,
  renderItem,
  ariaLabel,
  className,
  hideArrowsFrom = 'never',
}: TwoUpInfoboxCarouselProps) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const showNav = items.length > 2;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 2,
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
  }, [emblaApi, items]);

  const arrowHideClass =
    hideArrowsFrom === 'lg' ? 'lg:hidden' : hideArrowsFrom === 'md' ? 'md:hidden' : '';

  return (
    <div className={cn('relative', showNav && 'px-9 sm:px-10', className)}>
      {showNav ? (
        <>
          <button
            type="button"
            className={cn(ARROW, 'left-0', arrowHideClass)}
            aria-label="Anterior"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(ARROW, 'right-0', arrowHideClass)}
            aria-label="Siguiente"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex gap-3 sm:gap-3.5" role="list" aria-label={ariaLabel}>
          {items.map((item, index) => (
            <li key={item.id} className={SLIDE_TWO_UP}>
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

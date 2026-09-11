import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

/** 1 en móvil · 2 en tablet · 4 en desktop (gaps 0.75rem / 1rem). */
const SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_100%] sm:flex-[0_0_calc((100%-0.875rem)/2)] lg:flex-[0_0_calc((100%-3rem)/4)]';

const ARROW =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#E30613] shadow-sm transition hover:border-[#E30613]/30 hover:scale-105 disabled:pointer-events-none disabled:opacity-35 sm:size-9';

const AUTOPLAY_MS = 4500;

type TwoUpInfoboxCarouselProps = {
  items: readonly { id: string }[];
  renderItem: (item: { id: string }, index: number) => ReactNode;
  ariaLabel: string;
  className?: string;
};

/** Carrusel de infoboxes: 4 visibles en desktop. */
export function TwoUpInfoboxCarousel({
  items,
  renderItem,
  ariaLabel,
  className,
}: TwoUpInfoboxCarouselProps) {
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const showNav = items.length > 4;
  const canLoop = items.length > 4;

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: canLoop,
    containScroll: canLoop ? false : 'trimSnaps',
    dragFree: false,
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => {
    if (!emblaApi) return;
    if (emblaApi.canScrollNext()) emblaApi.scrollNext();
    else emblaApi.scrollTo(0);
  }, [emblaApi]);

  const pauseAutoplay = useCallback(() => setAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setAutoplayPaused(false), []);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setCanScrollPrev(emblaApi.canScrollPrev() || canLoop);
      setCanScrollNext(emblaApi.canScrollNext() || canLoop || items.length > 1);
    };

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [canLoop, emblaApi, items.length]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, items]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || items.length <= 4) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) emblaApi.scrollNext();
      else emblaApi.scrollTo(0);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, items.length]);

  return (
    <div
      className={cn('relative', showNav && 'px-10 sm:px-12', className)}
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      onFocusCapture={pauseAutoplay}
      onBlurCapture={resumeAutoplay}
    >
      {showNav ? (
        <>
          <button
            type="button"
            className={cn(ARROW, 'left-0')}
            aria-label="Anterior"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(ARROW, 'right-0')}
            aria-label="Siguiente"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
          </button>
        </>
      ) : null}

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex gap-3 sm:gap-3.5 lg:gap-4" role="list" aria-label={ariaLabel}>
          {items.map((item, index) => (
            <li key={item.id} className={SLIDE_CLASS}>
              {renderItem(item, index)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

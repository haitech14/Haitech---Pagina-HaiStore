import { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { ServiceLandingCardTile } from '@/components/service-landing/service-landing-card';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import type { ServiceLandingCard } from '@/types/service-landing';
import { cn } from '@/lib/utils';

const FOUR_COL_SLIDE_CLASS =
  'min-w-0 flex-[0_0_88%] sm:flex-[0_0_calc((100%-0.75rem)/2)] md:flex-[0_0_calc((100%-3rem)/4)] lg:flex-[0_0_calc((100%-1.5rem)/4)]';

const TWO_COL_SLIDE_CLASS =
  'min-w-0 flex-[0_0_88%] sm:flex-[0_0_calc((100%-0.75rem)/2)]';

const carouselArrowClass =
  'absolute top-[38%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background shadow-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30';

interface ServiceLandingCardsCarouselProps {
  cards: readonly ServiceLandingCard[];
  gridCols?: 'four' | 'two';
  ariaLabel?: string;
}

export function ServiceLandingCardsCarousel({
  cards,
  gridCols = 'four',
  ariaLabel = 'Servicios disponibles',
}: ServiceLandingCardsCarouselProps) {
  const slideClass = gridCols === 'two' ? TWO_COL_SLIDE_CLASS : FOUR_COL_SLIDE_CLASS;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
    watchDrag: emblaShouldWatchDrag,
  });

  const cardsKey = useMemo(() => cards.map((card) => card.id).join('|'), [cards]);

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

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit();
    emblaApi.scrollTo(0);
  }, [emblaApi, cardsKey]);

  const showDots = scrollSnaps.length > 1;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative px-10 sm:px-12">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className={cn(carouselArrowClass, 'left-0')}
          aria-label="Servicios anteriores"
        >
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>

        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex gap-3 sm:gap-4 lg:gap-2" role="list" aria-label={ariaLabel}>
            {cards.map((card) => (
              <li key={card.id} className={slideClass}>
                <ServiceLandingCardTile card={card} />
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          className={cn(carouselArrowClass, 'right-0')}
          aria-label="Servicios siguientes"
        >
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      </div>

      {showDots ? (
        <div
          className="flex items-center justify-center gap-1.5"
          role="tablist"
          aria-label="Páginas del carrusel de servicios"
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
                'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2',
                selectedIndex === index
                  ? 'bg-sky-600'
                  : 'bg-neutral-300 hover:bg-neutral-400',
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

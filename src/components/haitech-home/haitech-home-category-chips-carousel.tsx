import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_HOME_FEATURED_CATEGORY_CHIPS,
  type HaitechHomeFeaturedCategoryChip,
} from '@/data/haitech-home-featured-section';
import { HAITECH_HOME } from '@/data/haitech-home-shell';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const COLUMN_GAP = 'gap-3 sm:gap-4 md:gap-5 lg:gap-4';
/** Una fila: 2 móvil · 4 md · 8 lg+ */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-2.25rem)/4)] lg:flex-[0_0_calc((100%-7rem)/8)]';

const ARROW_CLASS =
  'absolute top-[42%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#E30613] text-white shadow-[0_4px_14px_rgba(227,6,19,0.28)] transition hover:bg-[#c90511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/50 disabled:pointer-events-none disabled:opacity-35 sm:size-11';

function CategoryChipCard({
  chip,
  imgErrors,
  onImgError,
}: {
  chip: HaitechHomeFeaturedCategoryChip;
  imgErrors: Record<string, boolean>;
  onImgError: (id: string) => void;
}) {
  const showImage = Boolean(chip.image) && !imgErrors[chip.id];

  return (
    <Link
      to={chip.href}
      className="group/chip flex w-full flex-col items-center gap-2.5 px-1 py-1 outline-none focus-visible:rounded-2xl focus-visible:ring-2 focus-visible:ring-[#E30613]/35"
      aria-label={chip.label}
    >
      <span className="flex aspect-square w-[min(92%,8.25rem)] items-center justify-center overflow-hidden rounded-full bg-[#F3F3F3] ring-1 ring-black/5 sm:w-[min(90%,8.75rem)]">
        {showImage ? (
          <img
            src={chip.image}
            alt=""
            width={176}
            height={176}
            className="size-full object-cover transition-transform duration-300 group-hover/chip:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => onImgError(chip.id)}
          />
        ) : (
          <span className="text-3xl font-bold text-[#B0B0B0]" aria-hidden="true">
            {chip.label.charAt(0)}
          </span>
        )}
      </span>
      <span className="line-clamp-2 min-h-[2.4em] px-0.5 text-center text-[13px] font-semibold leading-tight text-[#222222] sm:text-[14px]">
        {chip.label}
      </span>
    </Link>
  );
}

/** Carrusel de categorías circulares — 8 por fila en desktop. */
export function HaitechHomeCategoryChipsCarousel({ className }: { className?: string }) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    slidesToScroll: 'auto',
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const handleImgError = useCallback((id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  }, []);

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

  const showControls = canScrollPrev || canScrollNext;

  return (
    <div className={cn('relative w-full px-10 sm:px-12', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <ul
          className={cn('flex touch-pan-y', COLUMN_GAP)}
          role="list"
          aria-label="Categorías de productos"
        >
          {HAITECH_HOME_FEATURED_CATEGORY_CHIPS.map((chip) => (
            <li key={chip.id} className={SLIDE}>
              <CategoryChipCard chip={chip} imgErrors={imgErrors} onImgError={handleImgError} />
            </li>
          ))}
        </ul>
      </div>

      {showControls ? (
        <>
          <button
            type="button"
            className={cn(ARROW_CLASS, 'left-0')}
            aria-label="Categorías anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(ARROW_CLASS, 'right-0')}
            aria-label="Categorías siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden="true" />
          </button>
        </>
      ) : null}
    </div>
  );
}

/** Bloque completo: categorías encima de «Productos Destacados». */
export function HaitechHomeCategoryChipsSection({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full bg-white px-3 pb-1.5 pt-2 sm:px-4 sm:pb-2 sm:pt-2.5 lg:px-5', className)}
      aria-labelledby="haitech-home-categories-title"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <h2
          id="haitech-home-categories-title"
          className="mb-2 text-center text-[22px] font-bold leading-tight text-[#222222] sm:mb-2.5 sm:text-[26px] lg:text-[28px]"
        >
          Expertos en Equipamiento de Oficina
        </h2>
        <HaitechHomeCategoryChipsCarousel />
      </div>
    </section>
  );
}

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

const COLUMN_GAP = 'gap-2.5 sm:gap-3 md:gap-3.5 lg:gap-4';
/** Una fila: ~2 móvil · 3 sm · 4 md · 5 lg+. */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.625rem)/2)] sm:flex-[0_0_calc((100%-1.5rem)/3)] md:flex-[0_0_calc((100%-2.625rem)/4)] lg:flex-[0_0_calc((100%-4rem)/5)]';

const arrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#333] shadow-[0_2px_10px_rgba(15,31,61,0.10)] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

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
      className={cn(
        'group/chip flex min-h-[132px] w-full flex-col items-center justify-center gap-1.5 rounded-xl bg-white px-1 py-2 transition-colors sm:min-h-[152px] sm:gap-2 sm:py-2.5 lg:min-h-[168px] xl:min-h-[180px]',
        'hover:bg-[#FAFAFA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 focus-visible:ring-offset-2',
      )}
      aria-label={chip.label}
    >
      <span className="flex size-[6.25rem] items-center justify-center overflow-hidden rounded-xl bg-[#F7F7F7] sm:size-[7.25rem] md:size-[7.75rem] lg:size-[8.5rem] xl:size-[9.25rem]">
        {showImage ? (
          <img
            src={chip.image}
            alt=""
            width={148}
            height={148}
            className="size-full object-contain transition-transform duration-300 group-hover/chip:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => onImgError(chip.id)}
          />
        ) : (
          <span className="text-3xl font-bold text-[#B0B0B0] sm:text-4xl" aria-hidden="true">
            {chip.label.charAt(0)}
          </span>
        )}
      </span>
      <span className="line-clamp-2 px-0.5 text-center text-[11px] font-semibold leading-tight text-[#333333] sm:text-[12px] lg:text-[13px]">
        {chip.label}
      </span>
    </Link>
  );
}

/** Carrusel de categorías — una fila con flechas. */
export function HaitechHomeCategoryChipsCarousel({ className }: { className?: string }) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
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
    <div className={cn('relative w-full px-0 sm:px-8 lg:px-10', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <ul className={cn('flex touch-pan-y', COLUMN_GAP)} role="list" aria-label="Categorías de productos">
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
            className={cn(arrowClass, '-left-1 sm:-left-2 lg:-left-3')}
            aria-label="Categorías anteriores"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
          >
            <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            className={cn(arrowClass, '-right-1 sm:-right-2 lg:-right-3')}
            aria-label="Categorías siguientes"
            disabled={!canScrollNext}
            onClick={scrollNext}
          >
            <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
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
      className={cn('w-full bg-white px-3 pb-1 pt-2 sm:px-4 sm:pb-2 sm:pt-3 lg:px-5', className)}
      aria-label="Explorar categorías"
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <HaitechHomeCategoryChipsCarousel />
      </div>
    </section>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME, HAITECH_HOME_CATEGORY_CAROUSEL } from '@/data/haitech-home-shell';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const GAP = 'gap-3 sm:gap-4';
/** 2 móvil · 3 tablet · 6 desktop. */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/2)] sm:flex-[0_0_calc((100%-2rem)/3)] lg:flex-[0_0_calc((100%-5rem)/6)]';

const arrowClass =
  'absolute top-[64px] z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8E8E8] bg-white text-[#1A1A1A] shadow-[0_4px_14px_rgba(15,31,61,0.14)] transition-colors hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/40 disabled:pointer-events-none disabled:opacity-30 sm:top-[74px]';

/** Carrusel de categorías en forma circular (sin fondo gris). */
export function HaitechHomeCategoryCarousel({ className }: { className?: string }) {
  const items = HAITECH_HOME_CATEGORY_CAROUSEL;
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

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

  return (
    <section
      className={cn('w-full bg-white', className)}
      aria-labelledby="haitech-category-carousel-title"
    >
      <div
        className="mx-auto px-4 pb-4 pt-1 sm:px-6 sm:pb-5"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <h2
          id="haitech-category-carousel-title"
          className="mb-5 font-[family-name:var(--font-infobox)] text-[18px] font-bold text-black sm:mb-6 sm:text-[20px]"
        >
          Explora nuestras categorías
        </h2>

        <div className="relative px-1 sm:px-2">
          <div className="overflow-hidden" ref={emblaRef}>
            <ul className={cn('flex', GAP)} role="list" aria-label="Categorías">
              {items.map((item) => {
                const showImage = Boolean(item.image) && !imgErrors[item.id];
                return (
                  <li key={item.id} className={SLIDE}>
                    <Link
                      to={item.to}
                      className={cn(
                        'group flex flex-col items-center text-center outline-none',
                        'focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                      )}
                    >
                      <span className="relative flex size-[116px] items-center justify-center overflow-hidden rounded-full sm:size-[128px]">
                        {showImage ? (
                          <img
                            src={item.image}
                            alt=""
                            width={128}
                            height={128}
                            className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                            loading="lazy"
                            decoding="async"
                            onError={() =>
                              setImgErrors((prev) => ({ ...prev, [item.id]: true }))
                            }
                          />
                        ) : (
                          <span
                            className="font-[family-name:var(--font-infobox)] text-2xl font-bold text-[#B0B0B0]"
                            aria-hidden="true"
                          >
                            {item.name.charAt(0)}
                          </span>
                        )}
                      </span>

                      <span className="mt-3 line-clamp-2 max-w-[12rem] font-[family-name:var(--font-infobox)] text-[13px] font-semibold leading-snug text-[#111] transition-colors group-hover:text-[#E30613] sm:text-[14px]">
                        {item.name}
                      </span>
                      <span className="mt-0.5 line-clamp-2 max-w-[12rem] text-[11px] leading-snug text-[#6B6B6B] sm:text-[12px]">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {items.length > 6 ? (
            <>
              <button
                type="button"
                aria-label="Categorías anteriores"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={cn(arrowClass, 'left-0 -translate-x-1/2 sm:left-0 sm:translate-x-0')}
              >
                <ChevronLeft className="size-5" strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Categorías siguientes"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={cn(arrowClass, 'right-0 translate-x-1/2 sm:right-0 sm:translate-x-0')}
              >
                <ChevronRight className="size-5" strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

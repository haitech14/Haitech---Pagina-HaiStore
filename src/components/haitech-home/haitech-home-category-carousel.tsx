import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

import { HAITECH_HOME, HAITECH_HOME_CATEGORY_CAROUSEL } from '@/data/haitech-home-shell';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const GAP = 'gap-2.5 sm:gap-3 md:gap-4';
/** ~2.4 móvil · 3 tablet · 6 desktop. */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-1.25rem)/2.35)] sm:flex-[0_0_calc((100%-1.5rem)/3)] lg:flex-[0_0_calc((100%-5rem)/6)]';

const arrowClass =
  'absolute top-[52px] z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#333] shadow-[0_2px_10px_rgba(15,31,61,0.10)] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:top-[68px] sm:size-8';

/** Carrusel de categorías con contenedor cuadrado (sin fondo gris). */
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
        className="mx-auto px-3 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-4"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <header className="mb-4 text-center sm:mb-5">
          <h2
            id="haitech-category-carousel-title"
            className="font-[family-name:var(--font-infobox)] text-[17px] font-bold text-black sm:text-[20px]"
          >
            Explora nuestras categorías
          </h2>
          <p className="mx-auto mt-1.5 max-w-xl text-[13px] leading-snug text-[#6B6B6B] sm:mt-2 sm:text-[14px]">
            Encuentra equipos, suministros y soluciones para cada necesidad.
          </p>
        </header>

        <div className="relative px-0 sm:px-2">
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
                      <span className="relative flex size-[100px] items-center justify-center overflow-hidden rounded-xl sm:size-[132px] sm:rounded-2xl md:size-[148px]">
                        {showImage ? (
                          <img
                            src={item.image}
                            alt=""
                            width={148}
                            height={148}
                            className="size-full object-contain transition-transform duration-300 group-hover:scale-[1.08]"
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

                      <span className="mt-2.5 line-clamp-2 max-w-[9.5rem] font-[family-name:var(--font-infobox)] text-[12px] font-semibold leading-snug text-[#111] transition-colors group-hover:text-[#E30613] sm:mt-3 sm:max-w-[12rem] sm:text-[14px]">
                        {item.name}
                      </span>
                      <span className="mt-0.5 line-clamp-2 max-w-[9.5rem] text-[10px] leading-snug text-[#6B6B6B] sm:max-w-[12rem] sm:text-[12px]">
                        {item.description}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {canScrollPrev || canScrollNext ? (
            <>
              <button
                type="button"
                aria-label="Categorías anteriores"
                onClick={scrollPrev}
                disabled={!canScrollPrev}
                className={cn(arrowClass, 'left-0 hidden sm:flex sm:-left-1 lg:-left-2')}
              >
                <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Categorías siguientes"
                onClick={scrollNext}
                disabled={!canScrollNext}
                className={cn(arrowClass, 'right-0 hidden sm:flex sm:-right-1 lg:-right-2')}
              >
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

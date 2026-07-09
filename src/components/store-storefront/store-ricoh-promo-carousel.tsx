import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import {
  STORE_RICOH_PROMO_BANNERS,
  type StoreRicohPromoBanner,
} from '@/data/store-ricoh-promo-banners';
import {
  STORE_RICOH_PROMO_COMPACT_HEIGHT_CLASS,
  STORE_RICOH_PROMO_DEFAULT_HEIGHT_CLASS,
} from '@/lib/store-ricoh-promo-layout';
import { cn } from '@/lib/utils';

interface StoreRicohPromoCarouselProps {
  banners?: StoreRicohPromoBanner[];
  className?: string;
  /** Cabecera de tienda: banner más bajo para dejar espacio a subcategorías. */
  compact?: boolean;
  /** Título encima del carrusel; `null` lo oculta. */
  heading?: string | null;
}

const DEFAULT_CATALOG_BANNER_HEADING = 'Elige el tipo de equipo que necesitas';

export function StoreRicohPromoCarousel({
  banners = STORE_RICOH_PROMO_BANNERS,
  className,
  compact = false,
  heading = DEFAULT_CATALOG_BANNER_HEADING,
}: StoreRicohPromoCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || banners.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 6000);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, banners.length, emblaApi]);

  if (banners.length === 0) return null;

  const pauseAutoplay = () => setAutoplayPaused(true);
  const heightClass = compact
    ? STORE_RICOH_PROMO_COMPACT_HEIGHT_CLASS
    : STORE_RICOH_PROMO_DEFAULT_HEIGHT_CLASS;
  const headingId = heading ? 'ricoh-promo-carousel-heading' : undefined;

  return (
    <section
      aria-label={heading ? undefined : 'Promociones Ricoh'}
      aria-labelledby={headingId}
      className={cn('w-full', className)}
    >
      {heading ? (
        <h3
          id={headingId}
          className="mb-2.5 text-sm font-semibold text-[#374151] sm:mb-3 sm:text-base"
        >
          {heading}
        </h3>
      ) : null}

      <div
        className="relative overflow-hidden rounded-xl border border-border/60 bg-white shadow-sm transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(15,31,61,0.1)]"
        onMouseEnter={pauseAutoplay}
        onFocus={pauseAutoplay}
      >
        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex">
            {banners.map((banner, index) => (
              <li
                key={banner.id}
                className="min-w-0 flex-[0_0_100%]"
                aria-hidden={selectedIndex !== index}
              >
                <Link
                  to={banner.href}
                  className={cn(
                    'group relative block w-full cursor-pointer overflow-hidden',
                    'transition-[box-shadow,transform] duration-200 ease-out',
                    'hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(15,31,61,0.14)]',
                    'active:translate-y-0 active:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                    heightClass,
                  )}
                  aria-label={banner.imageAlt}
                >
                  <img
                    src={banner.image}
                    alt=""
                    className="size-full object-contain object-center transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                  <span className="sr-only">{banner.imageAlt}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {banners.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => {
                pauseAutoplay();
                scrollPrev();
              }}
              aria-label="Promoción anterior"
              className={cn(
                'absolute left-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-sm transition-colors hover:bg-white sm:flex',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              )}
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                pauseAutoplay();
                scrollNext();
              }}
              aria-label="Siguiente promoción"
              className={cn(
                'absolute right-2 top-1/2 z-10 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-white/95 text-foreground shadow-sm transition-colors hover:bg-white sm:flex',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              )}
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>

            <div
              className="absolute bottom-0 right-2 z-10 flex items-center gap-0 sm:bottom-0 sm:right-2.5"
              role="tablist"
              aria-label="Seleccionar promoción"
            >
              {banners.map((banner, index) => (
                <button
                  key={banner.id}
                  type="button"
                  role="tab"
                  aria-selected={selectedIndex === index}
                  aria-label={banner.imageAlt}
                  onClick={() => {
                    pauseAutoplay();
                    scrollTo(index);
                  }}
                  className={cn(
                    'flex size-6 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
                  )}
                >
                  <span
                    className={cn(
                      'rounded-full transition-all duration-200',
                      selectedIndex === index
                        ? 'h-1.5 w-3 bg-red-600'
                        : 'size-1.5 bg-white/70 hover:bg-white',
                    )}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}

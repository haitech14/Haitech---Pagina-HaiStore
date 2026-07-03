import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { promotionSlides } from '@/data/promotions-hero';
import { cn } from '@/lib/utils';

interface PromotionsHeroBannerProps {
  /** Sin contenedor externo (dentro del layout del inicio). */
  embedded?: boolean;
  /** Carrusel compacto para cabecera de catálogo / tienda. */
  variant?: 'default' | 'compact';
}

export function PromotionsHeroBanner({
  embedded = false,
  variant = 'default',
}: PromotionsHeroBannerProps) {
  const isCompact = variant === 'compact';
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
    if (!emblaApi || autoplayPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 6000);

    return () => window.clearInterval(timer);
  }, [emblaApi, autoplayPaused]);

  const pauseAutoplay = () => setAutoplayPaused(true);

  return (
    <section
      aria-label="Promociones del mes"
      className={cn(!embedded && !isCompact && 'bg-background')}
    >
      <div className={cn(!embedded && !isCompact && 'container py-4 sm:py-5')}>
        <div
          className={cn(
            'relative overflow-hidden border border-border shadow-sm',
            isCompact ? 'rounded-xl' : 'rounded-2xl',
          )}
          onMouseEnter={pauseAutoplay}
          onFocus={pauseAutoplay}
        >
          <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex">
              {promotionSlides.map((slide, index) => (
                <li
                  key={slide.id}
                  className="relative min-w-0 flex-[0_0_100%]"
                  aria-hidden={selectedIndex !== index}
                >
                  <div
                    className={cn(
                      'relative flex flex-col justify-end',
                      isCompact
                        ? 'min-h-[9.5rem] sm:min-h-[11.5rem] md:min-h-[12.5rem]'
                        : 'min-h-[168px] sm:min-h-[212px] lg:min-h-[248px]',
                    )}
                  >
                    <img
                      src={slide.image}
                      alt=""
                      className="absolute inset-0 size-full object-cover object-center"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/25 sm:via-black/60 sm:to-transparent"
                      aria-hidden="true"
                    />

                    <div
                      className={cn(
                        'relative z-10 flex flex-col',
                        isCompact
                          ? 'gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-5 sm:p-5 md:p-6'
                          : 'max-w-xl gap-2 p-4 sm:gap-2.5 sm:p-6 lg:p-7',
                      )}
                    >
                      <div className={cn(isCompact && 'min-w-0 flex-1')}>
                        {slide.badge ? (
                          <span
                            className={cn(
                              'inline-flex w-fit rounded-md bg-red-600 font-bold uppercase tracking-wide text-white',
                              isCompact
                                ? 'px-2 py-0.5 text-[0.6rem] sm:text-[0.65rem]'
                                : 'px-2 py-0.5 text-[0.65rem] sm:px-2.5 sm:py-1 sm:text-xs',
                            )}
                          >
                            {slide.badge}
                          </span>
                        ) : null}
                        <h2
                          className={cn(
                            'text-balance font-bold tracking-tight text-white',
                            isCompact
                              ? 'mt-1 text-base leading-snug sm:text-lg md:text-xl'
                              : 'text-xl sm:text-2xl lg:text-3xl',
                          )}
                        >
                          {slide.title}
                        </h2>
                        <p
                          className={cn(
                            'text-pretty text-white/85',
                            isCompact
                              ? 'mt-1 line-clamp-2 text-xs leading-snug sm:line-clamp-2 sm:text-sm'
                              : 'text-xs leading-snug sm:text-sm',
                          )}
                        >
                          {slide.subtitle}
                        </p>
                      </div>
                      <div className={cn(isCompact ? 'shrink-0' : 'pt-0.5')}>
                        <Button
                          asChild
                          className={cn(
                            'gap-2 rounded-lg bg-red-600 font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600',
                            isCompact
                              ? 'h-9 px-4 text-xs sm:h-10 sm:px-5 sm:text-sm'
                              : 'h-10 px-5 text-sm',
                          )}
                        >
                          <Link to={slide.ctaHref}>
                            <ShoppingCart className="size-4 shrink-0" aria-hidden="true" />
                            {slide.ctaLabel}
                          </Link>
                        </Button>
                      </div>
                      <span className="sr-only">{slide.imageAlt}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              pauseAutoplay();
              scrollPrev();
            }}
            aria-label="Promoción anterior"
            className={cn(
              'absolute left-2 top-1/2 z-20 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              isCompact
                ? 'hidden size-8 sm:flex'
                : 'hidden size-10 sm:flex',
            )}
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => {
              pauseAutoplay();
              scrollNext();
            }}
            aria-label="Siguiente promoción"
            className={cn(
              'absolute right-2 top-1/2 z-20 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600',
              isCompact
                ? 'hidden size-8 sm:flex'
                : 'hidden size-10 sm:flex',
            )}
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          <div
            className={cn(
              'absolute z-20 flex gap-2',
              isCompact
                ? 'bottom-2 right-2 sm:bottom-2.5 sm:right-2.5'
                : 'bottom-3 left-1/2 -translate-x-1/2 sm:bottom-4',
            )}
            role="tablist"
            aria-label="Seleccionar promoción"
          >
            {promotionSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Promoción: ${slide.title}`}
                onClick={() => {
                  pauseAutoplay();
                  scrollTo(index);
                }}
                className={cn(
                  'rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
                  isCompact ? 'size-2' : 'size-2.5',
                  selectedIndex === index ? 'bg-red-600' : 'bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

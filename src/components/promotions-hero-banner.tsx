import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { promotionSlides } from '@/data/promotions-hero';
import { cn } from '@/lib/utils';

export function PromotionsHeroBanner() {
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
    <section aria-label="Promociones destacadas" className="bg-background">
      <div className="container py-6 sm:py-8">
        <div
          className="relative overflow-hidden rounded-2xl border border-border shadow-sm"
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
                  <div className="relative flex min-h-[220px] flex-col justify-end sm:min-h-[280px] lg:min-h-[320px]">
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

                    <div className="relative z-10 flex max-w-xl flex-col gap-3 p-5 sm:gap-4 sm:p-8 lg:p-10">
                      {slide.badge && (
                        <span className="inline-flex w-fit rounded-md bg-red-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                          {slide.badge}
                        </span>
                      )}
                      <h2 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                        {slide.title}
                      </h2>
                      <p className="text-pretty text-sm leading-relaxed text-white/85 sm:text-base">
                        {slide.subtitle}
                      </p>
                      <div className="pt-1">
                        <Button
                          asChild
                          className="h-11 gap-2 rounded-lg bg-red-600 px-6 font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
                        >
                          <Link to={slide.ctaHref}>
                            <ShoppingCart className="size-4" aria-hidden="true" />
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
            className="absolute left-2 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex"
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
            className="absolute right-2 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-4"
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
                  'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
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

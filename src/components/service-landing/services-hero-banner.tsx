import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  CATEGORY_STRIP_HERO_GUTTER_CLASS,
} from '@/lib/category-strip-layout';
import {
  servicesHeroBannerSlides,
  type ServiceHeroBannerSlide,
} from '@/data/services-hero-banner-slides';
import { cn } from '@/lib/utils';

const SERVICES_HERO_HEIGHT_CLASS =
  'h-[24rem] sm:h-[26rem] md:h-[30rem] lg:h-[34rem] xl:h-[36rem] 2xl:h-[38rem]';

interface ServicesHeroBannerProps {
  slides?: ServiceHeroBannerSlide[];
  headingId?: string;
  autoplayIntervalMs?: number;
}

export function ServicesHeroBanner({
  slides = servicesHeroBannerSlides,
  headingId = 'servicios-hero-titulo',
  autoplayIntervalMs = 7000,
}: ServicesHeroBannerProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: slides.length > 1,
    align: 'start',
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const showCarouselControls = slides.length > 1;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

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
    if (!emblaApi || autoplayPaused || !showCarouselControls) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (document.hidden) return;
      emblaApi.scrollNext();
    }, autoplayIntervalMs);

    return () => window.clearInterval(timer);
  }, [autoplayIntervalMs, autoplayPaused, emblaApi, showCarouselControls]);

  const pauseAutoplay = () => setAutoplayPaused(true);

  if (slides.length === 0) return null;

  return (
    <section
      aria-labelledby={headingId}
      aria-roledescription={showCarouselControls ? 'carrusel' : undefined}
      className={cn('relative w-full', CATEGORY_STRIP_HERO_GUTTER_CLASS)}
      onMouseEnter={pauseAutoplay}
      onFocus={pauseAutoplay}
    >
      <div className="relative w-full overflow-hidden rounded-xl border border-border/60 shadow-sm">
        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex">
            {slides.map((slide, index) => {
              const isActive = selectedIndex === index;
              const HeadingTag = index === 0 ? 'h1' : 'h2';
              const BadgeIcon = slide.badgeIcon;
              const CtaIcon = slide.ctaIcon ?? ArrowRight;

              return (
                <li
                  key={slide.id}
                  className="relative min-w-0 flex-[0_0_100%]"
                  aria-hidden={!isActive}
                >
                  <div
                    className={cn(
                      'relative flex w-full flex-col justify-center overflow-hidden bg-black',
                      SERVICES_HERO_HEIGHT_CLASS,
                    )}
                  >
                    <img
                      src={slide.image}
                      alt={slide.imageAlt}
                      className={cn(
                        'absolute inset-0 size-full object-cover',
                        slide.objectPositionClass ?? 'object-center',
                      )}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      decoding="async"
                    />

                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/10 sm:via-black/55 sm:to-transparent"
                      aria-hidden="true"
                    />

                    <div className="container relative z-10 flex min-h-[inherit] flex-col justify-center px-4 py-8 sm:px-6 sm:py-10">
                      <div className="max-w-xl">
                        {slide.badge ? (
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white sm:gap-2 sm:text-sm">
                            {BadgeIcon ? (
                              <BadgeIcon className="size-3.5 shrink-0 sm:size-4" aria-hidden="true" />
                            ) : null}
                            {slide.badge}
                          </span>
                        ) : null}

                        <HeadingTag
                          id={index === 0 ? headingId : `${headingId}-${slide.id}`}
                          className="mt-4 text-balance font-hero text-3xl font-bold uppercase leading-[1.08] tracking-tight text-white sm:mt-5 sm:text-4xl sm:leading-[1.06] md:text-5xl lg:text-[3.25rem] lg:leading-[1.05]"
                        >
                          {slide.title}
                          {slide.titleHighlight ? (
                            <>
                              {' '}
                              <span className="text-red-500">{slide.titleHighlight}</span>
                            </>
                          ) : null}
                        </HeadingTag>

                        <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-white/90 sm:mt-5 sm:text-lg sm:leading-relaxed">
                          {slide.subtitle}
                        </p>

                        {slide.highlights && slide.highlights.length > 0 ? (
                          <ul className="mt-5 flex flex-col gap-2.5 sm:mt-6 sm:gap-3">
                            {slide.highlights.map((highlight) => {
                              const HighlightIcon = highlight.icon;
                              return (
                                <li key={highlight.label} className="flex items-center gap-2.5">
                                  <span
                                    className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-red-400 backdrop-blur-sm sm:size-10"
                                    aria-hidden="true"
                                  >
                                    <HighlightIcon className="size-4 sm:size-[1.125rem]" strokeWidth={1.75} />
                                  </span>
                                  <span className="text-sm font-semibold leading-snug text-white sm:text-base sm:leading-relaxed">
                                    {highlight.label}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}

                        <div className="mt-6 sm:mt-7">
                          <Button
                            asChild
                            className="min-h-12 gap-2 rounded-lg bg-red-600 px-6 text-base font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
                          >
                            <Link to={slide.ctaHref}>
                              {slide.ctaLabel}
                              <CtaIcon className="size-4 shrink-0" aria-hidden="true" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {showCarouselControls ? (
          <>
            <button
              type="button"
              onClick={() => {
                pauseAutoplay();
                scrollPrev();
              }}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:left-3"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                pauseAutoplay();
                scrollNext();
              }}
              aria-label="Siguiente slide"
              className="absolute right-2 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:right-3"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}

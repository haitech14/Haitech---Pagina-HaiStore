import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { HOME_PROMO_BANNERS, type HomePromoBanner } from '@/data/home-promo-banners';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

const FRAME_CLASS =
  'relative overflow-hidden rounded-xl h-[228px] sm:aspect-[2059/528] sm:h-auto';

const ARROW_CLASS = cn(
  'absolute top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full',
  'border border-white/80 bg-white text-[#333] shadow-[0_2px_10px_rgba(0,0,0,0.14)]',
  'transition-all duration-200 hover:scale-105 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(0,0,0,0.2)]',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]',
  'sm:size-8',
);

function PromoBannerSlide({
  banner,
  index,
  selected,
}: {
  banner: HomePromoBanner;
  index: number;
  selected: boolean;
}) {
  return (
    <Link
      to={banner.href}
      className={cn(
        'group relative block leading-none',
        FRAME_CLASS,
        banner.backgroundClass,
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
      aria-label={banner.title}
      tabIndex={selected ? 0 : -1}
    >
      <h2 className="sr-only">{banner.title}</h2>
      <img
        src={banner.src}
        alt={banner.imageAlt}
        width={banner.width}
        height={banner.height}
        className={cn(
          'absolute inset-0 size-full object-contain object-center transition-transform duration-500 group-hover:scale-[1.01]',
          banner.mobileFocus === 'left' &&
            'max-sm:left-0 max-sm:w-[255%] max-sm:max-w-none max-sm:object-cover max-sm:object-[left_42%]',
          banner.mobileFocus === 'center' &&
            'max-sm:object-cover max-sm:object-[center_28%]',
        )}
        loading={index === 0 ? 'eager' : 'lazy'}
        fetchPriority={index === 0 ? 'high' : 'auto'}
        decoding={index === 0 ? 'sync' : 'async'}
      />
    </Link>
  );
}

export function HomePromoBannersCarousel({ className }: { className?: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const total = HOME_PROMO_BANNERS.length;

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
    if (!emblaApi || autoplayPaused || total < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, total]);

  const pauseAutoplay = () => setAutoplayPaused(true);

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Promociones HAITECH"
      className={cn('bg-white py-0', className)}
    >
      <div className="container">
        <div
          className="relative"
          onMouseEnter={pauseAutoplay}
          onFocus={pauseAutoplay}
        >
          <div ref={emblaRef} className="overflow-hidden">
            <ul className="flex">
              {HOME_PROMO_BANNERS.map((banner, index) => (
                <li
                  key={banner.id}
                  className="min-w-0 flex-[0_0_100%]"
                  aria-hidden={selectedIndex !== index}
                >
                  <PromoBannerSlide
                    banner={banner}
                    index={index}
                    selected={selectedIndex === index}
                  />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            aria-label="Banner anterior"
            onClick={() => {
              pauseAutoplay();
              scrollPrev();
            }}
            className={cn(ARROW_CLASS, 'left-1.5 sm:left-2')}
          >
            <ChevronLeft className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Banner siguiente"
            onClick={() => {
              pauseAutoplay();
              scrollNext();
            }}
            className={cn(ARROW_CLASS, 'right-1.5 sm:right-2')}
          >
            <ChevronRight className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>

          <div
            className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5"
            role="tablist"
            aria-label="Seleccionar banner"
          >
            {HOME_PROMO_BANNERS.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={banner.title}
                onClick={() => {
                  pauseAutoplay();
                  scrollTo(index);
                }}
                className="flex size-6 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span
                  className={cn(
                    'rounded-full transition-all duration-200',
                    selectedIndex === index
                      ? 'h-1.5 w-3 bg-white'
                      : 'size-1.5 bg-white/55 hover:bg-white/85',
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

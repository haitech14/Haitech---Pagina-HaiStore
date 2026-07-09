import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { clients, type Client } from '@/data/clients';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { clientLogoSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const CLIENT_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-1.5rem)/2)] sm:flex-[0_0_calc((100%-2rem)/3)] md:flex-[0_0_calc((100%-2.5rem)/4)] lg:flex-[0_0_calc((100%-3rem)/5)] xl:flex-[0_0_calc((100%-3.5rem)/6)]';

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 sm:size-10';

function ClientLogo({ client }: { client: Client }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <div
      className={cn(
        'flex h-14 w-full items-center justify-center rounded-lg border border-border/50 bg-white px-2.5 shadow-sm sm:h-16 md:h-[4.25rem]',
        client.logoSurface === 'dark' && 'bg-neutral-950',
      )}
    >
      {!logoError ? (
        (() => {
          const { webpSrc, fallbackSrc } = clientLogoSources(client.logo);
          return (
            <picture className="flex max-h-full max-w-full items-center justify-center">
              <source type="image/webp" srcSet={webpSrc} />
              <img
                src={fallbackSrc}
                alt={client.logoAlt}
                width={160}
                height={80}
                className="max-h-full max-w-full object-contain object-center"
                loading="lazy"
                onError={() => setLogoError(true)}
              />
            </picture>
          );
        })()
      ) : (
        <span className="text-xs font-bold text-muted-foreground" aria-hidden="true">
          {client.initials}
        </span>
      )}
    </div>
  );
}

export function ClientsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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

  return (
    <section id="clientes" aria-labelledby="clientes-titulo" className="home-landing-sans py-3 sm:py-4">
      <div className="container">
        <header className="mb-3 text-center sm:mb-4">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <span className="h-px w-10 bg-red-600/70 sm:w-16" aria-hidden="true" />
            <h2
              id="clientes-titulo"
              className="home-section-title text-balance text-lg font-bold tracking-tight text-[#0f1f3d] sm:text-xl md:text-2xl"
            >
              Algunos de nuestros{' '}
              <span className="text-red-600">clientes</span>
            </h2>
            <span className="h-px w-10 bg-red-600/70 sm:w-16" aria-hidden="true" />
          </div>
        </header>

        <div className="relative px-10 sm:px-12">
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className={cn(carouselArrowClass, 'left-0')}
            aria-label="Clientes anteriores"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <ul className="flex touch-pan-y gap-2.5 sm:gap-4">
              {clients.map((client) => (
                <li key={client.id} className={CLIENT_SLIDE_CLASS}>
                  <ClientLogo client={client} />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(carouselArrowClass, 'right-0')}
            aria-label="Clientes siguientes"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {scrollSnaps.length > 1 ? (
          <div
            className="mt-3 flex items-center justify-center gap-1.5 sm:mt-4"
            role="tablist"
            aria-label="Paginación de clientes"
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Ir al grupo ${index + 1} de clientes`}
                onClick={() => scrollTo(index)}
                className={cn(
                  'size-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                  index === selectedIndex ? 'bg-red-600' : 'bg-neutral-300 hover:bg-neutral-400',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

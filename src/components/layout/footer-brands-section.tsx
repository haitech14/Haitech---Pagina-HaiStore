import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import { BrandLogoCard } from '@/components/brand-strip';
import { footerPartnerBrands, getBrandName } from '@/data/brands';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const BRAND_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/3)] sm:flex-[0_0_calc((100%-1rem)/4)] md:flex-[0_0_calc((100%-1.25rem)/5)] lg:flex-[0_0_calc((100%-1.5rem)/6)] xl:flex-[0_0_calc((100%-1.75rem)/7)]';

const carouselArrowClass =
  'absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-white text-foreground shadow-md transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 sm:size-10';

export function FooterBrandsSection() {
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
    <section aria-labelledby="marcas-footer-titulo" className="home-landing-sans py-5 sm:py-6">
      <div className="container">
        <header className="mb-5 text-center sm:mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <span className="h-px w-10 bg-red-600/70 sm:w-16" aria-hidden="true" />
            <h2
              id="marcas-footer-titulo"
              className="home-section-title text-balance text-lg font-bold tracking-tight text-[#0f1f3d] sm:text-xl md:text-2xl"
            >
              Trabajamos con las mejores marcas
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
            aria-label="Marcas anteriores"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div className="overflow-hidden" ref={emblaRef}>
            <ul className="flex touch-pan-y gap-1.5 sm:gap-2" role="list" aria-label="Marcas disponibles">
              {footerPartnerBrands.map((brand) => (
                <li key={getBrandName(brand)} className={BRAND_SLIDE_CLASS}>
                  <BrandLogoCard brand={brand} isDark={false} linkable={false} />
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            className={cn(carouselArrowClass, 'right-0')}
            aria-label="Marcas siguientes"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>

        {scrollSnaps.length > 1 ? (
          <div
            className="mt-3 flex items-center justify-center gap-1.5 sm:mt-4"
            role="tablist"
            aria-label="Paginación de marcas"
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Ir al grupo ${index + 1} de marcas`}
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

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import { BrandLogoCard } from '@/components/brand-strip';
import {
  footerPartnerBrands,
  getBrandName,
  tonerPartnerBrands,
  type Brand,
} from '@/data/brands';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const BRAND_SLIDE_CLASS =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-0.75rem)/3)] sm:flex-[0_0_calc((100%-1rem)/4)] md:flex-[0_0_calc((100%-1.25rem)/5)] lg:flex-[0_0_calc((100%-1.5rem)/6)] xl:flex-[0_0_calc((100%-1.75rem)/7)]';

interface PartnerBrandsCarouselSectionProps {
  title: ReactNode;
  titleId: string;
  brands: readonly Brand[];
  listAriaLabel: string;
  paginationAriaLabel: string;
  className?: string;
}

export function PartnerBrandsCarouselSection({
  title,
  titleId,
  brands,
  listAriaLabel,
  paginationAriaLabel,
  className,
}: PartnerBrandsCarouselSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const updateSnaps = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
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
    <section aria-labelledby={titleId} className={cn('home-landing-sans bg-white py-3 sm:py-4', className)}>
      <div className="container">
        <header className="mb-3 text-center sm:mb-4">
          <h2
            id={titleId}
            className="home-section-title text-balance text-lg font-bold tracking-tight text-[#0f1f3d] sm:text-xl md:text-2xl"
          >
            {title}
          </h2>
        </header>

        <div className="overflow-hidden" ref={emblaRef}>
          <ul className="flex touch-pan-y gap-1.5 sm:gap-2" role="list" aria-label={listAriaLabel}>
            {brands.map((brand) => (
              <li key={getBrandName(brand)} className={BRAND_SLIDE_CLASS}>
                <BrandLogoCard brand={brand} isDark={false} linkable />
              </li>
            ))}
          </ul>
        </div>

        {scrollSnaps.length > 1 ? (
          <div
            className="mt-3 flex items-center justify-center gap-0 sm:mt-4"
            role="tablist"
            aria-label={paginationAriaLabel}
          >
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === selectedIndex}
                aria-label={`Ir al grupo ${index + 1} de marcas`}
                onClick={() => scrollTo(index)}
                className="flex size-7 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
              >
                <span
                  className={cn(
                    'size-2.5 rounded-full transition-colors',
                    index === selectedIndex ? 'bg-neutral-900' : 'bg-neutral-300 hover:bg-neutral-400',
                  )}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function FooterBrandsSection() {
  return (
    <PartnerBrandsCarouselSection
      title="Marcas Líderes"
      titleId="marcas-footer-titulo"
      brands={footerPartnerBrands}
      listAriaLabel="Marcas disponibles"
      paginationAriaLabel="Paginación de marcas"
    />
  );
}

/** Carrusel de marcas de toner (TOPJET, RANKO, etc.) encima de la vitrina Toner. */
export function TonerPartnerBrandsSection() {
  return (
    <PartnerBrandsCarouselSection
      title={
        <>
          <span className="block">Marcas de</span>
          <span className="block">Toner</span>
        </>
      }
      titleId="marcas-toner-titulo"
      brands={tonerPartnerBrands}
      listAriaLabel="Marcas de toner disponibles"
      paginationAriaLabel="Paginación de marcas de toner"
      className="bg-[#FAFBFC]"
    />
  );
}

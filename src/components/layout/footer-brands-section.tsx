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

const AUTOPLAY_MS = 2800;

interface PartnerBrandsCarouselSectionProps {
  title: ReactNode;
  titleId: string;
  brands: readonly Brand[];
  listAriaLabel: string;
  className?: string;
}

export function PartnerBrandsCarouselSection({
  title,
  titleId,
  brands,
  listAriaLabel,
  className,
}: PartnerBrandsCarouselSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: true,
    watchDrag: emblaShouldWatchDrag,
  });
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const pauseAutoplay = useCallback(() => setAutoplayPaused(true), []);
  const resumeAutoplay = useCallback(() => setAutoplayPaused(false), []);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || brands.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, brands.length, emblaApi]);

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

        <div
          className="overflow-hidden"
          ref={emblaRef}
          onMouseEnter={pauseAutoplay}
          onMouseLeave={resumeAutoplay}
          onFocusCapture={pauseAutoplay}
          onBlurCapture={resumeAutoplay}
        >
          <ul className="flex touch-pan-y gap-1.5 sm:gap-2" role="list" aria-label={listAriaLabel}>
            {brands.map((brand) => (
              <li key={getBrandName(brand)} className={BRAND_SLIDE_CLASS}>
                <BrandLogoCard brand={brand} isDark={false} linkable />
              </li>
            ))}
          </ul>
        </div>
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
    />
  );
}

/** Carrusel de marcas de toner (TOPJET, RANKO, etc.) encima de la vitrina Toner. */
export function TonerPartnerBrandsSection() {
  return (
    <PartnerBrandsCarouselSection
      title={
        <span className="whitespace-nowrap">Trabajamos con las mejores marcas</span>
      }
      titleId="marcas-toner-titulo"
      brands={tonerPartnerBrands}
      listAriaLabel="Marcas de toner disponibles"
      className="bg-[#FAFBFC]"
    />
  );
}

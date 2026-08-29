import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  HAITECH_LANDING_COLORS,
  HAITECH_LANDING_TRUSTED_BRANDS,
  HAITECH_LANDING_TRUSTED_BRANDS_HEADER,
} from '@/data/haitech-home-landing-section';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const GAP = 'gap-4 sm:gap-5 md:gap-6';
/** ~2.5 móvil · 4 sm · 5 md · 6 lg · 7 xl */
const SLIDE =
  'min-w-0 shrink-0 flex-[0_0_calc((100%-1rem)/2.5)] sm:flex-[0_0_calc((100%-3.75rem)/4)] md:flex-[0_0_calc((100%-5rem)/5)] lg:flex-[0_0_calc((100%-7.5rem)/6)] xl:flex-[0_0_calc((100%-9rem)/7)]';

const arrowClass =
  'absolute top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#333] shadow-[0_2px_10px_rgba(15,31,61,0.10)] transition-all duration-200 hover:scale-105 hover:border-[#E30613]/30 hover:text-[#E30613] hover:shadow-[0_4px_14px_rgba(15,31,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35 disabled:pointer-events-none disabled:opacity-30 sm:size-9';

function TrustedBrandLogo({ name, logo }: { name: string; logo: string }) {
  return (
    <img
      src={logo}
      alt={name}
      width={160}
      height={64}
      className="max-h-[32px] w-auto max-w-full object-contain opacity-95 sm:max-h-[40px] lg:max-h-[44px]"
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

function TrustedBrandsHeader() {
  const header = HAITECH_LANDING_TRUSTED_BRANDS_HEADER;

  return (
    <header className="mb-7 flex flex-col gap-5 sm:mb-8 lg:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        <div className="shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E30613] sm:text-[12px]">
            {header.eyebrow}
          </p>
          <h2
            id="trusted-brands-heading"
            className="mt-1 max-w-[18rem] font-[family-name:var(--font-infobox)] text-[28px] font-bold leading-[1.05] tracking-tight text-[#111] sm:max-w-none sm:text-[34px] lg:text-[40px]"
          >
            {header.titleBefore}
            <span className="text-[#E30613]">{header.titleAccent}</span>
          </h2>
        </div>

        <span className="hidden h-14 w-px shrink-0 bg-[#D4D4D4] sm:block" aria-hidden="true" />

        <p className="max-w-md text-[13px] leading-relaxed text-[#555] sm:text-[14px] lg:text-[15px]">
          {header.description}
        </p>
      </div>

      <div className="shrink-0 lg:pb-1 lg:text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#333] sm:text-[11px]">
          {header.tagline}
        </p>
        <span
          className="mt-1.5 block h-[3px] w-12 rounded-sm bg-[#E30613] lg:ml-auto"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

export function TrustedBrands({ className }: { className?: string }) {
  const brands = HAITECH_LANDING_TRUSTED_BRANDS;
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: false,
    loop: true,
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

  if (brands.length === 0) return null;

  const showControls = brands.length > 1;

  return (
    <section
      className={cn('w-full bg-white py-6 sm:py-7 lg:py-8', className)}
      aria-labelledby="trusted-brands-heading"
    >
      <TrustedBrandsHeader />

      <div className="relative px-0 sm:px-8 lg:px-10">
        <div className="overflow-hidden" ref={emblaRef}>
          <ul className={cn('flex items-center', GAP)} role="list" aria-label="Marcas aliadas">
            {brands.map((brand) => (
              <li
                key={brand.name}
                className={cn(
                  SLIDE,
                  'flex h-14 items-center justify-center sm:h-16 lg:h-[4.5rem]',
                )}
              >
                <TrustedBrandLogo name={brand.name} logo={brand.logo} />
              </li>
            ))}
          </ul>
        </div>

        {showControls ? (
          <>
            <button
              type="button"
              className={cn(arrowClass, '-left-1 sm:-left-2 lg:-left-3')}
              aria-label="Marcas anteriores"
              disabled={!canScrollPrev}
              onClick={scrollPrev}
            >
              <ChevronLeft className="size-4 sm:size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              className={cn(arrowClass, '-right-1 sm:-right-2 lg:-right-3')}
              aria-label="Marcas siguientes"
              disabled={!canScrollNext}
              onClick={scrollNext}
            >
              <ChevronRight className="size-4 sm:size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>

      <span className="sr-only" style={{ color: HAITECH_LANDING_COLORS.textSecondary }}>
        {brands.map((brand) => brand.name).join(', ')}
      </span>
    </section>
  );
}

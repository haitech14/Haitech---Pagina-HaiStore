import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_HOME,
  HAITECH_HOME_MID_BANNER,
  HAITECH_HOME_SERVICES_CAROUSEL_BANNERS,
  HAITECH_HOME_SERVICES_SECTION_HEADER,
} from '@/data/haitech-home-shell';
import { ResponsivePromoBannerImage } from '@/components/home/responsive-promo-banner-image';
import { emblaShouldWatchDrag } from '@/lib/embla-interaction';
import { cn } from '@/lib/utils';

const AUTOPLAY_MS = 6000;

type ServicesBannerItem = (typeof HAITECH_HOME_SERVICES_CAROUSEL_BANNERS)[number];

function MidBannerLink({ banner }: { banner: ServicesBannerItem }) {
  const webp = 'webp' in banner ? banner.webp : undefined;

  return (
    <Link
      to={banner.href}
      className={cn(
        'group relative block w-full leading-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
    >
      <ResponsivePromoBannerImage
        src={banner.png}
        {...(webp ? { webp } : {})}
        alt={banner.alt}
        width={banner.width}
        height={banner.height}
        mobileFocus="left"
        {...('mobileWidthPercent' in banner && banner.mobileWidthPercent
          ? { mobileWidthPercent: banner.mobileWidthPercent }
          : {})}
        {...('desktopScale' in banner && banner.desktopScale
          ? { desktopScale: banner.desktopScale }
          : {})}
      />
    </Link>
  );
}

function SectionTitleHeader({
  eyebrow,
  titleBefore,
  titleAccent,
  description,
  tagline,
  titleId,
}: {
  eyebrow: string;
  titleBefore: string;
  titleAccent: string;
  description: string;
  tagline: string;
  titleId: string;
}) {
  return (
    <header className="mb-5 flex flex-col items-center gap-4 text-center sm:mb-6 sm:gap-5 lg:mb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:text-left">
      <div className="flex min-w-0 flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 sm:text-left lg:gap-8">
        <div className="shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E30613] sm:text-[12px]">
            {eyebrow}
          </p>
          <h2
            id={titleId}
            className="mt-1 font-[family-name:var(--font-infobox)] text-[26px] font-bold leading-tight tracking-tight text-[#111] sm:text-[34px] lg:text-[40px]"
          >
            {titleBefore}
            <span className="text-[#E30613]">{titleAccent}</span>
          </h2>
        </div>

        <span className="hidden h-14 w-px shrink-0 bg-[#D4D4D4] sm:block" aria-hidden="true" />

        <p className="max-w-md text-[13px] leading-relaxed text-[#555] sm:text-[14px] lg:text-[15px]">
          {description}
        </p>
      </div>

      <div className="shrink-0 lg:pb-1 lg:text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#333] sm:text-[11px]">
          {tagline}
        </p>
        <span
          className="mx-auto mt-1.5 block h-[3px] w-12 rounded-sm bg-[#E30613] lg:ml-auto lg:mr-0"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

function ServicesBannerCarousel() {
  const banners = HAITECH_HOME_SERVICES_CAROUSEL_BANNERS;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    dragFree: false,
    watchDrag: emblaShouldWatchDrag,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
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

  useEffect(() => {
    if (!emblaApi || autoplayPaused || banners.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [autoplayPaused, emblaApi, banners.length]);

  const showControls = banners.length > 1;

  return (
    <div
      className="relative"
      onMouseEnter={() => setAutoplayPaused(true)}
      onMouseLeave={() => setAutoplayPaused(false)}
      aria-roledescription="carrusel"
      aria-label="Banners de servicios HAITECH"
    >
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        <ul className="flex touch-pan-y" role="list">
          {banners.map((banner) => (
            <li key={banner.id} className="min-w-0 shrink-0 grow-0 basis-full">
              <MidBannerLink banner={banner} />
            </li>
          ))}
        </ul>
      </div>

      {showControls ? (
        <>
          <button
            type="button"
            aria-label="Banner anterior"
            disabled={!canScrollPrev}
            onClick={scrollPrev}
            className="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#333] shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-200 hover:scale-105 hover:text-[#E30613] disabled:pointer-events-none disabled:opacity-40 sm:left-3 sm:size-9"
          >
            <ChevronLeft className="size-4 sm:size-5" strokeWidth={2} aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Banner siguiente"
            disabled={!canScrollNext}
            onClick={scrollNext}
            className="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/80 bg-white text-[#333] shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-200 hover:scale-105 hover:text-[#E30613] disabled:pointer-events-none disabled:opacity-40 sm:right-3 sm:size-9"
          >
            <ChevronRight className="size-4 sm:size-5" strokeWidth={2} aria-hidden="true" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5"
            role="tablist"
            aria-label="Indicadores del carrusel"
          >
            {banners.map((banner, index) => (
              <button
                key={banner.id}
                type="button"
                role="tab"
                aria-selected={selectedIndex === index}
                aria-label={`Ir al banner ${index + 1}`}
                onClick={() => emblaApi?.scrollTo(index)}
                className={cn(
                  'size-2 rounded-full transition-colors',
                  selectedIndex === index ? 'bg-[#E30613]' : 'bg-white/80 hover:bg-white',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Banner promocional intermedio (repuestos) — uso puntual fuera del carrusel. */
export function HaitechHomeMidBanner({ className }: { className?: string }) {
  const banner = HAITECH_HOME_MID_BANNER;

  return (
    <section
      className={cn('w-full bg-white px-3 py-1 sm:px-4 sm:py-2 lg:px-5', className)}
      aria-label={banner.alt}
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <MidBannerLink banner={banner} />
      </div>
    </section>
  );
}

/** Sección Nuestros Servicios + carrusel (alquiler, servicio técnico, repuestos). */
export function HaitechHomePostServicesBanners({ className }: { className?: string }) {
  const header = HAITECH_HOME_SERVICES_SECTION_HEADER;

  return (
    <section
      className={cn('w-full bg-white px-3 py-3 sm:px-4 sm:py-4 lg:px-5', className)}
      aria-labelledby="haitech-servicios-section-title"
    >
      <div
        className="mx-auto flex flex-col gap-3 sm:gap-4"
        style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}
      >
        <SectionTitleHeader
          eyebrow={header.eyebrow}
          titleBefore={header.titleBefore}
          titleAccent={header.titleAccent}
          description={header.description}
          tagline={header.tagline}
          titleId="haitech-servicios-section-title"
        />

        <ServicesBannerCarousel />
      </div>
    </section>
  );
}

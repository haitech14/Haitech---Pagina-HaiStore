import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AutoScroll from 'embla-carousel-auto-scroll';
import useEmblaCarousel from 'embla-carousel-react';

import { SectionHeading } from '@/components/section-heading';
import {
  brands as defaultBrands,
  getBrandFilterHref,
  getBrandLogo,
  getBrandLogoClassName,
  getBrandLogoDimensions,
  getBrandName,
  getBrandSlug,
  type BrandItem,
} from '@/data/brands';
import { brandLogoSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

/** Velocidad del auto-scroll (mayor = más rápido). Default del plugin: 2. */
const BRAND_MARQUEE_AUTO_SCROLL_SPEED = 0.85;

interface BrandStripProps {
  brands?: BrandItem[];
  variant?: 'default' | 'dark' | 'filter';
  showHeading?: boolean;
  linkable?: boolean;
  activeBrandSlug?: string | null;
  /** Superpuesto sobre el hero (sin barra sólida inferior). */
  overlay?: boolean;
  /** Carrusel horizontal con auto-scroll (p. ej. footer). */
  marquee?: boolean;
  className?: string;
}

export function BrandLogoCard({
  brand,
  isDark,
  linkable,
  isActive,
}: {
  brand: BrandItem;
  isDark: boolean;
  linkable: boolean;
  isActive?: boolean;
}) {
  const name = getBrandName(brand);
  const logo = getBrandLogo(brand);
  const logoClassName = getBrandLogoClassName(brand);
  const logoDimensions = getBrandLogoDimensions(brand);
  const [logoError, setLogoError] = useState(false);

  const content = (
    <>
      {logo && !logoError ? (
        (() => {
          const { webpSrc, fallbackSrc } = brandLogoSources(logo);
          return (
            <picture className="flex items-center justify-center">
              <source type="image/webp" srcSet={webpSrc} />
              <img
                src={fallbackSrc}
                alt=""
                width={logoDimensions.width}
                height={logoDimensions.height}
                className={cn(
                  logoClassName,
                  isDark
                    ? 'opacity-80 transition-opacity group-hover:opacity-100'
                    : 'opacity-90 transition-opacity group-hover:opacity-100',
                )}
                loading="lazy"
                draggable={false}
                onError={() => setLogoError(true)}
              />
            </picture>
          );
        })()
      ) : (
        <span
          className={cn(
            'text-center text-[0.6rem] font-semibold sm:text-[0.625rem]',
            isDark ? 'text-white/50 group-hover:text-white/70' : 'text-muted-foreground',
          )}
        >
          {name}
        </span>
      )}
    </>
  );

  const className = cn(
    'group flex w-full select-none items-center justify-center rounded-md border px-2 transition-all',
    isDark ? 'h-9 sm:h-10' : 'h-12 border-border/70 sm:h-14 md:h-16',
    linkable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
    isActive && 'border-[#DC2626] ring-1 ring-[#DC2626]',
    isDark
      ? 'border-white/10 bg-white/5 hover:border-red-600/40 hover:bg-white/10'
      : 'bg-card shadow-sm hover:border-border hover:shadow-md',
  );

  if (linkable) {
    return (
      <Link to={getBrandFilterHref(brand)} className={className} aria-label={`Ver productos ${name}`} draggable={false}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function BrandMarqueeStatic({
  brands,
  isDark,
  linkable,
  activeBrandSlug,
}: {
  brands: BrandItem[];
  isDark: boolean;
  linkable: boolean;
  activeBrandSlug?: string | null;
}) {
  return (
    <div className="container py-1">
      <ul
        className="mx-auto flex max-w-5xl flex-wrap justify-center gap-1.5 sm:gap-2"
        role="list"
        aria-label="Marcas disponibles"
      >
        {brands.map((brand) => (
          <li key={getBrandName(brand)} className="w-[7rem] sm:w-[8rem]">
            <BrandLogoCard
              brand={brand}
              isDark={isDark}
              linkable={linkable}
              isActive={activeBrandSlug === getBrandSlug(brand)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandMarqueeInteractive({
  brands,
  isDark,
  linkable,
  activeBrandSlug,
  overlay = false,
}: {
  brands: BrandItem[];
  isDark: boolean;
  linkable: boolean;
  activeBrandSlug?: string | null;
  overlay?: boolean;
}) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      align: 'start',
      containScroll: 'trimSnaps',
      watchDrag: () => true,
    },
    [
      AutoScroll({
        speed: BRAND_MARQUEE_AUTO_SCROLL_SPEED,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: true,
      }),
    ],
  );

  return (
    <div className={cn('container', overlay ? 'py-1.5 sm:py-2' : 'py-1.5')}>
      <div className="relative mx-auto overflow-hidden">
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-10 w-8 sm:w-12',
            isDark
              ? overlay
                ? 'bg-gradient-to-r from-black/70 to-transparent'
                : 'bg-gradient-to-r from-black/80 to-transparent'
              : 'bg-gradient-to-r from-background to-transparent',
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 z-10 w-8 sm:w-12',
            isDark
              ? overlay
                ? 'bg-gradient-to-l from-black/70 to-transparent'
                : 'bg-gradient-to-l from-black/80 to-transparent'
              : 'bg-gradient-to-l from-background to-transparent',
          )}
          aria-hidden="true"
        />

        <div
          ref={emblaRef}
          className="cursor-grab overflow-hidden active:cursor-grabbing"
          aria-label="Marcas disponibles — arrastra para explorar"
        >
          <ul className="flex touch-pan-y gap-1.5 sm:gap-2" role="list">
            {brands.map((brand) => (
              <li
                key={getBrandName(brand)}
                className="w-[7rem] shrink-0 sm:w-[8rem] md:w-[9rem]"
              >
                <BrandLogoCard
                  brand={brand}
                  isDark={isDark}
                  linkable={linkable}
                  isActive={activeBrandSlug === getBrandSlug(brand)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function BrandMarquee({
  brands,
  isDark,
  linkable,
  activeBrandSlug,
  overlay = false,
}: {
  brands: BrandItem[];
  isDark: boolean;
  linkable: boolean;
  activeBrandSlug?: string | null;
  overlay?: boolean;
}) {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  const activeSlug = activeBrandSlug ?? null;

  if (reducedMotion) {
    return (
      <BrandMarqueeStatic
        brands={brands}
        isDark={isDark}
        linkable={linkable}
        activeBrandSlug={activeSlug}
      />
    );
  }

  return (
    <BrandMarqueeInteractive
      brands={brands}
      isDark={isDark}
      linkable={linkable}
      activeBrandSlug={activeSlug}
      overlay={overlay}
    />
  );
}

export function BrandStrip({
  brands = defaultBrands,
  variant = 'default',
  showHeading = true,
  linkable = true,
  activeBrandSlug = null,
  overlay = false,
  marquee = false,
  className,
}: BrandStripProps) {
  const isDark = variant === 'dark' || variant === 'filter';
  const isFilterRow = variant === 'filter';
  const isHeroCarousel = marquee || (variant === 'dark' && !showHeading);

  return (
    <section
      aria-labelledby={showHeading ? 'marcas-titulo' : undefined}
      aria-label={
        showHeading ? undefined : isFilterRow ? 'Filtrar productos por marca' : 'Marcas disponibles'
      }
      className={cn(
        variant === 'dark' &&
          !overlay &&
          'border-t border-white/10 bg-black/70 backdrop-blur-sm',
        overlay && 'bg-gradient-to-t from-black/85 via-black/45 to-transparent backdrop-blur-[2px]',
        isFilterRow &&
          'rounded-xl bg-zinc-950 px-2.5 py-2.5 shadow-sm ring-1 ring-white/10 sm:px-3 sm:py-3',
        className,
      )}
    >
      {showHeading && (
        <>
          <SectionHeading title="Marcas destacadas" linkLabel="Ver todas las marcas" linkTo="/tienda" />
          <span id="marcas-titulo" className="sr-only">
            Marcas destacadas
          </span>
        </>
      )}

      {isHeroCarousel ? (
        <BrandMarquee
          brands={brands}
          isDark={isDark}
          linkable={linkable}
          activeBrandSlug={activeBrandSlug}
          overlay={overlay}
        />
      ) : (
        <ul
          className={cn(
            'grid gap-1.5 sm:gap-2',
            showHeading
              ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-10'
              : isFilterRow
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10'
                : 'container grid-cols-2 py-1.5 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10',
          )}
        >
          {brands.map((brand) => (
            <li key={getBrandName(brand)}>
              <BrandLogoCard
                brand={brand}
                isDark={isDark}
                linkable={linkable}
                isActive={activeBrandSlug === getBrandSlug(brand)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

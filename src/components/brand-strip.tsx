import { Link } from 'react-router-dom';

import { SectionHeading } from '@/components/section-heading';
import {
  brands as defaultBrands,
  getBrandFilterHref,
  getBrandLogo,
  getBrandName,
  getBrandSlug,
  type BrandItem,
} from '@/data/brands';
import { cn } from '@/lib/utils';

interface BrandStripProps {
  brands?: BrandItem[];
  variant?: 'default' | 'dark' | 'filter';
  showHeading?: boolean;
  linkable?: boolean;
  activeBrandSlug?: string | null;
  className?: string;
}

function BrandLogoCard({
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

  const content = (
    <>
      {logo ? (
        <img
          src={logo}
          alt=""
          className={cn(
            'max-h-5 w-auto max-w-full object-contain sm:max-h-6',
            isDark ? 'opacity-80 transition-opacity group-hover:opacity-100' : '',
          )}
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            'text-center text-xs font-bold sm:text-sm',
            isDark ? 'text-white/60 group-hover:text-white' : '',
          )}
        >
          {name}
        </span>
      )}
    </>
  );

  const className = cn(
    'group flex h-10 w-full items-center justify-center rounded-lg border px-2 transition-all sm:h-11',
    linkable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
    isActive && 'border-[#DC2626] ring-1 ring-[#DC2626]',
    isDark
      ? 'border-white/10 bg-white/5 hover:border-red-600/40 hover:bg-white/10'
      : 'bg-card text-muted-foreground grayscale hover:text-foreground hover:grayscale-0',
  );

  if (linkable) {
    return (
      <Link to={getBrandFilterHref(brand)} className={className} aria-label={`Ver productos ${name}`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function BrandMarquee({
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
  const loopItems = [...brands, ...brands];

  return (
    <div className="container py-2">
      <div className="relative mx-auto overflow-hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-black/80 to-transparent sm:w-16"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-black/80 to-transparent sm:w-16"
          aria-hidden="true"
        />

        <div className="brand-marquee-track flex w-max gap-2 sm:gap-3">
          {loopItems.map((brand, index) => (
            <div
              key={`${getBrandName(brand)}-${index}`}
              className="w-[7.5rem] shrink-0 sm:w-[8.5rem] md:w-[9.5rem]"
              aria-hidden={index >= brands.length}
            >
              <BrandLogoCard
                brand={brand}
                isDark={isDark}
                linkable={linkable && index < brands.length}
                isActive={activeBrandSlug === getBrandSlug(brand)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BrandStrip({
  brands = defaultBrands,
  variant = 'default',
  showHeading = true,
  linkable = true,
  activeBrandSlug = null,
  className,
}: BrandStripProps) {
  const isDark = variant === 'dark' || variant === 'filter';
  const isFilterRow = variant === 'filter';
  const isHeroCarousel = variant === 'dark' && !showHeading;

  return (
    <section
      aria-labelledby={showHeading ? 'marcas-titulo' : undefined}
      aria-label={
        showHeading ? undefined : isFilterRow ? 'Filtrar productos por marca' : 'Marcas disponibles'
      }
      className={cn(
        variant === 'dark' && 'border-t border-white/10 bg-black/70 backdrop-blur-sm',
        isFilterRow &&
          'rounded-xl bg-zinc-950 px-3 py-4 shadow-sm ring-1 ring-white/10 sm:px-4 sm:py-5',
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
        />
      ) : (
        <ul
          className={cn(
            'grid gap-2 sm:gap-3',
            showHeading
              ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-10'
              : isFilterRow
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10'
                : 'container grid-cols-2 py-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-5 lg:grid-cols-10',
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

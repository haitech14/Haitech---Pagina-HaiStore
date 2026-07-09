import { useState } from 'react';

import {
  dataplusPartnerBrands,
  getBrandLogo,
  getBrandLogoClassName,
  getBrandLogoDimensions,
  getBrandName,
} from '@/data/brands';
import { brandLogoSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

export function HomeDataplusBrandsGrid() {
  return (
    <ul
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-8"
      role="list"
      aria-label="Marcas disponibles en Haitech"
    >
      {dataplusPartnerBrands.map((brand) => (
        <li key={getBrandName(brand)}>
          <DataplusBrandLogoCard brand={brand} />
        </li>
      ))}
    </ul>
  );
}

export function HomeDataplusBrandsStrip() {
  return (
    <section aria-label="Marcas disponibles en Haitech" className="home-landing-sans bg-[#F5F5F5]">
      <div className="container py-6 sm:py-8">
        <HomeDataplusBrandsGrid />
      </div>
    </section>
  );
}

function DataplusBrandLogoCard({ brand }: { brand: (typeof dataplusPartnerBrands)[number] }) {
  const name = getBrandName(brand);
  const logo = getBrandLogo(brand);
  const logoClassName = getBrandLogoClassName(brand);
  const logoDimensions = getBrandLogoDimensions(brand);
  const [logoError, setLogoError] = useState(false);
  const isSvg = logo?.endsWith('.svg') ?? false;
  const { webpSrc, fallbackSrc } = logo ? brandLogoSources(logo) : { webpSrc: '', fallbackSrc: '' };

  return (
    <div
      className={cn(
        'flex h-14 select-none items-center justify-center rounded-xl border border-border/60 bg-white px-3 shadow-sm sm:h-16 md:h-[4.5rem]',
      )}
      aria-label={name}
    >
      {logo && !logoError ? (
        isSvg ? (
          <img
            src={logo}
            alt=""
            width={logoDimensions.width}
            height={logoDimensions.height}
            className={cn(logoClassName, 'opacity-90')}
            loading="lazy"
            draggable={false}
            onError={() => setLogoError(true)}
          />
        ) : (
          <picture className="flex items-center justify-center">
            <source type="image/webp" srcSet={webpSrc} />
            <img
              src={fallbackSrc}
              alt=""
              width={logoDimensions.width}
              height={logoDimensions.height}
              className={cn(logoClassName, 'opacity-90')}
              loading="lazy"
              draggable={false}
              onError={() => setLogoError(true)}
            />
          </picture>
        )
      ) : (
        <span className="text-center text-[0.625rem] font-semibold text-muted-foreground sm:text-xs">
          {name}
        </span>
      )}
    </div>
  );
}

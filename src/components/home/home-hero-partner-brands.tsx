import { useState } from 'react';

import {
  getBrandLogo,
  getBrandLogoDimensions,
  getBrandName,
  heroPartnerBrands,
} from '@/data/brands';
import { brandLogoSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

const HERO_BRAND_LOGO_CLASS =
  'max-h-[1.1875rem] w-auto max-w-[3.15rem] object-contain sm:max-h-[1.3125rem] sm:max-w-[3.5rem] lg:max-h-[1.375rem] lg:max-w-[3.75rem]';

type HomeHeroPartnerBrandsProps = {
  className?: string;
};

function HeroPartnerBrandLogo({
  brand,
}: {
  brand: (typeof heroPartnerBrands)[number];
}) {
  const name = getBrandName(brand);
  const logo = getBrandLogo(brand);
  const logoDimensions = getBrandLogoDimensions(brand);
  const [logoError, setLogoError] = useState(false);
  const isSquareLogo = name === 'HP';

  if (!logo || logoError) {
    return (
      <span className="text-[0.625rem] font-semibold text-[#888888] sm:text-xs" aria-hidden="true">
        {name}
      </span>
    );
  }

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
          HERO_BRAND_LOGO_CLASS,
          isSquareLogo &&
            'aspect-square h-[1.1875rem] w-[1.1875rem] sm:h-[1.3125rem] sm:w-[1.3125rem] lg:h-[1.375rem] lg:w-[1.375rem]',
        )}
        loading="lazy"
        draggable={false}
        onError={() => setLogoError(true)}
      />
    </picture>
  );
}

export function HomeHeroPartnerBrands({ className }: HomeHeroPartnerBrandsProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <ul
        className={cn(
          'flex w-full flex-nowrap items-center justify-start gap-x-1.5 sm:gap-x-2',
          'overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          'sm:overflow-visible',
        )}
        role="list"
        aria-label="Marcas con las que trabajamos"
      >
        {heroPartnerBrands.map((brand) => (
          <li key={getBrandName(brand)} className="flex shrink-0 items-center">
            <HeroPartnerBrandLogo brand={brand} />
            <span className="sr-only">{getBrandName(brand)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

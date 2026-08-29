import { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  getBrandFilterHref,
  getBrandLogo,
  getBrandLogoClassName,
  getBrandLogoDimensions,
  getBrandName,
  type BrandItem,
} from '@/data/brands';
import { brandLogoSources } from '@/lib/responsive-image';
import { cn } from '@/lib/utils';

/** Logo de marca (footer / listados). */
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

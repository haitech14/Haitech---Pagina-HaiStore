import { Link } from 'react-router-dom';

import {
  SITE_LOGO_ASSET_PATH,
  SITE_RICOH_PARTNER_BADGE_ARIA_LABEL,
  SITE_RICOH_PARTNER_BADGE_ASSET_PATH,
  SITE_RICOH_PARTNER_BADGE_ASSET_PATH_2X,
} from '@/lib/site-logo-asset';
import { cn } from '@/lib/utils';

/** Logo HAITECH — header, login y PDF. */
export const SITE_HEADER_LOGO_SRC = SITE_LOGO_ASSET_PATH;
/** Mismo asset; en footer se invierte para fondos oscuros. */
export const SITE_FOOTER_LOGO_SRC = SITE_LOGO_ASSET_PATH;
export const SITE_LOGO_ALT = 'HaiStore - HAITECH Soluciones de impresión';

type LogoImageProps = {
  className?: string;
  heightClass?: string;
  width?: number;
  height?: number;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
};

function LogoImage({
  src,
  alt,
  className,
  heightClass = 'h-10',
  width,
  height,
  loading,
  fetchPriority,
}: LogoImageProps & { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('w-auto object-contain', heightClass, className)}
      width={width}
      height={height}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
    />
  );
}

export function HeaderLogoImage(props: LogoImageProps) {
  return <LogoImage src={SITE_HEADER_LOGO_SRC} alt={SITE_LOGO_ALT} {...props} />;
}

const ricohPartnerBadgeSizeClasses = {
  sm: 'h-7 sm:h-8',
  md: 'h-8 sm:h-9',
  lg: 'h-9 sm:h-10',
} as const;

type RicohPartnerBadgeSize = keyof typeof ricohPartnerBadgeSizeClasses;

type RicohPartnerBadgeTone = 'light' | 'dark';

type RicohPartnerBadgeProps = {
  className?: string;
  size?: RicohPartnerBadgeSize;
  tone?: RicohPartnerBadgeTone;
};

export function RicohPartnerBadge({
  className,
  size = 'md',
  tone = 'light',
}: RicohPartnerBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center',
        tone === 'dark' && 'rounded-sm bg-white px-1 py-0.5',
        className,
      )}
    >
      <img
        src={SITE_RICOH_PARTNER_BADGE_ASSET_PATH}
        srcSet={`${SITE_RICOH_PARTNER_BADGE_ASSET_PATH} 1x, ${SITE_RICOH_PARTNER_BADGE_ASSET_PATH_2X} 2x`}
        alt={SITE_RICOH_PARTNER_BADGE_ARIA_LABEL}
        width={111}
        height={56}
        className={cn('w-auto object-contain', ricohPartnerBadgeSizeClasses[size])}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}

function partnerBadgeSizeFromLogoHeight(logoHeightClass: string): RicohPartnerBadgeSize {
  if (logoHeightClass === 'h-7 sm:h-8') return 'sm';
  if (logoHeightClass === 'h-8 sm:h-9' || logoHeightClass === 'h-9 sm:h-10') return 'md';
  if (logoHeightClass === 'h-9 lg:h-10') return 'md';
  return 'md';
}

type HeaderBrandLogosProps = LogoImageProps & {
  showPartner?: boolean;
  partnerTone?: RicohPartnerBadgeTone;
};

export function HeaderBrandLogos({
  className,
  heightClass = 'h-10',
  showPartner = true,
  partnerTone = 'light',
  loading,
  ...logoProps
}: HeaderBrandLogosProps) {
  return (
    <Link
      to="/"
      className={cn('flex shrink-0 items-center gap-2.5 sm:gap-3', className)}
      aria-label="HaiStore, inicio"
    >
      <HeaderLogoImage
        heightClass={heightClass}
        fetchPriority="high"
        {...(loading ? { loading } : {})}
        {...logoProps}
      />
      {showPartner ? (
        <RicohPartnerBadge
          size={partnerBadgeSizeFromLogoHeight(heightClass)}
          tone={partnerTone}
        />
      ) : null}
    </Link>
  );
}

export function HeaderLogoLink({ className, ...props }: LogoImageProps) {
  return (
    <Link to="/" className={cn('flex shrink-0 items-center', className)} aria-label="HaiStore, inicio">
      <HeaderLogoImage {...props} />
    </Link>
  );
}

export function FooterLogoImage({ className, ...props }: LogoImageProps) {
  return (
    <LogoImage
      src={SITE_FOOTER_LOGO_SRC}
      alt={SITE_LOGO_ALT}
      {...props}
      {...(className ? { className } : {})}
    />
  );
}

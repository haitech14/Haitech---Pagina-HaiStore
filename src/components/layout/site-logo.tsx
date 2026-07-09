import { Link } from 'react-router-dom';

import {
  SITE_LOGO_ASSET_PATH,
  SITE_RICOH_PARTNER_BADGE_ARIA_LABEL,
  SITE_RICOH_PARTNER_BADGE_BRAND,
  SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE1,
  SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE2,
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
  sm: {
    root: 'gap-0',
    ricoh: 'text-base font-bold leading-none tracking-[0.05em] sm:text-lg',
    subtitle: '-mt-px flex flex-col items-center text-center text-[0.5rem] font-medium leading-[1.08] sm:text-[0.5625rem]',
  },
  md: {
    root: 'gap-0',
    ricoh: 'text-lg font-bold leading-none tracking-[0.05em] sm:text-2xl',
    subtitle: '-mt-px flex flex-col items-center text-center text-[0.5625rem] font-medium leading-[1.08] sm:text-[0.625rem]',
  },
  lg: {
    root: 'gap-0',
    ricoh: 'text-2xl font-bold leading-none tracking-[0.05em]',
    subtitle: '-mt-px flex flex-col items-center text-center text-[0.6875rem] font-medium leading-[1.08]',
  },
} as const;

type RicohPartnerBadgeSize = keyof typeof ricohPartnerBadgeSizeClasses;

type RicohPartnerBadgeTone = 'light' | 'dark';

type RicohPartnerBadgeProps = {
  className?: string;
  size?: RicohPartnerBadgeSize;
  tone?: RicohPartnerBadgeTone;
};

const ricohPartnerBadgeToneClasses: Record<RicohPartnerBadgeTone, string> = {
  dark: 'text-white',
  light: 'text-[#111111]',
};

export function RicohPartnerBadge({
  className,
  size = 'md',
  tone = 'dark',
}: RicohPartnerBadgeProps) {
  const styles = ricohPartnerBadgeSizeClasses[size];

  return (
    <span
      className={cn(
        'inline-flex w-fit shrink-0 flex-col items-center bg-transparent',
        ricohPartnerBadgeToneClasses[tone],
        styles.root,
        className,
      )}
      role="img"
      aria-label={SITE_RICOH_PARTNER_BADGE_ARIA_LABEL}
    >
      <span className={cn('whitespace-nowrap', styles.ricoh)}>{SITE_RICOH_PARTNER_BADGE_BRAND}</span>
      <span className={styles.subtitle}>
        <span className="whitespace-nowrap">{SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE1}</span>
        <span className="whitespace-nowrap">{SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE2}</span>
      </span>
    </span>
  );
}

function partnerBadgeSizeFromLogoHeight(logoHeightClass: string): RicohPartnerBadgeSize {
  if (logoHeightClass === 'h-7 sm:h-8') return 'sm';
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
  partnerTone = 'dark',
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
        <>
          <span
            className={cn(
              'h-8 w-px shrink-0 sm:h-9',
              partnerTone === 'dark' ? 'bg-white/25' : 'bg-gray-300',
            )}
            aria-hidden="true"
          />
          <RicohPartnerBadge
            size={partnerBadgeSizeFromLogoHeight(heightClass)}
            tone={partnerTone}
          />
        </>
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

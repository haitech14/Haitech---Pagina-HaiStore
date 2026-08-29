import { Link } from 'react-router-dom';

import {
  SITE_LOGO_ASSET_PATH,
  SITE_RICOH_AUTHORIZED_LOGO_PATH,
  SITE_RICOH_PARTNER_BADGE_ARIA_LABEL,
  SITE_RICOH_PARTNER_BADGE_BRAND,
  SITE_RICOH_PARTNER_BADGE_SUBTITLE,
  SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE1,
  SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE2,
  SITE_RICOH_BRAND_RED,
  SITE_STOREFRONT_HEADER_LOGO_DARK_PATH,
  SITE_STOREFRONT_HEADER_LOGO_PATH,
} from '@/lib/site-logo-asset';
import { cn } from '@/lib/utils';

/** Logo HAITECH — header, login y PDF. */
export const SITE_HEADER_LOGO_SRC = SITE_LOGO_ASSET_PATH;
/** Logo claro (trazo blanco) para footer y fondos oscuros. */
export const SITE_FOOTER_LOGO_SRC = SITE_STOREFRONT_HEADER_LOGO_PATH;
export const SITE_LOGO_ALT = 'HaiStore - HAITECH Soluciones de impresión';
export const SITE_RICOH_AUTHORIZED_LOGO_ALT = SITE_RICOH_PARTNER_BADGE_ARIA_LABEL;

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

export function HeaderLogoImage({
  logoSrc = SITE_HEADER_LOGO_SRC,
  ...props
}: LogoImageProps & { logoSrc?: string }) {
  return <LogoImage src={logoSrc} alt={SITE_LOGO_ALT} {...props} />;
}

const authorizedDistributorLabelSizeClasses = {
  sm: 'text-[9px] sm:text-[10px]',
  md: 'text-[10px] sm:text-[11px] lg:text-xs',
  lg: 'text-[11px] sm:text-xs lg:text-sm',
} as const;

type AuthorizedDistributorLabelSize = keyof typeof authorizedDistributorLabelSizeClasses;

type AuthorizedDistributorLabelProps = {
  className?: string;
  size?: AuthorizedDistributorLabelSize;
  tone?: RicohPartnerBadgeTone;
};

const ricohAuthorizedStackSizeClasses = {
  sm: {
    brand:
      'origin-left scale-x-[1.02] scale-y-[0.93] text-[18px] font-black tracking-[0.01em] sm:text-[20px]',
    subtitle: 'mt-0 text-[7px] font-normal tracking-[0.01em] sm:text-[7.5px]',
  },
  md: {
    brand:
      'origin-left scale-x-[1.04] scale-y-[0.93] text-[22px] font-black tracking-[0.01em] sm:text-[24px] lg:text-[27px]',
    subtitle: 'mt-0 text-[7.5px] font-normal tracking-[0.01em] sm:text-[8px] lg:text-[8.5px]',
  },
  lg: {
    brand:
      'origin-left scale-x-[1.04] scale-y-[0.93] text-[24px] font-black tracking-[0.01em] sm:text-[27px] lg:text-[30px]',
    subtitle: 'mt-0 text-[8px] font-normal tracking-[0.01em] sm:text-[8.5px]',
  },
} as const;

type RicohAuthorizedStackSize = keyof typeof ricohAuthorizedStackSizeClasses;

type RicohAuthorizedStackProps = {
  className?: string;
  size?: RicohAuthorizedStackSize;
};

/** Lockup RICOH + «Distribuidor Autorizado» (referencia cabecera storefront). */
export function RicohAuthorizedDistributorStack({
  className,
  size = 'md',
}: RicohAuthorizedStackProps) {
  const styles = ricohAuthorizedStackSizeClasses[size];

  return (
    <span
      className={cn('inline-flex shrink-0 flex-col items-start leading-none', className)}
      role="img"
      aria-label={SITE_RICOH_PARTNER_BADGE_ARIA_LABEL}
    >
      <span
        className={cn('inline-block whitespace-nowrap text-[#E30613]', styles.brand)}
        style={{
          color: SITE_RICOH_BRAND_RED,
          fontWeight: 900,
          WebkitTextStroke: '0.4px currentColor',
        }}
      >
        {SITE_RICOH_PARTNER_BADGE_BRAND}
      </span>
      <span className={cn('whitespace-nowrap text-[#5A5A5A]', styles.subtitle)}>
        {SITE_RICOH_PARTNER_BADGE_SUBTITLE}
      </span>
    </span>
  );
}

/** Etiqueta «Distribuidor Autorizado» junto al logo HAITECH (sin lockup RICOH). */
export function AuthorizedDistributorLabel({
  className,
  size = 'md',
  tone = 'light',
}: AuthorizedDistributorLabelProps) {
  return (
    <span
      className={cn(
        'inline-flex max-w-[4.75rem] shrink-0 flex-col leading-[1.15] sm:max-w-none',
        authorizedDistributorLabelSizeClasses[size],
        tone === 'dark' ? 'text-white/90' : 'text-[#5A5A5A]',
        className,
      )}
      role="img"
      aria-label={SITE_RICOH_PARTNER_BADGE_ARIA_LABEL}
    >
      <span className="font-semibold tracking-[0.01em]">{SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE1}</span>
      <span className="font-semibold tracking-[0.01em]">{SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE2}</span>
    </span>
  );
}

const ricohPartnerBadgeSizeClasses = {
  sm: {
    root: 'gap-0',
    ricoh: 'text-sm font-bold leading-none tracking-[0.06em] sm:text-base',
    subtitle:
      '-mt-1.5 text-[0.4375rem] font-normal leading-none tracking-[0.02em] text-current/75 sm:text-[0.5rem]',
  },
  md: {
    root: 'gap-0',
    ricoh: 'text-base font-bold leading-none tracking-[0.06em] sm:text-lg',
    subtitle:
      '-mt-1.5 text-[0.5rem] font-normal leading-none tracking-[0.02em] text-current/75 sm:text-[0.5625rem]',
  },
  lg: {
    root: 'gap-0',
    ricoh: 'text-xl font-bold leading-none tracking-[0.06em]',
    subtitle:
      '-mt-1.5 text-[0.625rem] font-normal leading-none tracking-[0.02em] text-current/75',
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
        'inline-flex w-fit shrink-0 flex-col items-start bg-transparent',
        ricohPartnerBadgeToneClasses[tone],
        styles.root,
        className,
      )}
      role="img"
      aria-label={SITE_RICOH_PARTNER_BADGE_ARIA_LABEL}
    >
      <span className={cn('whitespace-nowrap', styles.ricoh)}>{SITE_RICOH_PARTNER_BADGE_BRAND}</span>
      <span className={cn('flex flex-col', styles.subtitle)}>
        <span className="whitespace-nowrap">{SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE1}</span>
        <span className="whitespace-nowrap">{SITE_RICOH_PARTNER_BADGE_SUBTITLE_LINE2}</span>
      </span>
    </span>
  );
}

function partnerBadgeSizeFromLogoHeight(logoHeightClass: string): RicohPartnerBadgeSize {
  if (logoHeightClass === 'h-7 sm:h-8') return 'sm';
  if (logoHeightClass === 'h-8 sm:h-9' || logoHeightClass === 'h-9 sm:h-10') return 'md';
  if (logoHeightClass === 'h-9 lg:h-10') return 'md';
  return 'md';
}

function ricohAuthorizedLogoHeightClass(logoHeightClass: string): string {
  if (logoHeightClass.includes('h-7')) return 'h-7 sm:h-8';
  if (logoHeightClass.includes('h-11') || logoHeightClass.includes('lg:h-11')) return 'h-10 lg:h-11';
  if (logoHeightClass.includes('h-10')) return 'h-9 sm:h-10';
  if (logoHeightClass.includes('h-9')) return 'h-8 sm:h-9';
  return 'h-9 sm:h-10';
}

type HeaderPartnerVariant = 'ricoh-image' | 'ricoh-badge' | 'authorized-label' | 'ricoh-authorized-stack';

type HeaderBrandLogosProps = LogoImageProps & {
  logoSrc?: string;
  showPartner?: boolean;
  partnerTone?: RicohPartnerBadgeTone;
  /** Variante de partner: imagen Ricoh, badge CSS o solo «Distribuidor Autorizado». */
  partnerVariant?: HeaderPartnerVariant;
  /** @deprecated Usar `partnerVariant`. */
  partnerAsImage?: boolean;
  /** Altura del PNG Ricoh; por defecto se deriva de `heightClass`. */
  partnerHeightClass?: string;
};

function ricohAuthorizedStackSizeFromLogoHeight(logoHeightClass: string): RicohAuthorizedStackSize {
  if (logoHeightClass.includes('h-6') || logoHeightClass.includes('h-7') || logoHeightClass.includes('h-8')) {
    return 'md';
  }
  if (logoHeightClass.includes('h-11') || logoHeightClass.includes('lg:h-11')) return 'lg';
  return 'md';
}

function resolvePartnerVariant(
  partnerVariant: HeaderPartnerVariant | undefined,
  partnerAsImage: boolean,
): HeaderPartnerVariant {
  if (partnerVariant) return partnerVariant;
  return partnerAsImage ? 'ricoh-image' : 'ricoh-badge';
}

export function HeaderBrandLogos({
  className,
  heightClass = 'h-10',
  logoSrc = SITE_HEADER_LOGO_SRC,
  showPartner = false,
  partnerTone = 'dark',
  partnerVariant,
  partnerAsImage = true,
  partnerHeightClass,
  loading,
  ...logoProps
}: HeaderBrandLogosProps) {
  const resolvedPartnerVariant = resolvePartnerVariant(partnerVariant, partnerAsImage);

  return (
    <Link
      to="/"
      className={cn('flex shrink-0 items-center gap-2.5 overflow-visible sm:gap-3', className)}
      aria-label={`HaiStore, inicio. ${SITE_RICOH_PARTNER_BADGE_SUBTITLE}`}
    >
      <HeaderLogoImage
        logoSrc={logoSrc}
        heightClass={heightClass}
        fetchPriority="high"
        {...(loading ? { loading } : {})}
        {...logoProps}
      />
      {showPartner ? (
        resolvedPartnerVariant === 'ricoh-authorized-stack' ? (
          <RicohAuthorizedDistributorStack
            size={ricohAuthorizedStackSizeFromLogoHeight(heightClass)}
          />
        ) : resolvedPartnerVariant === 'authorized-label' ? (
          <AuthorizedDistributorLabel
            size={ricohAuthorizedStackSizeFromLogoHeight(heightClass)}
            tone={partnerTone}
          />
        ) : resolvedPartnerVariant === 'ricoh-image' ? (
          <img
            src={SITE_RICOH_AUTHORIZED_LOGO_PATH}
            alt={SITE_RICOH_AUTHORIZED_LOGO_ALT}
            className={cn(
              'w-auto object-contain',
              partnerHeightClass ?? ricohAuthorizedLogoHeightClass(heightClass),
            )}
            loading={loading ?? 'eager'}
            decoding="async"
          />
        ) : (
          <RicohPartnerBadge
            size={partnerBadgeSizeFromLogoHeight(heightClass)}
            tone={partnerTone}
          />
        )
      ) : null}
    </Link>
  );
}

/** Logo HAITECH oscuro + lockup RICOH / Distribuidor Autorizado para cabecera storefront. */
export function StorefrontHeaderBrandLogos(props: Omit<HeaderBrandLogosProps, 'logoSrc' | 'showPartner' | 'partnerVariant'>) {
  return (
    <HeaderBrandLogos
      logoSrc={SITE_STOREFRONT_HEADER_LOGO_DARK_PATH}
      showPartner
      partnerVariant="ricoh-authorized-stack"
      partnerTone="light"
      {...props}
    />
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

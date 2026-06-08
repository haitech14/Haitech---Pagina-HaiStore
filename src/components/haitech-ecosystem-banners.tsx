import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_ECOSYSTEM_BANNERS,
  type HaitechEcosystemBanner,
  type HaitechEcosystemVariant,
} from '@/data/haitech-ecosystem';
import { cn } from '@/lib/utils';

const VARIANT_STYLES: Record<
  HaitechEcosystemVariant,
  {
    shell: string;
    overlay: string;
    glow: string;
    iconShell: string;
    prefixColor: string;
    accentLine: string;
    button: string;
    imageClass?: string;
  }
> = {
  support: {
    shell: 'bg-gradient-to-br from-neutral-950 via-[#120a0a] to-black',
    overlay:
      'bg-gradient-to-r from-neutral-950 from-[32%] via-neutral-950/90 via-[58%] to-transparent',
    glow: 'bg-red-600/25',
    iconShell:
      'bg-sky-600 text-white shadow-[0_0_18px_rgba(14,165,233,0.4)] ring-1 ring-sky-400/30',
    prefixColor: 'text-sky-400',
    accentLine: 'bg-red-500',
    button:
      'border-red-500/80 bg-black/35 text-red-500 hover:border-red-400 hover:bg-red-600/10 hover:text-red-400',
  },
  sales: {
    shell: 'bg-gradient-to-br from-[#060d18] via-[#0a1628] to-[#0f2038]',
    overlay:
      'bg-gradient-to-r from-[#060d18] from-[32%] via-[#0a1628]/90 via-[58%] to-transparent',
    glow: 'bg-sky-500/25',
    iconShell:
      'bg-sky-600 text-white shadow-[0_0_18px_rgba(14,165,233,0.4)] ring-1 ring-sky-400/30',
    prefixColor: 'text-sky-400',
    accentLine: 'bg-sky-500',
    button:
      'border-sky-500/80 bg-black/35 text-sky-400 hover:border-sky-400 hover:bg-sky-500/10 hover:text-sky-300',
    imageClass: 'opacity-[0.38] mix-blend-luminosity',
  },
  rent: {
    shell: 'bg-gradient-to-br from-neutral-950 via-[#140808] to-black',
    overlay:
      'bg-gradient-to-r from-neutral-950 from-[32%] via-neutral-950/90 via-[58%] to-transparent',
    glow: 'bg-red-600/22',
    iconShell:
      'bg-red-950 text-white shadow-[0_0_14px_rgba(220,38,38,0.25)] ring-1 ring-red-900/60',
    prefixColor: 'text-red-500',
    accentLine: 'bg-red-500',
    button:
      'border-red-500/80 bg-black/35 text-red-500 hover:border-red-400 hover:bg-red-600/10 hover:text-red-400',
  },
  protect: {
    shell: 'bg-gradient-to-br from-[#0a0f1a] via-[#101c32] to-[#060a12]',
    overlay:
      'bg-gradient-to-r from-[#0a0f1a] from-[32%] via-[#101c32]/92 via-[58%] to-transparent',
    glow: 'bg-red-600/28',
    iconShell:
      'bg-indigo-950 text-white shadow-[0_0_16px_rgba(99,102,241,0.3)] ring-1 ring-indigo-500/35',
    prefixColor: 'text-red-500',
    accentLine: 'bg-red-500',
    button:
      'border-red-500/80 bg-black/35 text-red-500 hover:border-red-400 hover:bg-red-600/10 hover:text-red-400',
    imageClass: 'opacity-[0.42] saturate-150',
  },
};

function BannerBrandHeader({
  banner,
  styles,
}: {
  banner: HaitechEcosystemBanner;
  styles: (typeof VARIANT_STYLES)[HaitechEcosystemVariant];
}) {
  const Icon = banner.icon;

  return (
    <div className="flex items-start gap-3">
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-lg sm:size-12',
          styles.iconShell,
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" strokeWidth={1.85} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-lg font-bold leading-none tracking-tight sm:text-xl">
          <span className={styles.prefixColor}>{banner.brandPrefix}</span>
          <span className="text-white">{banner.brandSuffix}</span>
        </p>
        <span
          className={cn('mt-2 block h-0.5 w-9 rounded-full', styles.accentLine)}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function BannerCta({
  banner,
  styles,
}: {
  banner: HaitechEcosystemBanner;
  styles: (typeof VARIANT_STYLES)[HaitechEcosystemVariant];
}) {
  const className = cn(
    'inline-flex min-h-10 w-fit items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
    styles.button,
  );

  const content = (
    <>
      {banner.ctaLabel}
      <ArrowRight className="size-4" aria-hidden="true" />
    </>
  );

  if (banner.external) {
    return (
      <a
        href={banner.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        {content}
      </a>
    );
  }

  return (
    <Link to={banner.href} className={className} onClick={(event) => event.stopPropagation()}>
      {content}
    </Link>
  );
}

function BannerCard({ banner }: { banner: HaitechEcosystemBanner }) {
  const styles = VARIANT_STYLES[banner.variant];
  const cardHref = banner.external ? banner.href : banner.href;

  const inner = (
    <>
      <img
        src={banner.image}
        alt=""
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 h-full w-[56%] object-contain object-right pr-2',
          'opacity-[0.36] transition-opacity duration-300 group-hover:opacity-[0.5] sm:w-[52%]',
          styles.imageClass,
        )}
        loading="lazy"
      />
      <div
        aria-hidden="true"
        className={cn('pointer-events-none absolute inset-0', styles.overlay)}
      />
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute -bottom-4 -right-4 size-36 rounded-full blur-3xl sm:size-44',
          styles.glow,
        )}
      />

      <div className="relative z-10 flex h-full min-h-[15.5rem] flex-col justify-between gap-6 p-5 sm:min-h-[16.5rem] sm:p-6">
        <div className="flex max-w-[15rem] flex-col gap-3.5 sm:max-w-[16rem]">
          <BannerBrandHeader banner={banner} styles={styles} />
          <p className="text-pretty text-sm leading-relaxed text-white/90 sm:text-[0.9375rem]">
            {banner.description}
          </p>
          <span className="sr-only">{banner.imageAlt}</span>
        </div>

        <BannerCta banner={banner} styles={styles} />
      </div>
    </>
  );

  const shellClass = cn(
    'group relative flex h-full w-full overflow-hidden rounded-2xl border border-white/10',
    'shadow-[0_14px_36px_-22px_rgba(0,0,0,0.85)] transition-all duration-300',
    'hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.95)]',
    styles.shell,
  );

  if (banner.external) {
    return (
      <a
        href={cardHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(shellClass, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background')}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      to={cardHref}
      className={cn(shellClass, 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background')}
    >
      {inner}
    </Link>
  );
}

export function HaitechEcosystemBanners() {
  return (
    <div
      className={cn(
        'mt-10 rounded-2xl border border-border/40 p-4 sm:mt-12 sm:p-5 lg:p-6',
        'bg-muted/25 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border)/0.45)_1px,transparent_0)] [background-size:22px_22px]',
      )}
    >
      <div
        className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
        aria-label="Plataformas y servicios Haitech"
      >
        {HAITECH_ECOSYSTEM_BANNERS.map((banner) => (
          <article key={banner.id} role="listitem" className="flex min-w-0">
            <BannerCard banner={banner} />
          </article>
        ))}
      </div>
    </div>
  );
}

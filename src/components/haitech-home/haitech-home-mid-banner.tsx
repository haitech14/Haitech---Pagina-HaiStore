import { Link } from 'react-router-dom';

import {
  HAITECH_HOME,
  HAITECH_HOME_MID_BANNER,
  HAITECH_HOME_POST_SERVICES_BANNERS,
  HAITECH_HOME_SERVICES_SECTION_HEADER,
} from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

type MidBannerItem = {
  png: string;
  webp?: string;
  width: number;
  height: number;
  alt: string;
  href: string;
  id?: string;
};

function MidBannerLink({ banner }: { banner: MidBannerItem }) {
  return (
    <Link
      to={banner.href}
      className={cn(
        'group relative block w-full overflow-hidden rounded-xl leading-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
    >
      <picture>
        {banner.webp ? <source srcSet={banner.webp} type="image/webp" /> : null}
        <img
          src={banner.png}
          alt={banner.alt}
          width={banner.width}
          height={banner.height}
          className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.01]"
          loading="lazy"
          decoding="async"
        />
      </picture>
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
    <header className="mb-5 flex flex-col gap-5 sm:mb-6 lg:mb-7 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
      <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:gap-6 lg:gap-8">
        <div className="shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#E30613] sm:text-[12px]">
            {eyebrow}
          </p>
          <h2
            id={titleId}
            className="mt-1 font-[family-name:var(--font-infobox)] text-[28px] font-bold leading-none tracking-tight text-[#111] sm:text-[34px] lg:text-[40px]"
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
          className="mt-1.5 block h-[3px] w-12 rounded-sm bg-[#E30613] lg:ml-auto"
          aria-hidden="true"
        />
      </div>
    </header>
  );
}

/** Banner promocional intermedio (imagen completa). */
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

/** Sección Nuestros Servicios + banners de servicio técnico y alquiler. */
export function HaitechHomePostServicesBanners({ className }: { className?: string }) {
  const header = HAITECH_HOME_SERVICES_SECTION_HEADER;
  const servicioBanner = HAITECH_HOME_POST_SERVICES_BANNERS.find((b) => b.id === 'mid-servicio');
  const alquilerBanner = HAITECH_HOME_POST_SERVICES_BANNERS.find((b) => b.id === 'mid-alquiler');

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

        {alquilerBanner ? <MidBannerLink banner={alquilerBanner} /> : null}
        {servicioBanner ? <MidBannerLink banner={servicioBanner} /> : null}
      </div>
    </section>
  );
}

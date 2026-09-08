import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { BarChart3, Cog, ShieldCheck } from 'lucide-react';

import { HAITECH_HOME } from '@/data/haitech-home-shell';
import {
  STOREFRONT_CHANNEL_BANNERS,
  type StorefrontChannelBannerId,
} from '@/data/storefront-channel-banners';
import { useHaitechWhatsAppQuoteContext } from '@/hooks/use-haitech-whatsapp-quote';
import { HAITECH_WHATSAPP_DISPLAY } from '@/lib/whatsapp-sales';
import { cn } from '@/lib/utils';

const FEATURE_ICONS = [BarChart3, Cog, ShieldCheck] as const;

interface StorefrontChannelHeroBannerProps {
  channel: StorefrontChannelBannerId;
  className?: string;
}

/** Banner de canal (Alquilar / Servicio técnico) con la misma presentación que Comprar. */
export function StorefrontChannelHeroBanner({
  channel,
  className,
}: StorefrontChannelHeroBannerProps) {
  const banner = STOREFRONT_CHANNEL_BANNERS[channel];
  const { requestQuote } = useHaitechWhatsAppQuoteContext();

  const handleClick = () =>
    requestQuote({
      campaign: banner.campaign,
      extraLines: [...banner.quoteLines],
    });

  return (
    <section
      aria-labelledby={`${channel}-promo-hero-title`}
      className={cn('w-full bg-white px-3 pb-2 pt-0 sm:px-4 sm:pb-3 lg:px-5', className)}
    >
      <div className="mx-auto" style={{ maxWidth: HAITECH_HOME.heroMaxWidth }}>
        <button
          type="button"
          onClick={handleClick}
          className={cn(
            'group relative block w-full cursor-pointer overflow-hidden rounded-2xl text-left leading-none',
            'shadow-[0_12px_36px_rgba(15,23,42,0.10)]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
          )}
          aria-label={`${banner.ctaLabel} por WhatsApp ${HAITECH_WHATSAPP_DISPLAY}`}
        >
          <div className="absolute inset-0 bg-[#F4F4F4]" aria-hidden="true" />
          <div
            className="pointer-events-none absolute -left-24 top-0 h-[130%] w-[16%] -skew-x-12 bg-[#E30613]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-20 bottom-8 h-[75%] w-[24%] skew-x-12 bg-[#E30613]"
            aria-hidden="true"
          />

          <div className="relative grid gap-5 px-5 pb-14 pt-6 sm:px-8 sm:pt-7 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.35fr)_minmax(9rem,0.55fr)] lg:items-center lg:gap-4 lg:px-10 lg:pb-16 lg:pt-8">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#555] sm:text-[11px]">
                {banner.eyebrow}
              </p>
              <h2
                id={`${channel}-promo-hero-title`}
                className="mt-2 font-[family-name:var(--font-infobox)] text-[1.65rem] font-black leading-[0.95] tracking-tight sm:text-[2.05rem] lg:text-[2.35rem]"
              >
                {banner.titleLines.map((line, index) => {
                  const accentIndex = banner.titleAccentLine;
                  const isAccent =
                    accentIndex != null ? index === accentIndex : index === 0 || index === 2;
                  const shrinkNonAccent = accentIndex == null && !isAccent;
                  return (
                    <span
                      key={line}
                      className={cn(
                        'block',
                        index > 0 && 'mt-1',
                        isAccent ? 'text-[#E30613]' : 'text-[#111]',
                        shrinkNonAccent && 'text-[0.82em]',
                      )}
                    >
                      {line}
                    </span>
                  );
                })}
              </h2>

              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {banner.features.map((feature, index) => {
                  const FeatureIcon = FEATURE_ICONS[index] ?? ShieldCheck;
                  return (
                    <li
                      key={feature.id}
                      className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#111] sm:text-[10px]"
                    >
                      <FeatureIcon className="size-3.5 shrink-0" strokeWidth={2.25} aria-hidden />
                      {feature.label}
                    </li>
                  );
                })}
              </ul>

              <span
                className={cn(
                  'mt-5 inline-flex items-center gap-2.5 rounded-full bg-[#E30613] px-4 py-2 text-white',
                  'shadow-[0_8px_20px_rgba(227,6,19,0.35)]',
                )}
              >
                <Icon path={mdiWhatsapp} size={0.95} className="shrink-0 text-white" aria-hidden />
                <span className="flex flex-col leading-none">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-white/85">
                    {banner.ctaLabel}
                  </span>
                  <span className="mt-0.5 text-[15px] font-black tabular-nums sm:text-[17px]">
                    {banner.phoneDisplay}
                  </span>
                </span>
              </span>
            </div>

            <ul className="grid grid-cols-3 items-end gap-2 sm:gap-3">
              {banner.products.map((product) => (
                <li key={product.id} className="flex min-w-0 flex-col items-center">
                  <img
                    src={product.image}
                    alt=""
                    className="relative z-[1] h-[5.5rem] w-auto object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.28)] sm:h-[7.5rem] lg:h-[9rem]"
                    loading="lazy"
                    decoding="async"
                  />
                  <span
                    className="mt-1 h-2 w-[72%] rounded-full bg-[#E30613] shadow-[0_0_18px_rgba(227,6,19,0.85)]"
                    aria-hidden="true"
                  />
                  <span className="mt-2 inline-flex max-w-full truncate rounded-md bg-[#E30613] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wide text-white sm:text-[10px]">
                    {product.name}
                  </span>
                  <span className="mt-1 text-[11px] font-black tabular-nums text-[#E30613] sm:text-sm">
                    {product.price}
                  </span>
                  <span className="mt-0.5 text-center text-[8px] font-semibold uppercase tracking-wide text-[#333] sm:text-[9px]">
                    {product.specs}
                  </span>
                </li>
              ))}
            </ul>

            <div className="hidden min-w-0 flex-col items-end text-right lg:flex">
              <img
                src="/brands/ricoh.png"
                alt="RICOH"
                className="h-7 w-auto object-contain brightness-0 invert"
                loading="lazy"
                decoding="async"
              />
              <p className="mt-2 max-w-[11rem] font-[family-name:var(--font-infobox)] text-[15px] font-semibold italic leading-snug text-white">
                {banner.tagline}
              </p>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 bg-black px-4 py-2.5 sm:px-6">
            <ul className="grid min-w-0 grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
              {banner.barItems.map((item) => (
                <li key={item.id} className="min-w-0">
                  <p className="truncate text-[9px] font-black uppercase tracking-[0.08em] text-white sm:text-[10px]">
                    {item.title}
                  </p>
                  <p className="truncate text-[8px] font-semibold uppercase tracking-wide text-white/70 sm:text-[9px]">
                    {item.subtitle}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </button>
      </div>
    </section>
  );
}

import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';

import {
  HOME_CATEGORY_PROMO_DEFAULT_TAB,
  HOME_CATEGORY_PROMO_TABS,
  type HomeCategoryPromoTab,
  type HomeCategoryPromoTabId,
} from '@/data/home-category-promo-tabs';
import { cn } from '@/lib/utils';

function PromoPanel({ tab }: { tab: HomeCategoryPromoTab }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/10',
        'bg-[#0a0a0a] shadow-[0_16px_48px_rgba(0,0,0,0.35)]',
      )}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 85% 40%, rgba(227,6,19,0.18) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 10% 90%, rgba(227,6,19,0.12) 0%, transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(rgba(227,6,19,0.22) 0.6px, transparent 0.7px)',
          backgroundSize: '18px 18px',
          maskImage: 'linear-gradient(120deg, transparent 35%, black 70%)',
        }}
      />

      <div className="relative grid items-center gap-6 px-5 py-7 sm:gap-8 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10 lg:px-10 lg:py-10">
        <div className="min-w-0 text-white">
          <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-none">
            {tab.title}
          </h3>
          <div className="mt-3 h-1 w-14 rounded-full bg-[#E30613]" aria-hidden="true" />
          <p className="mt-4 text-base font-semibold text-white sm:text-lg">{tab.subtitle}</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70 sm:text-[0.9375rem]">
            {tab.description}
          </p>

          <Link
            to={tab.ctaHref}
            className={cn(
              'mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#E30613] px-5 text-sm font-bold text-white',
              'shadow-[0_8px_24px_rgba(227,6,19,0.35)] transition-opacity hover:opacity-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]',
            )}
          >
            {tab.ctaLabel}
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>

          <div className="mt-6 flex max-w-md items-start gap-3 rounded-xl border border-white/15 bg-black/35 px-3.5 py-3 sm:px-4 sm:py-3.5">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#E30613]/15 text-[#E30613]">
              <ShieldCheck className="size-5" strokeWidth={2} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white">{tab.featureTitle}</p>
              <p className="mt-0.5 text-xs leading-snug text-white/65 sm:text-[0.8125rem]">
                {tab.featureDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-md items-center justify-center lg:max-w-none">
          <div
            className="pointer-events-none absolute size-[78%] rounded-full opacity-80"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(circle, rgba(227,6,19,0.22) 0%, rgba(227,6,19,0.06) 45%, transparent 70%)',
            }}
          />
          <img
            src={tab.productImage}
            alt={tab.productImageAlt}
            className="relative z-[1] max-h-[16rem] w-full object-contain object-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.55)] sm:max-h-[18rem] lg:max-h-[22rem]"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  );
}

export function HomeCategoryPromoTabsSection({ className }: { className?: string }) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<HomeCategoryPromoTabId>(
    HOME_CATEGORY_PROMO_DEFAULT_TAB,
  );
  const active = HOME_CATEGORY_PROMO_TABS.find((tab) => tab.id === activeTab) ?? HOME_CATEGORY_PROMO_TABS[0]!;

  return (
    <section
      aria-labelledby={`${baseId}-title`}
      className={cn('home-landing-sans bg-white py-6 sm:py-8', className)}
    >
      <div className="container">
        <h2 id={`${baseId}-title`} className="sr-only">
          Categorías destacadas
        </h2>

        <div
          className="mb-4 flex flex-wrap justify-center gap-1.5 sm:mb-5 sm:gap-2"
          role="tablist"
          aria-label="Equipos, tóner y repuestos"
        >
          {HOME_CATEGORY_PROMO_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                className={cn(
                  'inline-flex min-h-9 shrink-0 items-center justify-center rounded-full border px-3.5 py-2 text-xs font-bold transition-colors sm:min-h-10 sm:px-5 sm:text-sm',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                  isActive
                    ? 'border-[#E30613] bg-[#E30613] text-white shadow-[0_4px_14px_rgba(227,6,19,0.25)]'
                    : 'border-border/80 bg-white text-[#333333] hover:border-[#E30613]/40 hover:bg-[#FFF5F5]',
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {HOME_CATEGORY_PROMO_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <div
              key={tab.id}
              role="tabpanel"
              id={`${baseId}-panel-${tab.id}`}
              aria-labelledby={`${baseId}-tab-${tab.id}`}
              hidden={!isActive}
              className={isActive ? undefined : 'hidden'}
            >
              {isActive ? <PromoPanel tab={active} /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { Check, ChevronRight, Settings2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import type { HaitechMockupMegaMenuData } from '@/data/haitech-mega-menu-mockup';
import { prefetchCategoryFromHref } from '@/lib/prefetch-category-page';
import { resolveMegaMenuColumnImage } from '@/lib/mega-menu-visuals';
import { cn } from '@/lib/utils';

const BRAND_RED = '#E30613';

type HaitechMockupMegaMenuPanelProps = {
  data: HaitechMockupMegaMenuData;
  onNavigate: () => void;
};

function MegaMenuRowLink({
  to,
  onNavigate,
  className,
  children,
}: {
  to: string;
  onNavigate: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const prefetch = () => prefetchCategoryFromHref(queryClient, to);

  return (
    <Link
      to={to}
      onClick={onNavigate}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      className={className}
    >
      {children}
    </Link>
  );
}

function AdvisorCtaCard({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="mt-4 rounded-xl border border-[#E8EAED] bg-[#F7F8FA] p-3.5">
      <div className="flex gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#E30613]/30 bg-white text-[#E30613]"
          aria-hidden="true"
        >
          <Settings2 className="size-4" strokeWidth={1.75} />
        </span>
        <p className="text-[0.8125rem] leading-snug text-[#4B5563]">
          ¿No encuentras el equipo que necesitas? Te asesoramos para encontrar la mejor solución
          Ricoh.
        </p>
      </div>
      <MegaMenuRowLink
        to="/contacto"
        onNavigate={onNavigate}
        className={cn(
          'mt-3 inline-flex w-full items-center justify-center gap-1 rounded-lg border border-[#E30613] bg-white px-3 py-2',
          'text-[0.8125rem] font-semibold text-[#E30613] transition-colors hover:bg-[#FFF5F5]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        )}
      >
        Hablar con un asesor
        <ChevronRight className="size-3.5" aria-hidden="true" />
      </MegaMenuRowLink>
    </div>
  );
}

function MegaMenuSectionColumn({
  section,
  onNavigate,
  withDivider,
}: {
  section: HaitechMockupMegaMenuData['sections'][number];
  onNavigate: () => void;
  withDivider?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-w-[15.5rem] max-w-[17.5rem] flex-1 flex-col px-5 py-5 first:pl-6 last:pr-5',
        withDivider && 'border-r border-[#EEF0F3]',
      )}
    >
      <h3
        className="mb-3 text-[0.6875rem] font-bold uppercase tracking-[0.14em]"
        style={{ color: BRAND_RED }}
      >
        {section.title}
      </h3>

      <ul className="space-y-0.5" role="list">
        {section.items.map((item) => {
          const imageSrc = resolveMegaMenuColumnImage(item.slug, item.image);

          return (
            <li key={item.slug}>
              <MegaMenuRowLink
                to={item.href}
                onNavigate={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-1 py-2.5 transition-colors',
                  'hover:bg-[#F8F9FB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
                )}
              >
                <img
                  src={imageSrc}
                  alt=""
                  className="size-20 shrink-0 object-contain transition-transform duration-200 group-hover:scale-[1.05]"
                  loading="lazy"
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-[0.875rem] font-semibold leading-snug text-[#111827] group-hover:text-[#E30613]">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block text-pretty text-[0.75rem] leading-snug text-[#6B7280]">
                    {item.subtitle}
                  </span>
                </span>
                <ChevronRight
                  className="size-3.5 shrink-0 text-[#D1D5DB] transition-colors group-hover:text-[#E30613]"
                  aria-hidden="true"
                />
              </MegaMenuRowLink>
            </li>
          );
        })}
      </ul>

      {section.showAdvisorCta ? <AdvisorCtaCard onNavigate={onNavigate} /> : null}
    </div>
  );
}

function FeaturedAside({
  featured,
  onNavigate,
}: {
  featured: HaitechMockupMegaMenuData['featured'];
  onNavigate: () => void;
}) {
  return (
    <aside
      className="flex w-[15.5rem] shrink-0 flex-col border-l border-[#EEF0F3] bg-white px-5 py-5 sm:w-[16.5rem]"
      aria-label="Destacado"
    >
      <p
        className="origin-left scale-x-[1.1] text-[1.4375rem] font-black tracking-[0.1em]"
        style={{ color: BRAND_RED, WebkitTextStroke: '0.4px currentColor' }}
        aria-label="RICOH"
      >
        RICOH
      </p>

      <p className="mt-3 text-[1.0625rem] font-bold leading-snug text-[#111827]">
        {featured.headline}{' '}
        <span style={{ color: BRAND_RED }}>{featured.headlineAccent}</span>
      </p>

      <div className="mt-4 overflow-hidden rounded-lg bg-[#F9FAFB] p-3">
        <img
          src={featured.image}
          alt={featured.imageAlt}
          className="mx-auto max-h-36 w-full object-contain"
          loading="lazy"
        />
      </div>

      <ul className="mt-4 space-y-2" role="list">
        {featured.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2 text-[0.8125rem] text-[#374151]">
            <span
              className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-white"
              style={{ backgroundColor: BRAND_RED }}
              aria-hidden="true"
            >
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      <MegaMenuRowLink
        to={featured.ctaHref}
        onNavigate={onNavigate}
        className={cn(
          'mt-5 inline-flex w-full items-center justify-center gap-1 rounded-lg px-4 py-2.5 text-[0.8125rem] font-semibold text-white',
          'transition-colors hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
        )}
        style={{ backgroundColor: BRAND_RED }}
      >
        {featured.ctaLabel}
        <ChevronRight className="size-3.5" aria-hidden="true" />
      </MegaMenuRowLink>
    </aside>
  );
}

export function HaitechMockupMegaMenuPanel({ data, onNavigate }: HaitechMockupMegaMenuPanelProps) {
  return (
    <div className="flex w-max max-w-[min(72rem,calc(100vw-1.5rem))] bg-white">
      <div className="flex min-w-0 flex-1">
        {data.sections.map((section, index) => (
          <MegaMenuSectionColumn
            key={section.id}
            section={section}
            onNavigate={onNavigate}
            withDivider={index < data.sections.length}
          />
        ))}
      </div>
      <FeaturedAside featured={data.featured} onNavigate={onNavigate} />
    </div>
  );
}

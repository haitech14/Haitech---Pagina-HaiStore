import {
  Award,
  FileText,
  Headphones,
  MessageCircle,
  ShieldCheck,
  Truck,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import {
  HAITECH_SHOWCASE_ACCENT,
  HAITECH_SHOWCASE_BENEFITS,
  HAITECH_SHOWCASE_BENEFITS_HEADER,
  HAITECH_SHOWCASE_MAX_WIDTH,
} from '@/data/haitech-home-showcase';
import { cn } from '@/lib/utils';

type BenefitIconKey = (typeof HAITECH_SHOWCASE_BENEFITS)[number]['icon'];

function AdvisorIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex size-10 sm:size-11', className)} aria-hidden="true">
      <UserRound className="size-full" strokeWidth={1.4} />
      <span
        className="absolute -right-1 -top-0.5 flex size-4 items-center justify-center rounded-full bg-white sm:size-[18px]"
        style={{ color: HAITECH_SHOWCASE_ACCENT }}
      >
        <MessageCircle className="size-full" strokeWidth={2} />
      </span>
    </span>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <span className={cn('relative inline-flex size-10 sm:size-11', className)} aria-hidden="true">
      <FileText className="size-full" strokeWidth={1.4} />
      <span
        className="absolute -bottom-0.5 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-bold leading-none text-white sm:size-[18px] sm:text-[11px]"
        style={{ backgroundColor: HAITECH_SHOWCASE_ACCENT }}
      >
        $
      </span>
    </span>
  );
}

const LUCIDE_BENEFIT_ICONS: Record<Exclude<BenefitIconKey, 'advisor' | 'invoice'>, LucideIcon> = {
  award: Award,
  truck: Truck,
  headset: Headphones,
  'shield-check': ShieldCheck,
};

function BenefitIcon({ icon }: { icon: BenefitIconKey }) {
  if (icon === 'advisor') return <AdvisorIcon />;
  if (icon === 'invoice') return <InvoiceIcon />;

  const Icon = LUCIDE_BENEFIT_ICONS[icon];
  if (!Icon) return null;

  return <Icon className="size-10 sm:size-11" strokeWidth={1.4} aria-hidden="true" />;
}

function BenefitsBlock() {
  const header = HAITECH_SHOWCASE_BENEFITS_HEADER;

  return (
    <section
      aria-labelledby="haitech-benefits-title"
      className="relative w-full overflow-hidden bg-white"
    >
      <div
        className="pointer-events-none absolute -left-6 -top-8 h-32 w-32 opacity-[0.14] sm:-left-8 sm:-top-10 sm:h-44 sm:w-44"
        style={{
          background: `linear-gradient(135deg, ${HAITECH_SHOWCASE_ACCENT} 0%, #cfcfcf 55%, transparent 70%)`,
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-10 -right-8 h-36 w-44 opacity-[0.12] sm:-bottom-12 sm:-right-10 sm:h-48 sm:w-56"
        style={{
          background: `linear-gradient(315deg, ${HAITECH_SHOWCASE_ACCENT} 0%, #cfcfcf 50%, transparent 72%)`,
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
        aria-hidden="true"
      />

      <div
        className="relative mx-auto px-4 py-12 sm:px-6 sm:py-16"
        style={{ maxWidth: HAITECH_SHOWCASE_MAX_WIDTH }}
      >
        <header className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <div className="mb-3.5 flex items-center justify-center gap-3 sm:mb-4 sm:gap-5">
            <span className="h-px w-10 bg-[#d8d8d8] sm:w-16 md:w-24" aria-hidden="true" />
            <p
              className="shrink-0 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-[11px]"
              style={{ color: HAITECH_SHOWCASE_ACCENT }}
            >
              {header.eyebrow}
            </p>
            <span className="h-px w-10 bg-[#d8d8d8] sm:w-16 md:w-24" aria-hidden="true" />
          </div>

          <h2
            id="haitech-benefits-title"
            className="font-[family-name:var(--font-infobox)] text-[22px] font-bold leading-tight tracking-tight text-[#2a2a2a] sm:text-[28px] lg:text-[32px]"
          >
            {header.titleBefore}
            <span style={{ color: HAITECH_SHOWCASE_ACCENT }}>{header.titleBrand}</span>
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-[#6b6b6b] sm:text-[15px]">
            {header.subtitle}
          </p>
        </header>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {HAITECH_SHOWCASE_BENEFITS.map((item, index) => (
            <li
              key={item.id}
              className={cn(
                'group flex flex-col items-center px-3 py-3 text-center sm:px-4 sm:py-2',
                index % 2 === 1 && 'border-l border-[#ebebeb]',
                index % 3 !== 0 && 'sm:border-l sm:border-[#ebebeb]',
                index > 0 && 'lg:border-l lg:border-[#ebebeb]',
              )}
            >
              <span
                className="mb-4 flex size-[84px] items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 sm:mb-5 sm:size-[96px]"
                style={{
                  color: HAITECH_SHOWCASE_ACCENT,
                  background:
                    'radial-gradient(circle, rgba(227,6,19,0.16) 0%, rgba(227,6,19,0.05) 52%, rgba(227,6,19,0) 72%)',
                }}
              >
                <BenefitIcon icon={item.icon} />
              </span>
              <p
                className="max-w-[12rem] text-[12px] font-bold leading-snug sm:text-[13px]"
                style={{ color: HAITECH_SHOWCASE_ACCENT }}
              >
                {item.title}
              </p>
              <p className="mt-2 max-w-[12.5rem] text-[11px] leading-snug text-[#777] sm:text-[12px]">
                {item.subtitle}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Bloque estilo vitrina: beneficios HAITECH. */
export function HaitechHomeShowcaseSection({ className }: { className?: string }) {
  return (
    <div className={cn('w-full bg-white', className)}>
      <BenefitsBlock />
    </div>
  );
}

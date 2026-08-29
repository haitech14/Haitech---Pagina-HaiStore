import { Check, ChevronRight, Printer, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_LANDING_COLORS,
  HAITECH_LANDING_SERVICE_CARDS,
} from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

function ServiceCardIcon({ icon }: { icon: 'wrench' | 'printer' }) {
  const Icon = icon === 'wrench' ? Wrench : Printer;

  return (
    <span
      className="mb-3 flex size-10 items-center justify-center rounded-full border-2 bg-white"
      style={{ borderColor: HAITECH_LANDING_COLORS.primary }}
      aria-hidden="true"
    >
      <Icon className="size-[18px]" style={{ color: HAITECH_LANDING_COLORS.primary }} strokeWidth={2} />
    </span>
  );
}

function ServiceBullet({ children }: { children: string }) {
  return (
    <li className="flex items-center gap-2 text-[12px] sm:text-[13px]" style={{ color: HAITECH_LANDING_COLORS.textPrimary }}>
      <span
        className="flex size-4 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: HAITECH_LANDING_COLORS.primary }}
        aria-hidden="true"
      >
        <Check className="size-2.5 text-white" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function BusinessServices({ className }: { className?: string }) {
  return (
    <section className={cn('w-full', className)} aria-label="Servicio técnico y alquiler">
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {HAITECH_LANDING_SERVICE_CARDS.map((card) => (
          <li key={card.id}>
            <article className="flex h-full min-h-[248px] overflow-hidden rounded-xl border border-[#e8e8e8] bg-white shadow-[0_2px_14px_rgba(15,23,42,0.06)]">
              <div className="flex w-[56%] flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
                <ServiceCardIcon icon={card.icon} />
                <h3
                  className="text-[13px] font-bold uppercase leading-snug tracking-[0.03em] sm:text-[14px]"
                  style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
                >
                  {card.title}
                </h3>
                <p
                  className="mt-2 text-[12px] leading-snug sm:text-[13px]"
                  style={{ color: HAITECH_LANDING_COLORS.textSecondary }}
                >
                  {card.description}
                </p>
                <ul className="mt-3 space-y-2">
                  {card.bullets.map((bullet) => (
                    <ServiceBullet key={bullet}>{bullet}</ServiceBullet>
                  ))}
                </ul>
                <Link
                  to={card.href}
                  className={cn(
                    'mt-4 inline-flex h-9 w-fit items-center gap-1 rounded-md px-4 text-[11px] font-bold uppercase tracking-[0.05em] text-white',
                    'transition-colors hover:bg-[#be0010]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613] focus-visible:ring-offset-2',
                  )}
                  style={{ backgroundColor: HAITECH_LANDING_COLORS.primary }}
                >
                  {card.cta}
                  <ChevronRight className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                </Link>
              </div>
              <div className="relative w-[44%] bg-[#f4f4f4]">
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  className="absolute inset-0 size-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}

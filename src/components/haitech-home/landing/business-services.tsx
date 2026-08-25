import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

import {
  HAITECH_LANDING_COLORS,
  HAITECH_LANDING_SERVICE_CARDS,
} from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

export function BusinessServices({ className }: { className?: string }) {
  return (
    <section className={cn('w-full', className)} aria-label="Servicio técnico y alquiler">
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {HAITECH_LANDING_SERVICE_CARDS.map((card) => (
          <li key={card.id}>
            <article
              className="flex h-full min-h-[250px] overflow-hidden rounded-[9px] border bg-white"
              style={{ borderColor: '#e6e6e6' }}
            >
              <div className="flex w-[55%] flex-col justify-center gap-3 p-5 sm:p-6">
                <h3
                  className="text-[13px] font-bold uppercase leading-snug tracking-[0.02em] sm:text-[14px]"
                  style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
                >
                  {card.title}
                </h3>
                <p
                  className="text-[12px] leading-snug sm:text-[13px]"
                  style={{ color: HAITECH_LANDING_COLORS.textSecondary }}
                >
                  {card.description}
                </p>
                <ul className="space-y-1.5">
                  {card.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-1.5 text-[12px]"
                      style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
                    >
                      <Check
                        className="mt-0.5 size-3.5 shrink-0"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={card.href}
                  className={cn(
                    'mt-1 inline-flex h-9 w-fit items-center rounded px-3.5 text-[11px] font-bold uppercase tracking-wide text-white',
                    'transition-colors hover:bg-[#be0010]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e30613] focus-visible:ring-offset-2',
                  )}
                  style={{ backgroundColor: HAITECH_LANDING_COLORS.primary }}
                >
                  {card.cta}
                </Link>
              </div>
              <div className="relative w-[45%] bg-[#f7f7f7]">
                <img
                  src={card.image}
                  alt={card.imageAlt}
                  className="absolute inset-0 size-full object-cover"
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

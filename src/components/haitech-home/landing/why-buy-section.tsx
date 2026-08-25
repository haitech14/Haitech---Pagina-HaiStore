import {
  FileText,
  Shield,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import {
  HAITECH_LANDING_COLORS,
  HAITECH_LANDING_MAX_WIDTH,
  HAITECH_LANDING_WHY_BUY,
} from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

const ICONS: Record<(typeof HAITECH_LANDING_WHY_BUY)[number]['icon'], LucideIcon> = {
  shield: Shield,
  'shield-check': ShieldCheck,
  wrench: Wrench,
  user: UserRound,
  file: FileText,
  users: Users,
};

export function WhyBuySection({ className }: { className?: string }) {
  return (
    <section className={cn('w-full bg-white', className)} aria-labelledby="why-buy-heading">
      <div className="mx-auto px-4 pt-8 pb-7 sm:px-6" style={{ maxWidth: HAITECH_LANDING_MAX_WIDTH }}>
        <h2
          id="why-buy-heading"
          className="mb-7 text-center text-[15px] font-bold uppercase tracking-[0.04em] sm:text-[16px]"
          style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
        >
          ¿Por qué comprar en HAITECH?
        </h2>

        <ul className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-x-3">
          {HAITECH_LANDING_WHY_BUY.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <li key={item.id} className="flex items-start gap-2.5">
                <Icon
                  className="mt-0.5 size-[22px] shrink-0 text-[#222]"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
                <span className="min-w-0 leading-tight">
                  <span
                    className="block text-[13px] font-bold sm:text-[14px]"
                    style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
                  >
                    {item.title}
                  </span>
                  <span
                    className="mt-0.5 block text-[10px] sm:text-[11px]"
                    style={{ color: HAITECH_LANDING_COLORS.textSecondary }}
                  >
                    {item.subtitle}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-7 border-b border-[#e5e5e5]" />
      </div>
    </section>
  );
}

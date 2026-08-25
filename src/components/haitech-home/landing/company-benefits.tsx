import {
  Award,
  BadgeCheck,
  Headphones,
  Truck,
  type LucideIcon,
} from 'lucide-react';

import {
  HAITECH_LANDING_COLORS,
  HAITECH_LANDING_COMPANY_BENEFITS,
} from '@/data/haitech-home-landing-section';
import { cn } from '@/lib/utils';

const ICONS: Record<(typeof HAITECH_LANDING_COMPANY_BENEFITS)[number]['icon'], LucideIcon> = {
  truck: Truck,
  headphones: Headphones,
  medal: Award,
  badge: BadgeCheck,
};

export function CompanyBenefits({ className }: { className?: string }) {
  return (
    <section
      className={cn('w-full rounded-lg border px-3 py-4 sm:px-2 sm:py-5', className)}
      style={{
        backgroundColor: HAITECH_LANDING_COLORS.backgroundSoft,
        borderColor: '#eeeeee',
      }}
      aria-label="Beneficios HAITECH"
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
        {HAITECH_LANDING_COMPANY_BENEFITS.map((item, index) => {
          const Icon = ICONS[item.icon];
          return (
            <li
              key={item.id}
              className={cn(
                'flex items-center gap-3 px-3 sm:px-4',
                index > 0 && 'lg:border-l lg:border-[#e8e8e8]',
              )}
            >
              <Icon
                className="size-7 shrink-0 sm:size-8"
                style={{ color: HAITECH_LANDING_COLORS.primary }}
                strokeWidth={1.6}
                aria-hidden="true"
              />
              <span className="min-w-0 leading-tight">
                <span
                  className="block text-[13px] font-bold"
                  style={{ color: HAITECH_LANDING_COLORS.textPrimary }}
                >
                  {item.title}
                </span>
                <span
                  className="mt-0.5 block text-[11px]"
                  style={{ color: HAITECH_LANDING_COLORS.textSecondary }}
                >
                  {item.subtitle}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

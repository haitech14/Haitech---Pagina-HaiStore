import { DollarSign, FileText, ShoppingCart, TrendingDown, TrendingUp, Users } from 'lucide-react';

import { NovaCard } from '@/components/tiendanova/NovaCard';
import type { TiendaNovaMetric } from '@/data/tiendanova/dashboard';
import { cn } from '@/lib/utils';

const ICONS = {
  dollar: DollarSign,
  cart: ShoppingCart,
  users: Users,
  file: FileText,
} as const;

const TONE: Record<
  TiendaNovaMetric['tone'],
  { wrap: string; icon: string }
> = {
  success: { wrap: 'bg-emerald-50', icon: 'text-[#16A34A]' },
  primary: { wrap: 'bg-blue-50', icon: 'text-[#2563EB]' },
  purple: { wrap: 'bg-violet-50', icon: 'text-violet-500' },
  warning: { wrap: 'bg-orange-50', icon: 'text-[#F59E0B]' },
};

export function MetricCard({ metric }: { metric: TiendaNovaMetric }) {
  const Icon = ICONS[metric.icon];
  const tone = TONE[metric.tone];
  const up = metric.trend === 'up';

  return (
    <NovaCard className="p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{metric.label}</p>
          <p className="mt-2 text-[28px] font-bold leading-none tracking-tight text-slate-900">{metric.value}</p>
          <p
            className={cn(
              'mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold',
              up ? 'text-[#16A34A]' : 'text-[#EF4444]',
            )}
          >
            {up ? <TrendingUp className="size-3.5" aria-hidden="true" /> : <TrendingDown className="size-3.5" aria-hidden="true" />}
            {metric.delta} <span className="font-medium text-slate-400">{metric.deltaLabel}</span>
          </p>
        </div>
        <span className={cn('flex size-12 items-center justify-center rounded-full', tone.wrap)}>
          <Icon className={cn('size-5', tone.icon)} strokeWidth={2.1} aria-hidden="true" />
        </span>
      </div>
    </NovaCard>
  );
}

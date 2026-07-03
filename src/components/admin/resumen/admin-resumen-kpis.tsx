import { DollarSign, Gauge, ShoppingBag, TrendingDown, TrendingUp, Users } from 'lucide-react';

import { ADMIN_RESUMEN_KPIS } from '@/data/admin-resumen-data';
import { cn } from '@/lib/utils';

const iconMap = {
  users: Users,
  sales: DollarSign,
  orders: ShoppingBag,
  sla: Gauge,
} as const;

const iconStyles = {
  users: 'bg-blue-50 text-blue-600',
  sales: 'bg-emerald-50 text-emerald-600',
  orders: 'bg-amber-50 text-amber-600',
  sla: 'bg-violet-50 text-violet-600',
} as const;

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

export function AdminResumenKpis() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_RESUMEN_KPIS.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const trendPositive = kpi.trend >= 0;

        return (
          <article
            key={kpi.title}
            className="rounded-xl border border-border/60 bg-card p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-2 text-[1.75rem] font-bold leading-none tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-11 shrink-0 items-center justify-center rounded-xl',
                  iconStyles[kpi.icon],
                )}
                aria-hidden="true"
              >
                <Icon className="size-5" />
              </span>
            </div>

            <div className="mt-4 flex items-center gap-1.5">
              {trendPositive ? (
                <TrendingUp className="size-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-4 text-red-600" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'text-sm font-semibold',
                  trendPositive ? 'text-emerald-600' : 'text-red-600',
                )}
              >
                {formatTrend(kpi.trend)}
              </span>
              <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

import { FileText, Gauge, ShoppingBag, TrendingDown, TrendingUp, Users } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { ADMIN_RESUMEN_KPIS } from '@/data/admin-resumen-data';
import { cn } from '@/lib/utils';

const iconMap = {
  users: Users,
  sales: ShoppingBag,
  orders: FileText,
  sla: Gauge,
} as const;

const iconStyles = {
  users: 'bg-violet-50 text-violet-600',
  sales: 'bg-emerald-50 text-emerald-600',
  orders: 'bg-blue-50 text-blue-600',
  sla: 'bg-amber-50 text-amber-600',
} as const;

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

export function AdminResumenKpis() {
  if (ADMIN_RESUMEN_KPIS.length === 0) {
    return (
      <AdminEmptyState
        title="Sin métricas disponibles"
        description="Los indicadores del resumen aparecerán cuando haya datos reales del sistema."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_RESUMEN_KPIS.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const trendPositive = kpi.trend >= 0;

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  iconStyles[kpi.icon],
                )}
                aria-hidden="true"
              >
                <Icon className="size-3.5" />
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1">
              {trendPositive ? (
                <TrendingUp className="size-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5 text-red-600" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  trendPositive ? 'text-emerald-600' : 'text-red-600',
                )}
              >
                {formatTrend(kpi.trend)}
              </span>
              <span className="text-[0.6875rem] text-muted-foreground">{kpi.trendLabel}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

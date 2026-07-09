import { DollarSign, PackageCheck, ShoppingBag, TrendingDown, TrendingUp, Truck } from 'lucide-react';

import { computePedidosKpis } from '@/lib/admin-pedidos-utils';
import { cn } from '@/lib/utils';
import type { AdminPedidosKpi } from '@/types/admin-pedidos';
import type { StoreOrder } from '@/types/store';
import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';

const iconMap = {
  orders: ShoppingBag,
  sales: DollarSign,
  pending: Truck,
  delivered: PackageCheck,
} as const;

const iconStyles = {
  orders: 'bg-blue-50 text-blue-600',
  sales: 'bg-emerald-50 text-emerald-600',
  pending: 'bg-amber-50 text-amber-600',
  delivered: 'bg-violet-50 text-violet-600',
} as const;

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

interface AdminPedidosKpisProps {
  orders: StoreOrder[];
  range: AdminDateRange;
  isLoading?: boolean;
}

export function AdminPedidosKpis({ orders, range, isLoading }: AdminPedidosKpisProps) {
  const kpis: AdminPedidosKpi[] = computePedidosKpis(orders, range);

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Cargando métricas de pedidos…
      </p>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const trendPositive = kpi.trend >= 0;

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
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
              <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

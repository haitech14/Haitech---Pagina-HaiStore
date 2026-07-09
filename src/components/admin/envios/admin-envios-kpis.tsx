import { Clock, PackageCheck, Timer, TrendingDown, TrendingUp, Truck } from 'lucide-react';
import { Area, AreaChart } from 'recharts';

import { ChartContainer } from '@/components/ui/chart';
import { computeEnviosKpis } from '@/lib/admin-envios-utils';
import { cn } from '@/lib/utils';
import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import type { AdminEnviosKpiIcon } from '@/types/admin-envios';
import type { ShipmentRecord } from '@/types/shipping';

const iconMap = {
  transit: Truck,
  delivered: PackageCheck,
  pending: Clock,
  avgTime: Timer,
} as const;

const iconStyles = {
  transit: 'bg-emerald-50 text-emerald-600',
  delivered: 'bg-violet-50 text-violet-600',
  pending: 'bg-amber-50 text-amber-600',
  avgTime: 'bg-blue-50 text-blue-600',
} as const;

const sparkConfig = {
  value: { label: 'Tendencia', color: 'hsl(var(--admin-accent))' },
};

function formatTrend(trend: number, icon: AdminEnviosKpiIcon) {
  if (icon === 'avgTime') {
    const sign = trend > 0 ? '+' : '';
    return `${sign}${trend} h`;
  }
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend}%`;
}

interface AdminEnviosKpisProps {
  shipments: ShipmentRecord[];
  range: AdminDateRange;
}

export function AdminEnviosKpis({ shipments, range }: AdminEnviosKpisProps) {
  const kpis = computeEnviosKpis(shipments, range);

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const trendPositive = kpi.trend >= 0;
        const sparkData = kpi.sparkline.map((value, index) => ({ index, value }));

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

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <div className="flex items-center gap-1">
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
                  {formatTrend(kpi.trend, kpi.icon)}
                </span>
                <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
              </div>

              <ChartContainer config={sparkConfig} className="h-8 w-16">
                <AreaChart data={sparkData} aria-hidden="true">
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--admin-accent))"
                    fill="hsl(var(--admin-accent))"
                    fillOpacity={0.12}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </article>
        );
      })}
    </div>
  );
}

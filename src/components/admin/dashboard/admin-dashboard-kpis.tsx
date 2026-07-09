import {
  AlertTriangle,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';

import { ADMIN_DASHBOARD_KPIS } from '@/data/admin-dashboard-data';
import { cn } from '@/lib/utils';

const iconMap = {
  sales: Wallet,
  orders: ShoppingBag,
  'low-stock': AlertTriangle,
  clients: UserPlus,
} as const;

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const width = 72;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-6 w-[4.5rem]"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function AdminDashboardKpis() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_DASHBOARD_KPIS.map((kpi) => {
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
                  kpi.iconClassName,
                )}
                aria-hidden="true"
              >
                <Icon className="size-3.5" />
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1">
                {trendPositive ? (
                  <TrendingUp className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trendPositive ? 'text-emerald-600' : 'text-red-600',
                  )}
                >
                  {formatTrend(kpi.trend)}
                </span>
                <span className="truncate text-[0.6875rem] text-muted-foreground">
                  {kpi.trendLabel}
                </span>
              </div>
              <Sparkline values={kpi.sparkline} color={kpi.sparklineColor} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

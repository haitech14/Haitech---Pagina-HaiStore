import { DollarSign, Gauge, Headset, TrendingDown, TrendingUp, Users } from 'lucide-react';

import { ADMIN_DASHBOARD_KPIS } from '@/data/admin-dashboard-data';
import { cn } from '@/lib/utils';

const iconMap = {
  users: Users,
  sales: DollarSign,
  tickets: Headset,
  sla: Gauge,
} as const;

const iconStyles = {
  users: 'bg-blue-50 text-blue-600',
  sales: 'bg-emerald-50 text-emerald-600',
  tickets: 'bg-amber-50 text-amber-600',
  sla: 'bg-violet-50 text-violet-600',
} as const;

const sparklineColors = {
  users: '#3B82F6',
  sales: '#22C55E',
  tickets: '#F59E0B',
  sla: '#8B5CF6',
} as const;

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const width = 88;
  const height = 32;
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
      className="h-8 w-[5.5rem]"
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_DASHBOARD_KPIS.map((kpi) => {
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

            <div className="mt-4 flex items-end justify-between gap-2">
              <div className="flex items-center gap-1.5">
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
              <Sparkline values={kpi.sparkline} color={sparklineColors[kpi.icon]} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { BANDEJA_KPIS } from '@/data/bandeja-mock';
import { cn } from '@/lib/utils';

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend}%`;
}

export function BandejaKpis() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {BANDEJA_KPIS.map((kpi) => {
        const trendPositive = kpi.trend >= 0;
        const chartData = kpi.sparkline.map((value, index) => ({ index, value }));

        return (
          <article
            key={kpi.id}
            className="overflow-hidden rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <div className="h-10 w-16 shrink-0" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`bandeja-kpi-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={kpi.color} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={kpi.color}
                      strokeWidth={1.5}
                      fill={`url(#bandeja-kpi-${kpi.id})`}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1">
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

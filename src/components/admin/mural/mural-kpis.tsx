import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { Eye, Heart, Megaphone, Pin, TrendingDown, TrendingUp } from 'lucide-react';

import { MURAL_BLOG_KPIS } from '@/data/mural-blog-mock';
import { cn } from '@/lib/utils';
import type { MuralBlogKpi } from '@/types/mural-blog';

const KPI_ICONS = {
  megaphone: Megaphone,
  pin: Pin,
  heart: Heart,
  eye: Eye,
} as const;

function formatTrend(kpi: MuralBlogKpi) {
  if (kpi.trend === null) return kpi.trendLabel;
  const sign = kpi.trend > 0 ? '+' : '';
  return `${sign}${kpi.trend}% ${kpi.trendLabel}`;
}

export function MuralKpis() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {MURAL_BLOG_KPIS.map((kpi) => {
        const Icon = KPI_ICONS[kpi.icon];
        const trendPositive = kpi.trend === null ? null : kpi.trend >= 0;
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
              <div className="flex flex-col items-end gap-1.5">
                <span
                  className="inline-flex size-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="h-8 w-14 shrink-0" aria-hidden="true">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`mural-kpi-${kpi.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={kpi.color} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={kpi.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke={kpi.color}
                        strokeWidth={1.5}
                        fill={`url(#mural-kpi-${kpi.id})`}
                        dot={false}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1">
              {kpi.trend !== null ? (
                trendPositive ? (
                  <TrendingUp className="size-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3.5 text-red-600" aria-hidden="true" />
                )
              ) : null}
              <span
                className={cn(
                  'text-xs font-semibold',
                  kpi.trend === null
                    ? 'text-muted-foreground'
                    : trendPositive
                      ? 'text-emerald-600'
                      : 'text-red-600',
                )}
              >
                {formatTrend(kpi)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

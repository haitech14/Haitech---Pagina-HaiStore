import { Line, LineChart, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';

interface AdminKpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number | null;
  trendLabel?: string;
  sparkline?: Array<{ value: number }>;
  className?: string;
}

function formatTrend(trend: number) {
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

export function AdminKpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel = 'vs periodo anterior',
  sparkline = [],
  className,
}: AdminKpiCardProps) {
  const trendPositive = trend !== null && trend !== undefined && trend >= 0;
  const hasTrend = trend !== null && trend !== undefined && !Number.isNaN(trend);

  return (
    <article
      className={cn(
        'rounded-xl border border-border/80 bg-card p-5 shadow-sm',
        className,
      )}
    >
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-3 flex items-end justify-between gap-3">
        {hasTrend ? (
          <span
            className={cn(
              'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
              trendPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-red-100 text-red-700',
            )}
          >
            {formatTrend(trend)} {trendLabel}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        )}
        {sparkline.length > 0 && (
          <div className="h-12 w-24" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkline}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--admin-accent))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </article>
  );
}

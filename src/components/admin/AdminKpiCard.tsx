import type { LucideIcon } from 'lucide-react';
import { TrendingDown, TrendingUp } from 'lucide-react';

import { cn } from '@/lib/utils';

interface AdminKpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number | null;
  trendLabel?: string;
  icon: LucideIcon;
  iconClassName?: string;
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
  icon: Icon,
  iconClassName = 'bg-blue-50 text-blue-600',
  className,
}: AdminKpiCardProps) {
  const trendPositive = trend !== null && trend !== undefined && trend >= 0;
  const hasTrend = trend !== null && trend !== undefined && !Number.isNaN(trend);

  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-lg border border-border/60 bg-card p-3 shadow-sm',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
            {value}
          </p>
          {subtitle ? <p className="mt-1 text-[0.6875rem] text-muted-foreground">{subtitle}</p> : null}
        </div>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg',
            iconClassName,
          )}
          aria-hidden="true"
        >
          <Icon className="size-3.5" />
        </span>
      </div>

      <div className="mt-2.5 flex items-center gap-1">
        {hasTrend ? (
          <>
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
              {formatTrend(trend)}
            </span>
          </>
        ) : (
          <span className="text-[0.6875rem] text-muted-foreground">{trendLabel}</span>
        )}
        {hasTrend ? (
          <span className="text-[0.6875rem] text-muted-foreground">{trendLabel}</span>
        ) : null}
      </div>
    </article>
  );
}

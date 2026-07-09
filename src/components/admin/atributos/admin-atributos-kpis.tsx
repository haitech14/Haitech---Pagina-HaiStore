import { Filter, ListChecks, ListFilter, SlidersHorizontal, TrendingUp } from 'lucide-react';

import { ADMIN_ATRIBUTOS_KPIS } from '@/data/admin-atributos-data';
import { cn } from '@/lib/utils';

const iconMap = {
  active: SlidersHorizontal,
  values: ListChecks,
  required: ListFilter,
  filters: Filter,
} as const;

const iconStyles = {
  active: 'bg-emerald-50 text-emerald-600',
  values: 'bg-orange-50 text-orange-600',
  required: 'bg-violet-50 text-violet-600',
  filters: 'bg-blue-50 text-blue-600',
} as const;

const sparklineColors = {
  active: '#22C55E',
  values: '#F97316',
  required: '#8B5CF6',
  filters: '#3B82F6',
} as const;

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

export function AdminAtributosKpis() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_ATRIBUTOS_KPIS.map((kpi) => {
        const Icon = iconMap[kpi.icon];

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
                {kpi.subtitle ? (
                  <p className="mt-1 text-[0.6875rem] text-muted-foreground">{kpi.subtitle}</p>
                ) : null}
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
              <div className="flex items-center gap-1.5">
                {kpi.delta !== undefined ? (
                  <>
                    <TrendingUp className="size-3.5 text-emerald-600" aria-hidden="true" />
                    <span className="text-xs font-semibold text-emerald-600">+{kpi.delta}</span>
                  </>
                ) : (
                  <span className="text-[0.6875rem] text-muted-foreground">{kpi.trendLabel}</span>
                )}
                {kpi.delta !== undefined ? (
                  <span className="text-xs text-muted-foreground">{kpi.trendLabel}</span>
                ) : null}
              </div>
              <Sparkline values={kpi.sparkline} color={sparklineColors[kpi.icon]} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

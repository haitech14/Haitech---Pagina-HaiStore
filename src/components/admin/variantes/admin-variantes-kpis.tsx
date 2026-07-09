import { Boxes, PackageX, ShoppingBag, TrendingDown, TrendingUp, Warehouse } from 'lucide-react';

import { ADMIN_VARIANTES_KPIS } from '@/data/admin-variantes-data';
import { cn } from '@/lib/utils';

const iconMap = {
  active: Boxes,
  products: ShoppingBag,
  stock: Warehouse,
  out_of_stock: PackageX,
} as const;

const iconStyles = {
  active: 'bg-emerald-50 text-emerald-600',
  products: 'bg-orange-50 text-orange-600',
  stock: 'bg-violet-50 text-violet-600',
  out_of_stock: 'bg-rose-50 text-rose-600',
} as const;

const sparklineColors = {
  active: '#22C55E',
  products: '#F97316',
  stock: '#8B5CF6',
  out_of_stock: '#EF4444',
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

export function AdminVariantesKpis() {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {ADMIN_VARIANTES_KPIS.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const isNegative = (kpi.trend ?? kpi.delta ?? 0) < 0;
        const deltaValue = kpi.delta ?? Math.abs(kpi.trend ?? 0);

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
              <div className="flex items-center gap-1.5">
                {kpi.delta !== undefined || kpi.trend !== undefined ? (
                  <>
                    {isNegative ? (
                      <TrendingDown className="size-3.5 text-rose-600" aria-hidden="true" />
                    ) : (
                      <TrendingUp className="size-3.5 text-emerald-600" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        isNegative ? 'text-rose-600' : 'text-emerald-600',
                      )}
                    >
                      {isNegative ? '-' : '+'}
                      {deltaValue}%
                    </span>
                  </>
                ) : null}
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

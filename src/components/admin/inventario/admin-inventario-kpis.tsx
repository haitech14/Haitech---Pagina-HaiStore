import {
  AlertTriangle,
  ArrowLeftRight,
  Coins,
  Package,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

import { buildInventarioKpis } from '@/lib/admin-inventario-products';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

const iconMap = {
  products: Package,
  'low-stock': AlertTriangle,
  movements: ArrowLeftRight,
  value: Coins,
} as const;

const iconStyles = {
  products: 'bg-blue-50 text-blue-600',
  'low-stock': 'bg-amber-50 text-amber-600',
  movements: 'bg-emerald-50 text-emerald-600',
  value: 'bg-violet-50 text-violet-600',
} as const;

const sparklineColors = {
  products: '#3B82F6',
  'low-stock': '#F59E0B',
  movements: '#22C55E',
  value: '#8B5CF6',
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
      className="h-5 w-14 shrink-0"
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

interface AdminInventarioKpisProps {
  products: InventoryProduct[];
  isLoading?: boolean;
}

export function AdminInventarioKpis({ products, isLoading = false }: AdminInventarioKpisProps) {
  const kpis = buildInventarioKpis(products);

  return (
    <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const trendPositive = kpi.trend >= 0;
        const showTrend = kpi.trend !== 0;

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-2.5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[0.6875rem] font-medium leading-tight text-muted-foreground">
                  {kpi.title}
                </p>
                <p className="mt-0.5 text-lg font-bold leading-none tracking-tight text-foreground">
                  {isLoading ? '—' : kpi.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md',
                  iconStyles[kpi.icon],
                )}
                aria-hidden="true"
              >
                <Icon className="size-3" />
              </span>
            </div>

            <div className="mt-2 flex items-end justify-between gap-1.5">
              <div className="flex min-w-0 items-center gap-1">
                {showTrend ? (
                  <>
                    {trendPositive ? (
                      <TrendingUp className="size-3 shrink-0 text-emerald-600" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="size-3 shrink-0 text-red-600" aria-hidden="true" />
                    )}
                    <span
                      className={cn(
                        'text-[0.6875rem] font-semibold',
                        trendPositive ? 'text-emerald-600' : 'text-red-600',
                      )}
                    >
                      {formatTrend(kpi.trend)}
                    </span>
                  </>
                ) : null}
                <span className="truncate text-[0.6875rem] text-muted-foreground">
                  {kpi.trendLabel}
                </span>
              </div>
              <Sparkline values={kpi.sparkline} color={sparklineColors[kpi.icon]} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

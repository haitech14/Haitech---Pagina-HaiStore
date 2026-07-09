import { Box, Star, Tag, UserPlus } from 'lucide-react';

import { ADMIN_MARCAS_KPIS } from '@/data/admin-marcas-data';
import { cn } from '@/lib/utils';
import type { AdminMarcaKpi } from '@/types/admin-marcas';

const iconMap = {
  active: Tag,
  featured: Star,
  products: Box,
  new: UserPlus,
} as const;

const iconStyles = {
  active: 'bg-emerald-50 text-emerald-600',
  featured: 'bg-amber-50 text-amber-600',
  products: 'bg-violet-50 text-violet-600',
  new: 'bg-blue-50 text-blue-600',
} as const;

const sparklineColors = {
  active: '#22C55E',
  featured: '#F59E0B',
  products: '#8B5CF6',
  new: '#3B82F6',
} as const;

const deltaColors = {
  active: 'text-emerald-600',
  featured: 'text-amber-600',
  products: 'text-violet-600',
  new: 'text-blue-600',
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

function formatDelta(delta: number) {
  if (delta === 0) return null;
  return delta > 0 ? `+${delta}` : String(delta);
}

interface AdminMarcasKpisProps {
  kpis?: AdminMarcaKpi[];
}

export function AdminMarcasKpis({ kpis = ADMIN_MARCAS_KPIS }: AdminMarcasKpisProps) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const deltaLabel = formatDelta(kpi.delta);

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
                {deltaLabel ? (
                  <span className={cn('text-xs font-semibold', deltaColors[kpi.icon])}>
                    {deltaLabel}
                  </span>
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

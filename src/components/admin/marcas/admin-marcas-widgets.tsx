import { type ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  ADMIN_MARCAS_CATEGORY_PRESENCE,
  ADMIN_MARCAS_ORIGIN_DISTRIBUTION,
  ADMIN_MARCAS_TOP_SELLERS,
  ADMIN_MARCAS_TOTAL,
  ADMIN_MARCAS_UPDATED_AT,
} from '@/data/admin-marcas-data';
import { cn } from '@/lib/utils';
import type {
  AdminMarcaCategoryPresence,
  AdminMarcaOriginDistribution,
  AdminMarcaTopSeller,
} from '@/types/admin-marcas';

const originChartConfig = {
  asia: { label: 'Asia', color: '#8B5CF6' },
  na: { label: 'Norteamérica', color: '#22C55E' },
  eu: { label: 'Europa', color: '#3B82F6' },
  otros: { label: 'Otros', color: '#F59E0B' },
};

function WidgetCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'rounded-lg border border-border/60 bg-card p-3 shadow-sm',
        className,
      )}
    >
      <h2 className="mb-2.5 text-xs font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function TopSellerLogo({
  logoBg,
  logoText,
  name,
}: {
  logoBg?: string;
  logoText?: string;
  name: string;
}) {
  return (
    <span
      className="flex size-7 shrink-0 items-center justify-center rounded-md text-[0.5625rem] font-bold text-white"
      style={{ backgroundColor: logoBg ?? '#111827' }}
      aria-hidden="true"
    >
      {logoText ?? name.slice(0, 2).toUpperCase()}
    </span>
  );
}

interface AdminMarcasWidgetsProps {
  total?: number;
  updatedAt?: Date;
  originDistribution?: AdminMarcaOriginDistribution[];
  categoryPresence?: AdminMarcaCategoryPresence[];
  topSellers?: AdminMarcaTopSeller[];
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function AdminMarcasWidgets({
  total = ADMIN_MARCAS_TOTAL,
  updatedAt = ADMIN_MARCAS_UPDATED_AT,
  originDistribution = ADMIN_MARCAS_ORIGIN_DISTRIBUTION,
  categoryPresence = ADMIN_MARCAS_CATEGORY_PRESENCE,
  topSellers = ADMIN_MARCAS_TOP_SELLERS,
  onRefresh,
  isRefreshing = false,
}: AdminMarcasWidgetsProps) {
  const donutData = originDistribution.map((item) => ({
    name: item.region,
    value: item.count,
    fill: item.color,
    key: item.region,
  }));

  const updatedLabel = formatDistanceToNow(updatedAt, { addSuffix: true, locale: es });

  return (
    <div className="space-y-3">
      <WidgetCard title="Marcas por origen">
        <div className="flex flex-col items-center gap-3">
          <div className="relative mx-auto w-full max-w-[10rem]">
            <ChartContainer config={originChartConfig} className="mx-auto aspect-square h-[10rem]">
              <PieChart aria-label="Distribución de marcas por origen">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={46}
                  outerRadius={68}
                  strokeWidth={2}
                  stroke="hsl(var(--card))"
                >
                  {donutData.map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-foreground">{total}</span>
              <span className="text-[0.625rem] text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="w-full space-y-2">
            {originDistribution.map((item) => (
              <li key={item.region} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.region}</span>
                </div>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {item.percent}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard title="Presencia por categoría">
        <ul className="space-y-2.5">
          {categoryPresence.map((item) => (
            <li key={item.category}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-muted-foreground">{item.category}</span>
                <span className="shrink-0 font-semibold tabular-nums text-foreground">
                  {item.percent}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[hsl(var(--admin-accent))]"
                  style={{ width: `${item.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Marcas con más productos">
        <ol className="space-y-2.5">
          {topSellers.map((brand) => (
            <li key={brand.rank} className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-bold text-muted-foreground">
                {brand.rank}
              </span>
              <TopSellerLogo
                {...(brand.logoBg != null ? { logoBg: brand.logoBg } : {})}
                {...(brand.logoText != null ? { logoText: brand.logoText } : {})}
                name={brand.name}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">{brand.name}</p>
                <p className="text-[0.625rem] font-semibold tabular-nums text-[hsl(var(--admin-accent))]">
                  {(brand.productCount ?? brand.salesAmount ?? 0).toLocaleString('es-PE')} productos
                </p>
              </div>
            </li>
          ))}
        </ol>
      </WidgetCard>

      <div className="flex items-center justify-between gap-2 text-[0.625rem] text-muted-foreground">
        <span>Actualizado: {updatedLabel}</span>
        <button
          type="button"
          className="inline-flex items-center gap-1 font-medium text-[hsl(var(--admin-accent))] hover:underline disabled:opacity-60"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn('size-3', isRefreshing && 'animate-spin')} aria-hidden="true" />
          Actualizar
        </button>
      </div>
    </div>
  );
}

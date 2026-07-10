import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ReactNode, useMemo } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { AdminCategoriaRecord } from '@/types/admin-categorias';
import { cn } from '@/lib/utils';

const typeChartConfig = {
  principales: { label: 'Principales', color: '#3B82F6' },
  secundarias: { label: 'Secundarias', color: '#8B5CF6' },
  especiales: { label: 'Especiales', color: '#22C55E' },
  archivadas: { label: 'Archivadas', color: '#94A3B8' },
};

function WidgetCard({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
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
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminCategoriasWidgets({
  records = [],
  onRefresh,
}: {
  records?: AdminCategoriaRecord[];
  onRefresh?: () => void;
}) {
  const { donutData, total, productBars, topRotation, updatedAt } = useMemo(() => {
    const roots = records.filter((record) => !record.parentName).length;
    const subs = records.filter((record) => Boolean(record.parentName)).length;
    const featured = records.filter((record) => record.status === 'destacada').length;
    const archived = records.filter((record) => record.status === 'archivada').length;
    const totalCount = records.length;

    const distribution = [
      {
        label: 'Principales',
        count: roots,
        color: '#3B82F6',
        key: 'principales',
      },
      {
        label: 'Secundarias',
        count: subs,
        color: '#8B5CF6',
        key: 'secundarias',
      },
      {
        label: 'Destacadas',
        count: featured,
        color: '#22C55E',
        key: 'especiales',
      },
      {
        label: 'Archivadas',
        count: archived,
        color: '#94A3B8',
        key: 'archivadas',
      },
    ];

    const bars = [...records]
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5)
      .map((record) => ({
        name: record.name,
        count: record.productCount,
      }));

    const rotation = [...records]
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5)
      .map((record, index) => ({
        rank: index + 1,
        name: record.name,
        sales: record.productCount,
      }));

    const latest = records.reduce<Date | null>((acc, record) => {
      if (!acc || record.updatedAt > acc) return record.updatedAt;
      return acc;
    }, null);

    return {
      donutData: distribution.map((item) => ({
        name: item.label,
        value: item.count,
        fill: item.color,
        key: item.key,
      })),
      total: totalCount,
      productBars: bars,
      topRotation: rotation,
      updatedAt: latest ?? new Date(),
    };
  }, [records]);

  const maxProducts = Math.max(1, ...productBars.map((item) => item.count), 1);

  return (
    <aside className="space-y-3">
      <h2 className="px-0.5 text-xs font-semibold text-foreground">Insights de categorías</h2>

      <WidgetCard title="Categorías por tipo">
        <div className="flex flex-col items-center gap-3">
          <div className="relative mx-auto w-full max-w-[9rem]">
            <ChartContainer config={typeChartConfig} className="mx-auto aspect-square h-[9rem]">
              <PieChart aria-label="Distribución de categorías por tipo">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={52}
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

          <ul className="w-full space-y-1.5">
            {donutData.map((item) => (
              <li key={item.key} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.fill }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.name}</span>
                </div>
                <span className="shrink-0 tabular-nums text-foreground">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard title="Productos por categoría">
        {productBars.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin categorías aún.</p>
        ) : (
          <ul className="space-y-2.5">
            {productBars.map((item) => (
              <li key={item.name}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-foreground">{item.name}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full max-w-[45%] rounded-full bg-[hsl(var(--admin-accent))]"
                    style={{ width: `${(item.count / maxProducts) * 45}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      <WidgetCard title="Categorías con más productos">
        {topRotation.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin categorías aún.</p>
        ) : (
          <ol className="space-y-2">
            {topRotation.map((item) => (
              <li key={item.rank} className="flex items-center gap-2 text-xs">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-bold text-muted-foreground">
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.name}</p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {item.sales} productos
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </WidgetCard>

      <div className="flex items-center justify-between gap-2 text-[0.6875rem] text-muted-foreground">
        <span>
          Actualizado:{' '}
          {formatDistanceToNow(updatedAt, { addSuffix: true, locale: es })}
        </span>
        <button
          type="button"
          className="font-medium text-[hsl(var(--admin-accent))] hover:underline"
          onClick={onRefresh}
        >
          Actualizar
        </button>
      </div>
    </aside>
  );
}

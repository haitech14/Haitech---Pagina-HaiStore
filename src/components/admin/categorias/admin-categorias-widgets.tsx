import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ReactNode } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  ADMIN_CATEGORIAS_PRODUCT_BARS,
  ADMIN_CATEGORIAS_TOP_ROTATION,
  ADMIN_CATEGORIAS_TOTAL,
  ADMIN_CATEGORIAS_TYPE_DISTRIBUTION,
  ADMIN_CATEGORIAS_UPDATED_AT,
} from '@/data/admin-categorias-data';
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

export function AdminCategoriasWidgets({ onRefresh }: { onRefresh?: () => void }) {
  const donutData = ADMIN_CATEGORIAS_TYPE_DISTRIBUTION.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.label,
  }));

  const maxProducts = Math.max(1, ...ADMIN_CATEGORIAS_PRODUCT_BARS.map((item) => item.count));

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
              <span className="text-lg font-bold text-foreground">{ADMIN_CATEGORIAS_TOTAL}</span>
              <span className="text-[0.625rem] text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="w-full space-y-1.5">
            {ADMIN_CATEGORIAS_TYPE_DISTRIBUTION.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.label}</span>
                </div>
                <span className="shrink-0 tabular-nums text-foreground">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard title="Productos por categoría">
        <ul className="space-y-2.5">
          {ADMIN_CATEGORIAS_PRODUCT_BARS.map((item) => (
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
      </WidgetCard>

      <WidgetCard title="Categorías con más rotación">
        <ol className="space-y-2">
          {ADMIN_CATEGORIAS_TOP_ROTATION.map((item) => (
            <li key={item.rank} className="flex items-center gap-2 text-xs">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-bold text-muted-foreground">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-foreground">{item.name}</p>
                <p className="text-[0.625rem] text-muted-foreground">{item.sales} ventas</p>
              </div>
            </li>
          ))}
        </ol>
      </WidgetCard>

      <div className="flex items-center justify-between gap-2 text-[0.6875rem] text-muted-foreground">
        <span>
          Actualizado:{' '}
          {formatDistanceToNow(ADMIN_CATEGORIAS_UPDATED_AT, { addSuffix: true, locale: es })}
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

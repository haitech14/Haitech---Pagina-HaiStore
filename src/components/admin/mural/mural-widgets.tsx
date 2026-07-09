import type { ReactNode } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  MURAL_BLOG_AREA_STATS,
  MURAL_BLOG_AREA_TOTAL,
  MURAL_BLOG_INTERACTION_STATS,
  MURAL_BLOG_TRENDING_TOPICS,
} from '@/data/mural-blog-mock';
import { cn } from '@/lib/utils';

const areaChartConfig = Object.fromEntries(
  MURAL_BLOG_AREA_STATS.map((item) => [
    item.area,
    { label: item.label, color: item.color },
  ]),
);

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
      className={cn('rounded-lg border border-border/60 bg-card p-3 shadow-sm', className)}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function MuralWidgets() {
  const donutData = MURAL_BLOG_AREA_STATS.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.area,
    percent: item.percent,
  }));

  return (
    <div className="space-y-3">
      <WidgetCard title="Publicaciones por área">
        <div className="flex flex-col items-center gap-3">
          <div className="relative mx-auto w-full max-w-[9.5rem]">
            <ChartContainer config={areaChartConfig} className="mx-auto aspect-square h-[9.5rem]">
              <PieChart aria-label="Distribución de publicaciones por área">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={42}
                  outerRadius={64}
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
              <span className="text-base font-bold text-foreground">{MURAL_BLOG_AREA_TOTAL}</span>
              <span className="text-[0.625rem] text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="w-full space-y-2">
            {MURAL_BLOG_AREA_STATS.map((item) => (
              <li key={item.area} className="flex items-center justify-between gap-2 text-xs">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.label}</span>
                </div>
                <span className="shrink-0 font-semibold text-foreground">{item.percent}%</span>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard title="Interacción por tipo">
        <ul className="space-y-3">
          {MURAL_BLOG_INTERACTION_STATS.map((item) => (
            <li key={item.type}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.type}</span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.count.toLocaleString('es-PE')}</span>
                  {' '}
                  <span>({item.percent}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Temas destacados">
        <ol className="space-y-2">
          {MURAL_BLOG_TRENDING_TOPICS.map((item) => (
            <li key={item.rank} className="flex items-start gap-2 text-xs">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[0.6875rem] font-bold text-muted-foreground">
                {item.rank}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{item.topic}</p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  {item.posts} publicaciones
                </p>
              </div>
            </li>
          ))}
        </ol>
      </WidgetCard>

      <footer className="flex items-center justify-between px-1 text-[0.625rem] text-muted-foreground">
        <span>Actualizado: hace 2 minutos</span>
        <button type="button" className="font-medium text-[hsl(var(--admin-accent))] hover:underline">
          Actualizar
        </button>
      </footer>
    </div>
  );
}

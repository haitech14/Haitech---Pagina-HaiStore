import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ReactNode } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  buildMediosRecentItems,
  buildMediosSourceDistribution,
  buildMediosTypeDistribution,
  kindLabel,
  sourceLabel,
} from '@/lib/admin-medios-utils';
import { cn } from '@/lib/utils';
import type { MediaAlbumItem } from '@/types/media-album';

const typeChartConfig = {
  image: { label: 'Imágenes', color: '#3B82F6' },
  video: { label: 'Videos', color: '#8B5CF6' },
  youtube: { label: 'YouTube', color: '#EF4444' },
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
    <section className={cn('rounded-lg border border-border/60 bg-card p-3 shadow-sm', className)}>
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <h2 className="text-xs font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface AdminMediosWidgetsProps {
  items: MediaAlbumItem[];
  updatedAt: Date;
  onRefresh?: () => void;
}

export function AdminMediosWidgets({ items, updatedAt, onRefresh }: AdminMediosWidgetsProps) {
  const typeDistribution = buildMediosTypeDistribution(items);
  const sourceDistribution = buildMediosSourceDistribution(items);
  const recentItems = buildMediosRecentItems(items);
  const total = items.length;

  const donutData = typeDistribution.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.label,
  }));

  const maxSource = Math.max(1, ...sourceDistribution.map((item) => item.count));

  return (
    <aside className="space-y-3">
      <h2 className="px-0.5 text-xs font-semibold text-foreground">Insights de medios</h2>

      <WidgetCard title="Archivos por tipo">
        {donutData.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">Sin archivos aún.</p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative mx-auto w-full max-w-[9rem]">
              <ChartContainer config={typeChartConfig} className="mx-auto aspect-square h-[9rem]">
                <PieChart aria-label="Distribución por tipo de archivo">
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={donutData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={52} strokeWidth={2} stroke="hsl(var(--card))">
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
              {typeDistribution.map((item) => (
                <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} aria-hidden="true" />
                    <span className="truncate text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="shrink-0 tabular-nums text-foreground">{item.count}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Uso por fuente">
        <ul className="space-y-2.5">
          {sourceDistribution.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-foreground">{item.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{item.count}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.count / maxSource) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Subidos recientemente">
        {recentItems.length === 0 ? (
          <p className="py-4 text-xs text-muted-foreground">Aún no hay archivos en la biblioteca.</p>
        ) : (
          <ol className="space-y-2">
            {recentItems.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2 text-xs">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.625rem] font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.name}</p>
                  <p className="text-[0.625rem] text-muted-foreground">
                    {kindLabel(item.kind)} · {sourceLabel(item.source)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </WidgetCard>

      <div className="flex items-center justify-between gap-2 text-[0.6875rem] text-muted-foreground">
        <span>
          Actualizado: {formatDistanceToNow(updatedAt, { addSuffix: true, locale: es })}
        </span>
        <button type="button" className="font-medium text-[hsl(var(--admin-accent))] hover:underline" onClick={onRefresh}>
          Actualizar
        </button>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  AdminServiciosCategoryDistribution,
  AdminServiciosRequestUsage,
  AdminServiciosTopDemand,
} from '@/types/admin-servicios';

const categoryChartConfig = {
  mantenimiento: { label: 'Mantenimiento', color: '#22C55E' },
  instalacion: { label: 'Instalación', color: '#3B82F6' },
  soporte: { label: 'Soporte', color: '#8B5CF6' },
  consultoria: { label: 'Consultoría', color: '#F59E0B' },
  otros: { label: 'Otros', color: '#94A3B8' },
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

function formatUpdatedAt(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.max(1, Math.round(diffMs / 60_000));
  return `hace ${diffMinutes} minutos`;
}

interface AdminServiciosWidgetsProps {
  categoryDistribution: AdminServiciosCategoryDistribution[];
  requestUsage: AdminServiciosRequestUsage[];
  topDemand: AdminServiciosTopDemand[];
  onRefresh?: () => void;
}

export function AdminServiciosWidgets({
  categoryDistribution,
  requestUsage,
  topDemand,
  onRefresh,
}: AdminServiciosWidgetsProps) {
  const [updatedAt, setUpdatedAt] = useState(() => new Date());

  const total = categoryDistribution.reduce((sum, item) => sum + item.count, 0);

  const donutData = categoryDistribution.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.categoria,
  }));

  const handleRefresh = () => {
    setUpdatedAt(new Date());
    onRefresh?.();
  };

  return (
    <div className="space-y-3">
      <WidgetCard title="Servicios por categoría">
        {categoryDistribution.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin servicios en el catálogo.</p>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="relative mx-auto w-full max-w-[10rem]">
              <ChartContainer config={categoryChartConfig} className="mx-auto aspect-square h-[9.5rem]">
                <PieChart aria-label="Distribución de servicios por categoría">
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={42}
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
                <span className="text-base font-bold text-foreground">{total}</span>
                <span className="text-[0.625rem] text-muted-foreground">Total</span>
              </div>
            </div>

            <ul className="w-full space-y-2">
              {categoryDistribution.map((item) => (
                <li key={item.categoria} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <span className="truncate text-muted-foreground">{item.label}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-semibold text-foreground">{item.count}</span>
                    <span className="ml-1.5 text-muted-foreground">{item.percent}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </WidgetCard>

      <WidgetCard title="Solicitudes por servicio (30 días)">
        {requestUsage.length === 0 ? (
          <p className="text-xs text-muted-foreground">Sin solicitudes recientes.</p>
        ) : (
          <ul className="space-y-3">
            {requestUsage.map((item) => (
              <li key={item.serviceName}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate font-medium text-foreground">{item.serviceName}</span>
                  <span className="shrink-0 text-muted-foreground">{item.requests}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--admin-accent))]"
                    style={{ width: `${item.percent}%` }}
                    role="progressbar"
                    aria-valuenow={item.percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${item.serviceName}: ${item.requests} solicitudes`}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </WidgetCard>

      <WidgetCard title="Servicios con mayor demanda">
        {topDemand.length === 0 ? (
          <p className="text-xs text-muted-foreground">Aún no hay demanda registrada.</p>
        ) : (
          <ol className="space-y-2.5">
            {topDemand.map((item) => (
              <li key={item.rank} className="flex items-center gap-2.5 text-xs">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[0.625rem] font-bold text-muted-foreground">
                  {item.rank}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">{item.requests} solicitudes</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </WidgetCard>

      <div className="flex items-center justify-between px-1 text-[0.6875rem] text-muted-foreground">
        <span>Actualizado: {formatUpdatedAt(updatedAt)}</span>
        <Button
          type="button"
          variant="link"
          className="h-auto gap-1 p-0 text-[0.6875rem] text-[hsl(var(--admin-accent))]"
          onClick={handleRefresh}
        >
          <RefreshCw className="size-3" aria-hidden="true" />
          Actualizar
        </Button>
      </div>
    </div>
  );
}

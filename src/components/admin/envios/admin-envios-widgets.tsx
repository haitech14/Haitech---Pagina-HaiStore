import type { ReactNode } from 'react';
import { Cell, Pie, PieChart } from 'recharts';

import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import {
  computeDelayedOrders,
  computeEnviosStatusDistribution,
  computeEnviosZoneDistribution,
  filterShipmentsInRange,
} from '@/lib/admin-envios-utils';
import { cn } from '@/lib/utils';
import type { ShipmentRecord } from '@/types/shipping';

const statusChartConfig = {
  pending_pickup: { label: 'Preparando', color: '#38BDF8' },
  in_transit: { label: 'En ruta', color: '#3B82F6' },
  out_for_delivery: { label: 'En ruta', color: '#2563EB' },
  delivered: { label: 'Entregado', color: '#22C55E' },
  failed: { label: 'Devuelto', color: '#EF4444' },
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

interface AdminEnviosWidgetsProps {
  shipments: ShipmentRecord[];
  range: AdminDateRange;
  onRefresh: () => void;
}

export function AdminEnviosWidgets({ shipments, range, onRefresh }: AdminEnviosWidgetsProps) {
  const ranged = filterShipmentsInRange(shipments, range);
  const statusDistribution = computeEnviosStatusDistribution(ranged);
  const zoneDistribution = computeEnviosZoneDistribution(ranged);
  const delayedOrders = computeDelayedOrders(ranged);
  const total = ranged.length;

  const donutData = statusDistribution.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.status,
  }));

  return (
    <div className="space-y-3">
      <WidgetCard title="Envíos por estado">
        <div className="flex flex-col items-center gap-3">
          <div className="relative mx-auto w-full max-w-[9.5rem]">
            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-[9.5rem]">
              <PieChart aria-label="Distribución de envíos por estado">
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
              <span className="text-lg font-bold text-foreground">{total}</span>
              <span className="text-[0.65rem] text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="w-full space-y-2">
            {statusDistribution.map((item) => (
              <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
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
      </WidgetCard>

      <WidgetCard title="Entrega por zona">
        <ul className="space-y-3">
          {zoneDistribution.map((zone) => (
            <li key={zone.zoneKey}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{zone.label}</span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{zone.count}</span> / {zone.total}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[hsl(var(--admin-accent))] transition-all"
                  style={{ width: `${zone.percent}%` }}
                />
              </div>
              <p className="mt-0.5 text-[0.65rem] text-muted-foreground">{zone.percent}%</p>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Órdenes con retraso">
        {delayedOrders.length > 0 ? (
          <ol className="space-y-2.5">
            {delayedOrders.map((order, index) => (
              <li key={order.orderRef} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[0.65rem] font-bold text-muted-foreground">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{order.orderRef}</p>
                  <p className="text-muted-foreground">{order.destination}</p>
                  <p className="font-semibold text-red-600">
                    {order.delayDays} {order.delayDays === 1 ? 'día' : 'días'}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-xs text-muted-foreground">Sin retrasos en el periodo.</p>
        )}
      </WidgetCard>

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground shadow-sm">
        <span>Actualizado: hace 2 minutos</span>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[hsl(var(--admin-accent))]"
          onClick={onRefresh}
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
}

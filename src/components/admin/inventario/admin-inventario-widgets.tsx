import { useState, type ReactNode } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AlertTriangle, CircleAlert, RefreshCw, Timer } from 'lucide-react';
import { Cell, Pie, PieChart } from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ADMIN_INVENTARIO_CATEGORY_DISTRIBUTION,
  ADMIN_INVENTARIO_STOCK_ALERTS,
  ADMIN_INVENTARIO_TOP_MOVED,
  ADMIN_INVENTARIO_TOTAL,
  ADMIN_INVENTARIO_UPDATED_AT,
} from '@/data/admin-inventario-data';
import { cn } from '@/lib/utils';

const categoryChartConfig = {
  laptops: { label: 'Laptops', color: '#3B82F6' },
  accesorios: { label: 'Accesorios', color: '#8B5CF6' },
  impresoras: { label: 'Impresoras', color: '#22C55E' },
  monitores: { label: 'Monitores', color: '#F59E0B' },
  otros: { label: 'Otros', color: '#94A3B8' },
};

const alertIcons = {
  red: CircleAlert,
  orange: AlertTriangle,
  amber: Timer,
} as const;

const alertToneStyles = {
  red: 'text-red-600 bg-red-50',
  orange: 'text-amber-600 bg-amber-50',
  amber: 'text-yellow-600 bg-yellow-50',
} as const;

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
        'rounded-xl border border-border/60 bg-card p-5 shadow-sm',
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminInventarioWidgets() {
  const [movedPeriod, setMovedPeriod] = useState('month');

  const donutData = ADMIN_INVENTARIO_CATEGORY_DISTRIBUTION.map((item) => ({
    name: item.category,
    value: item.count,
    fill: item.color,
    key: item.category,
  }));

  return (
    <div className="space-y-4">
      <WidgetCard title="Distribución por categoría">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative mx-auto w-full max-w-[11rem]">
            <ChartContainer config={categoryChartConfig} className="mx-auto aspect-square h-[11rem]">
              <PieChart aria-label="Distribución de productos por categoría">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={78}
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
              <span className="text-2xl font-bold text-foreground">
                {ADMIN_INVENTARIO_TOTAL.toLocaleString('es-PE')}
              </span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {ADMIN_INVENTARIO_CATEGORY_DISTRIBUTION.map((item) => (
              <li key={item.category} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.category}</span>
                </div>
                <div className="shrink-0 text-right">
                  <span className="font-semibold text-foreground">{item.count}</span>
                  <span className="ml-2 text-xs text-muted-foreground">{item.percent}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </WidgetCard>

      <WidgetCard
        title="Alertas de stock"
        action={
          <button
            type="button"
            className="text-sm font-medium text-[hsl(var(--admin-accent))] hover:underline"
          >
            Ver todas
          </button>
        }
      >
        <ul className="space-y-3">
          {ADMIN_INVENTARIO_STOCK_ALERTS.map((alert) => {
            const Icon = alertIcons[alert.tone];
            return (
              <li key={alert.key} className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-lg',
                    alertToneStyles[alert.tone],
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{alert.label}</p>
                  <p className="text-xs text-muted-foreground">{alert.count} productos</p>
                </div>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      <WidgetCard
        title="Productos más movidos"
        action={
          <Select value={movedPeriod} onValueChange={setMovedPeriod}>
            <SelectTrigger className="h-8 w-[7.5rem] bg-background text-xs" aria-label="Periodo">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
        }
      >
        <ol className="space-y-3">
          {ADMIN_INVENTARIO_TOP_MOVED.map((product) => (
            <li key={product.rank} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {product.rank}
              </span>
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold text-white"
                style={{ backgroundColor: product.imageColor }}
                aria-hidden="true"
              >
                {product.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.movements} movimientos</p>
              </div>
            </li>
          ))}
        </ol>
      </WidgetCard>

      <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Actualizado: {format(ADMIN_INVENTARIO_UPDATED_AT, 'dd/MM/yyyy HH:mm', { locale: es })}
      </p>
    </div>
  );
}

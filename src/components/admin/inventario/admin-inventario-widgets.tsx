import { useMemo, useState, type ReactNode } from 'react';
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
  buildInventarioCategoryDistribution,
  buildInventarioStockAlerts,
  buildInventarioTopMoved,
} from '@/lib/admin-inventario-products';
import { cn } from '@/lib/utils';
import type { InventoryProduct } from '@/types/product';

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

interface AdminInventarioWidgetsProps {
  products: InventoryProduct[];
  isLoading?: boolean;
  updatedAt?: Date;
  layout?: 'default' | 'sidebar';
  className?: string;
}

export function AdminInventarioWidgets({
  products,
  isLoading = false,
  updatedAt,
  layout = 'default',
  className,
}: AdminInventarioWidgetsProps) {
  const [movedPeriod, setMovedPeriod] = useState('month');

  const categoryDistribution = useMemo(
    () => buildInventarioCategoryDistribution(products),
    [products],
  );
  const stockAlerts = useMemo(() => buildInventarioStockAlerts(products), [products]);
  const topMoved = useMemo(() => buildInventarioTopMoved(products), [products]);

  const categoryChartConfig = useMemo(() => {
    const config: Record<string, { label: string; color: string }> = {};
    for (const item of categoryDistribution) {
      const key = item.category.toLowerCase().replace(/\s+/g, '-');
      config[key] = { label: item.category, color: item.color };
    }
    return config;
  }, [categoryDistribution]);

  const donutData = categoryDistribution.map((item) => ({
    name: item.category,
    value: item.count,
    fill: item.color,
    key: item.category,
  }));

  const totalProducts = products.length;
  const syncLabel = updatedAt
    ? format(updatedAt, 'dd/MM/yyyy HH:mm', { locale: es })
    : '—';

  const isSidebar = layout === 'sidebar';

  return (
    <div className={cn('space-y-3', isSidebar && 'space-y-2.5', className)}>
      <WidgetCard title="Distribución por categoría">
        {isLoading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">Cargando…</p>
        ) : categoryDistribution.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Sin productos en el catálogo.
          </p>
        ) : (
          <div
            className={cn(
              'flex flex-col items-center gap-4',
              !isSidebar && 'sm:flex-row sm:items-center',
            )}
          >
            <div className={cn('relative mx-auto w-full', isSidebar ? 'max-w-[9rem]' : 'max-w-[11rem]')}>
              <ChartContainer
                config={categoryChartConfig}
                className={cn(
                  'mx-auto aspect-square',
                  isSidebar ? 'h-[9rem]' : 'h-[11rem]',
                )}
              >
                <PieChart aria-label="Distribución de productos por categoría">
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={isSidebar ? 40 : 52}
                    outerRadius={isSidebar ? 62 : 78}
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
                <span className="text-lg font-bold text-foreground">
                  {totalProducts.toLocaleString('es-PE')}
                </span>
                <span className="text-xs text-muted-foreground">Total</span>
              </div>
            </div>

            <ul className={cn('min-w-0 w-full space-y-2', isSidebar ? 'space-y-1.5' : 'flex-1 space-y-2.5')}>
              {categoryDistribution.map((item) => (
                <li
                  key={item.category}
                  className={cn(
                    'flex items-center justify-between gap-2',
                    isSidebar ? 'text-xs' : 'gap-3 text-sm',
                  )}
                >
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
        )}
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
          {stockAlerts.map((alert) => {
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
                  <Icon className="size-3.5" />
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
        title="Más visitados en web"
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
        {topMoved.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Aún no hay visitas registradas.
          </p>
        ) : (
          <ol className="space-y-3">
            {topMoved.map((product) => (
              <li key={product.rank} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {product.rank}
                </span>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="size-9 shrink-0 rounded-md object-cover"
                  />
                ) : (
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-md text-[0.625rem] font-bold text-white"
                    style={{ backgroundColor: product.imageColor }}
                    aria-hidden="true"
                  >
                    {product.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.movements} visitas</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </WidgetCard>

      <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <RefreshCw className="size-3.5" aria-hidden="true" />
        Sincronizado: {syncLabel}
      </p>
    </div>
  );
}

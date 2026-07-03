import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';

import type { AdminDateRange } from '@/components/admin/AdminDateRangePicker';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  computePaymentDistribution,
  computeSalesSeries,
  computeStatusDistribution,
  filterOrdersInRange,
} from '@/lib/admin-pedidos-utils';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';
import type { StoreOrder } from '@/types/store';

const statusChartConfig = {
  pendiente: { label: 'Pendiente', color: '#3B82F6' },
  en_proceso: { label: 'En proceso', color: '#F59E0B' },
  entregado: { label: 'Entregado', color: '#22C55E' },
  cancelado: { label: 'Cancelado', color: '#94A3B8' },
};

const salesChartConfig = {
  value: { label: 'Ventas', color: 'hsl(var(--admin-accent))' },
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
      className={cn('rounded-xl border border-border/60 bg-card p-5 shadow-sm', className)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

interface AdminPedidosWidgetsProps {
  orders: StoreOrder[];
  range: AdminDateRange;
}

export function AdminPedidosWidgets({ orders, range }: AdminPedidosWidgetsProps) {
  const rangedOrders = filterOrdersInRange(orders, range);
  const statusDistribution = computeStatusDistribution(rangedOrders);
  const paymentDistribution = computePaymentDistribution(rangedOrders);
  const salesSeries = computeSalesSeries(orders, range);
  const total = rangedOrders.length;

  const paidCount = rangedOrders.filter((order) => order.payment_status === 'paid').length;
  const paidPercent = total > 0 ? Math.round((paidCount / total) * 1000) / 10 : 0;

  const donutData = statusDistribution.map((item) => ({
    name: item.label,
    value: item.count,
    fill: item.color,
    key: item.status,
  }));

  return (
    <div className="space-y-4">
      <WidgetCard title="Distribución por estado">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative mx-auto w-full max-w-[11rem]">
            <ChartContainer config={statusChartConfig} className="mx-auto aspect-square h-[11rem]">
              <PieChart aria-label="Distribución de pedidos por estado">
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
              <span className="text-2xl font-bold text-foreground">{total}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2.5">
            {statusDistribution.map((item) => (
              <li key={item.status} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                    aria-hidden="true"
                  />
                  <span className="truncate text-muted-foreground">{item.label}</span>
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

      <WidgetCard title="Estado de pago">
        <ul className="space-y-4">
          {paymentDistribution.map((item) => (
            <li key={item.paymentStatus}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.count}</span>{' '}
                  <span className="text-xs">({item.percent}%)</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard
        title="Ventas del periodo"
        action={
          <span className="text-lg font-bold text-[hsl(var(--admin-accent))]">{paidPercent}%</span>
        }
      >
        {salesSeries.length > 0 ? (
          <ChartContainer config={salesChartConfig} className="h-[10.5rem] w-full">
            <AreaChart data={salesSeries} aria-label="Evolución de ventas en el periodo">
              <defs>
                <linearGradient id="pedidosSalesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--admin-accent))" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="hsl(var(--admin-accent))" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--admin-accent))"
                strokeWidth={2}
                fill="url(#pedidosSalesFill)"
                dot={false}
                name="value"
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <p className="text-sm text-muted-foreground">Sin ventas en el periodo seleccionado.</p>
        )}

        <Link
          to={ADMIN_ROUTES.REPORTS}
          className="mt-3 inline-flex text-sm font-medium text-[hsl(var(--admin-accent))] hover:underline"
        >
          Ver reporte completo
        </Link>
      </WidgetCard>
    </div>
  );
}

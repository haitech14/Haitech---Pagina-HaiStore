import { type ReactNode } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BadgeCheck,
  Package,
  RefreshCw,
  Tags,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminOrderStatusBadge } from '@/components/admin/AdminOrderStatusBadge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import {
  useAdminDashboardKpis,
  useAdminLowStockProducts,
  useAdminProductsQuery,
  useAdminRecentOrders,
  useAdminSalesTimeSeries,
} from '@/hooks/use-admin-dashboard';
import { inventoryCategoryLeafLabel } from '@/lib/inventory-stock-status';
import { cn } from '@/lib/utils';

const salesChartConfig = {
  sales: { label: 'Ventas', color: 'hsl(var(--admin-accent))' },
  average: { label: 'Promedio anterior', color: '#94A3B8' },
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
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminDashboardMainColumn() {
  const { range } = useAdminDateRange();
  const salesSeries = useAdminSalesTimeSeries(range);
  const recentOrders = useAdminRecentOrders();
  const productsQuery = useAdminProductsQuery();
  const lowStock = useAdminLowStockProducts(500);
  const { kpis } = useAdminDashboardKpis(range);

  const products = productsQuery.data ?? [];
  const categories = new Set(products.map((product) => inventoryCategoryLeafLabel(product.category)));
  const brands = new Set(products.map((product) => product.brand).filter(Boolean));

  const previousAverageByDate = new Map(
    salesSeries.previous.map((point) => [point.date, point.sales]),
  );

  const chartData = salesSeries.current.map((point) => ({
    day: format(new Date(`${point.date}T12:00:00`), 'dd MMM', { locale: es }),
    sales: point.sales,
    average: previousAverageByDate.get(point.date) ?? 0,
  }));

  const catalogStats = [
    { label: 'Productos', value: String(products.length), icon: Package, tone: undefined },
    { label: 'Categorías', value: String(categories.size), icon: Tags, tone: undefined },
    { label: 'Marcas', value: String(brands.size), icon: BadgeCheck, tone: undefined },
    {
      label: 'Stock crítico',
      value: String(lowStock.products.length),
      icon: Package,
      tone: 'critical' as const,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-3">
        <WidgetCard title="Rendimiento de ventas" className="xl:col-span-2">
          {salesSeries.isLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Cargando ventas…
            </p>
          ) : salesSeries.hasData ? (
            <>
              <ChartContainer config={salesChartConfig} className="h-[10.5rem] w-full">
                <ComposedChart
                  data={chartData}
                  barCategoryGap="42%"
                  aria-label="Rendimiento de ventas"
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={6} fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} width={34} fontSize={11} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="sales"
                    fill="hsl(var(--admin-accent))"
                    radius={[3, 3, 0, 0]}
                    barSize={14}
                    name="sales"
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    name="average"
                  />
                </ComposedChart>
              </ChartContainer>
              <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">
                <span className="mr-2.5 inline-flex items-center gap-1">
                  <span className="size-1.5 rounded-sm bg-[hsl(var(--admin-accent))]" aria-hidden="true" />
                  Ventas diarias
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-0 w-2.5 border-t border-dashed border-slate-400" aria-hidden="true" />
                  Periodo anterior
                </span>
              </p>
            </>
          ) : (
            <AdminEmptyState
              title="Sin ventas en el periodo"
              description="Las ventas pagadas del rango seleccionado aparecerán aquí."
              className="border-0 bg-transparent py-6"
            />
          )}
        </WidgetCard>

        <WidgetCard title="Últimos pedidos">
          {recentOrders.isLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Cargando pedidos…
            </p>
          ) : recentOrders.orders.length === 0 ? (
            <AdminEmptyState
              title="Sin pedidos recientes"
              description="Los pedidos de la tienda aparecerán aquí cuando se registren."
              className="border-0 bg-transparent py-6"
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[15rem] text-left text-xs">
                <thead>
                  <tr className="border-b border-border/70 text-[0.6875rem] text-muted-foreground">
                    <th className="pb-1.5 pr-1.5 font-medium">Pedido</th>
                    <th className="pb-1.5 pr-1.5 font-medium">Cliente</th>
                    <th className="pb-1.5 pr-1.5 font-medium">Estado</th>
                    <th className="pb-1.5 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.orders.map((order) => (
                    <tr key={order.id} className="border-b border-border/40 last:border-0">
                      <td className="py-1.5 pr-1.5 font-medium text-foreground">{order.id}</td>
                      <td className="max-w-[6rem] truncate py-1.5 pr-1.5 text-muted-foreground">
                        {order.customer}
                      </td>
                      <td className="py-1.5 pr-1.5">
                        <AdminOrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-1.5 text-right font-medium tabular-nums text-foreground">
                        {order.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </WidgetCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <WidgetCard title="Catálogo e inventario">
          {productsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Cargando inventario…
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {catalogStats.map((stat) => {
                const Icon = stat.icon;
                const isCritical = stat.tone === 'critical';

                return (
                  <div
                    key={stat.label}
                    className={cn(
                      'rounded-md border p-2.5',
                      isCritical
                        ? 'border-red-200 bg-red-50/60'
                        : 'border-border/60 bg-muted/20',
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'flex size-6 items-center justify-center rounded-md',
                          isCritical ? 'bg-red-100 text-red-600' : 'bg-background text-muted-foreground',
                        )}
                      >
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="text-[0.6875rem] font-medium text-muted-foreground">
                        {stat.label}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'mt-1.5 text-lg font-bold tracking-tight',
                        isCritical ? 'text-red-700' : 'text-foreground',
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </WidgetCard>

        <WidgetCard title="Campañas y cupones">
          <AdminEmptyState
            title="Sin campañas activas"
            description="Las promociones y cupones aparecerán aquí cuando el módulo de marketing esté conectado."
            className="border-0 bg-transparent py-6"
          />
        </WidgetCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <WidgetCard title="Clientes y soporte">
          <div className="space-y-2.5">
            <div>
              <p className="text-[0.6875rem] font-medium text-muted-foreground">
                Clientes nuevos (periodo)
              </p>
              <p className="mt-0.5 text-lg font-bold text-foreground">
                {kpis.newCustomers.value}
              </p>
            </div>
            <AdminEmptyState
              title="Tickets de soporte"
              description="El resumen de tickets estará disponible cuando HaiSupport esté integrado."
              className="border-0 bg-transparent py-4"
            />
          </div>
        </WidgetCard>

        <WidgetCard title="Finanzas">
          <AdminEmptyState
            title="Sin datos financieros"
            description="Comprobantes y caja se mostrarán cuando el módulo contable esté conectado."
            className="border-0 bg-transparent py-6"
          />
        </WidgetCard>

        <WidgetCard title="Sistema">
          <AdminEmptyState
            title="Métricas de sistema"
            description="Usuarios, integraciones y configuración se consolidarán en una vista dedicada."
            className="border-0 bg-transparent py-6"
          />
        </WidgetCard>
      </div>
    </div>
  );
}

export function AdminDashboardUtilityColumn() {
  const { range } = useAdminDateRange();
  const { isLoading } = useAdminDashboardKpis(range);

  return (
    <aside className="space-y-3">
      <WidgetCard title="Módulos más usados">
        <AdminEmptyState
          title="Sin datos de uso"
          description="El ranking de módulos aparecerá cuando haya actividad registrada."
          className="border-0 bg-transparent py-6"
        />
      </WidgetCard>

      <WidgetCard title="Estado operativo">
        <AdminEmptyState
          title="Sin monitoreo operativo"
          description="El estado de servicios e integraciones se mostrará aquí."
          className="border-0 bg-transparent py-6"
        />
      </WidgetCard>

      <WidgetCard title="Acciones rápidas">
        <AdminEmptyState
          title="Sin acciones configuradas"
          description="Los accesos directos personalizados estarán disponibles próximamente."
          className="border-0 bg-transparent py-6"
        />
      </WidgetCard>

      <p className="flex items-center justify-end gap-1 text-[0.6875rem] text-muted-foreground">
        <RefreshCw className="size-3" aria-hidden="true" />
        {isLoading ? 'Actualizando…' : `Actualizado: ${formatDistanceToNow(new Date(), { addSuffix: true, locale: es })}`}
      </p>
    </aside>
  );
}

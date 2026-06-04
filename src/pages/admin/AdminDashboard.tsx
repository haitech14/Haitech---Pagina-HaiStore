import { Link } from 'react-router-dom';
import { LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';

import { AdminDashboardCard } from '@/components/admin/AdminDashboardCard';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminKpiCard } from '@/components/admin/AdminKpiCard';
import { AdminOrderStatusBadge } from '@/components/admin/AdminOrderStatusBadge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  useAdminDashboardKpis,
  useAdminInventoryByCategory,
  useAdminRecentOrders,
  useAdminSalesByCategory,
  useAdminSalesTimeSeries,
  useAdminTopProductsList,
} from '@/hooks/use-admin-dashboard';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { formatPenFromUsd, formatUsd } from '@/lib/utils';

const chartConfig = {
  sales: { label: 'Ventas', color: 'hsl(var(--admin-accent))' },
  previous: { label: 'Periodo anterior', color: 'hsl(var(--muted-foreground))' },
};

export function AdminDashboard() {
  const { range } = useAdminDateRange();
  const { isLoading, kpis } = useAdminDashboardKpis(range);
  const salesSeries = useAdminSalesTimeSeries(range);
  const salesByCategory = useAdminSalesByCategory(range);
  const recentOrders = useAdminRecentOrders();
  const topProducts = useAdminTopProductsList(range);
  const inventory = useAdminInventoryByCategory();

  const donutColors = ['#0066FF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminKpiCard
          title="Ventas totales"
          value={formatPenFromUsd(kpis.totalSales.value)}
          subtitle={formatUsd(kpis.totalSales.value)}
          trend={kpis.totalSales.trend}
          sparkline={kpis.totalSales.sparkline}
        />
        <AdminKpiCard
          title="Ventas"
          value={String(kpis.orders.value)}
          trend={kpis.orders.trend}
          sparkline={kpis.orders.sparkline}
        />
        <AdminKpiCard
          title="Clientes nuevos"
          value={String(kpis.newCustomers.value)}
          trend={kpis.newCustomers.trend}
          sparkline={kpis.newCustomers.sparkline}
        />
        <AdminKpiCard
          title="Tasa de conversión"
          value={kpis.conversionRate.value === null ? '—' : `${kpis.conversionRate.value}%`}
          trend={kpis.conversionRate.trend}
          {...(kpis.conversionRate.value === null
            ? { trendLabel: 'sin pedidos registrados' }
            : {})}
          sparkline={kpis.conversionRate.sparkline}
        />
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground" role="status">
          Cargando métricas…
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminDashboardCard
          title="Ventas últimos días"
          className="lg:col-span-2"
          actionLabel="Ver reporte"
          actionHref={ADMIN_ROUTES.REPORTS}
        >
          {salesSeries.hasData ? (
            <ChartContainer config={chartConfig} className="aspect-[16/9] h-[280px] w-full">
              <LineChart data={salesSeries.current} aria-label="Gráfico de ventas por día">
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="var(--color-sales)"
                  strokeWidth={2}
                  dot={false}
                  name="sales"
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  data={salesSeries.previous}
                  stroke="var(--color-previous)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="previous"
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <AdminEmptyState
              icon={<LineChartIcon className="size-5" aria-hidden="true" />}
              title="Sin datos de ventas"
              description="Conecta pedidos para ver tendencias y comparar con el periodo anterior."
            />
          )}
        </AdminDashboardCard>

        <AdminDashboardCard
          title="Ventas por categoría"
          actionLabel="Ver reporte"
          actionHref={ADMIN_ROUTES.REPORTS}
        >
          {salesByCategory.hasData ? (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[280px]">
              <PieChart aria-label="Distribución de ventas por categoría">
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  data={salesByCategory.data}
                  dataKey="amount"
                  nameKey="category"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {salesByCategory.data.map((entry, index) => (
                    <Cell key={entry.category} fill={donutColors[index % donutColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <AdminEmptyState
              icon={<PieChartIcon className="size-5" aria-hidden="true" />}
              title="Sin ventas por categoría"
              description="El gráfico se activará cuando existan pedidos pagados en Supabase."
            />
          )}
        </AdminDashboardCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminDashboardCard
          title="Ventas recientes"
          actionLabel="Ver todas"
          actionHref={ADMIN_ROUTES.VENTAS}
        >
          {recentOrders.orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-muted-foreground">
                    <th className="py-2 pr-3">ID</th>
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Estado</th>
                    <th className="py-2 pr-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.orders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3 pr-3 font-medium">{order.id}</td>
                      <td className="py-3 pr-3">{order.customer}</td>
                      <td className="py-3 pr-3">
                        <AdminOrderStatusBadge status={order.status} />
                      </td>
                      <td className="py-3 pr-3">{order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AdminEmptyState
              title="Aún no hay pedidos"
              description="Cuando se registren ventas, aparecerán aquí con su estado de seguimiento."
            />
          )}
        </AdminDashboardCard>

        <AdminDashboardCard title="Productos más vendidos">
          {topProducts.hasData ? (
            <ul className="space-y-3">
              {topProducts.products.map((product) => (
                <li key={product.name} className="flex items-center gap-3">
                  {product.image && (
                    <img
                      src={product.image}
                      alt=""
                      className="size-10 rounded-md border object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.units} uds · {product.revenue}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmptyState
              title="Sin ranking de ventas"
              description="Los productos más vendidos se mostrarán cuando haya pedidos confirmados."
            />
          )}
        </AdminDashboardCard>

        <AdminDashboardCard
          title="Estado del inventario"
          actionLabel="Ver inventario"
          actionHref={ADMIN_ROUTES.INVENTORY}
        >
          {inventory.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando inventario…</p>
          ) : inventory.data.length > 0 ? (
            <ul className="space-y-4">
              {inventory.data.map((row) => (
                <li key={row.category}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{row.category}</span>
                    <span className="text-muted-foreground">
                      {row.total} prod. · {row.lowStock} bajo stock
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={row.healthyPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${row.category}: ${row.healthyPercent}% con stock saludable`}
                  >
                    <div
                      className="h-full rounded-full bg-[hsl(var(--admin-accent))]"
                      style={{ width: `${row.healthyPercent}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <AdminEmptyState
              title="Sin productos en inventario"
              description="Agrega productos desde el módulo de inventario para ver el estado por categoría."
            />
          )}
        </AdminDashboardCard>
      </div>

      <p className="text-xs text-muted-foreground">
        Productos en catálogo: {kpis.productCount}.{' '}
        <Link to={ADMIN_ROUTES.INVENTORY} className="font-medium text-[hsl(var(--admin-accent))] hover:underline">
          Gestionar inventario
        </Link>
      </p>
    </div>
  );
}

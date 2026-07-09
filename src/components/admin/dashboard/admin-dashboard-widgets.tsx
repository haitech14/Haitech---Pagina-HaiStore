import { type ReactNode } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BadgeCheck,
  FileText,
  Megaphone,
  Package,
  RefreshCw,
  ShoppingCart,
  Tags,
  UserPlus,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import {
  ADMIN_DASHBOARD_CAMPAIGNS,
  ADMIN_DASHBOARD_CATALOG_STATS,
  ADMIN_DASHBOARD_FINANCE_SUMMARY,
  ADMIN_DASHBOARD_MODULE_USAGE,
  ADMIN_DASHBOARD_OPERATIONAL_STATUS,
  ADMIN_DASHBOARD_QUICK_ACTIONS,
  ADMIN_DASHBOARD_RECENT_ORDERS,
  ADMIN_DASHBOARD_SALES_PERFORMANCE,
  ADMIN_DASHBOARD_SUPPORT_SUMMARY,
  ADMIN_DASHBOARD_SYSTEM_SUMMARY,
  ADMIN_DASHBOARD_UPDATED_AT,
  DASHBOARD_ORDER_STATUS_LABELS,
  DASHBOARD_ORDER_STATUS_STYLES,
} from '@/data/admin-dashboard-data';
import { cn } from '@/lib/utils';

const salesChartConfig = {
  sales: { label: 'Ventas', color: 'hsl(var(--admin-accent))' },
  average: { label: 'Promedio anterior', color: '#94A3B8' },
};

const catalogIconMap = {
  products: Package,
  categories: Tags,
  brands: BadgeCheck,
  critical: Package,
} as const;

const quickActionIcons = {
  package: Package,
  megaphone: Megaphone,
  'shopping-cart': ShoppingCart,
  'user-plus': UserPlus,
  'file-text': FileText,
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
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function AdminDashboardMainColumn() {
  const ticketTotal = ADMIN_DASHBOARD_SUPPORT_SUMMARY.ticketBreakdown.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 xl:grid-cols-3">
        <WidgetCard title="Rendimiento de ventas" className="xl:col-span-2">
          <ChartContainer config={salesChartConfig} className="h-[10.5rem] w-full">
            <ComposedChart
              data={ADMIN_DASHBOARD_SALES_PERFORMANCE}
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
              Promedio anterior
            </span>
          </p>
        </WidgetCard>

        <WidgetCard title="Últimos pedidos">
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
                {ADMIN_DASHBOARD_RECENT_ORDERS.map((order) => (
                  <tr key={order.id} className="border-b border-border/40 last:border-0">
                    <td className="py-1.5 pr-1.5 font-medium text-foreground">{order.id}</td>
                    <td className="max-w-[6rem] truncate py-1.5 pr-1.5 text-muted-foreground">
                      {order.customer}
                    </td>
                    <td className="py-1.5 pr-1.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold ring-1 ring-inset',
                          DASHBOARD_ORDER_STATUS_STYLES[order.status],
                        )}
                      >
                        {DASHBOARD_ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="py-1.5 text-right font-medium tabular-nums text-foreground">
                      {order.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WidgetCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <WidgetCard title="Catálogo e inventario">
          <div className="grid grid-cols-2 gap-2">
            {ADMIN_DASHBOARD_CATALOG_STATS.map((stat) => {
              const Icon = catalogIconMap[stat.icon];
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
        </WidgetCard>

        <WidgetCard title="Campañas y cupones">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[17rem] text-left text-xs">
              <thead>
                <tr className="border-b border-border/70 text-[0.6875rem] text-muted-foreground">
                  <th className="pb-1.5 pr-1.5 font-medium">Campaña</th>
                  <th className="pb-1.5 pr-1.5 font-medium">Tipo</th>
                  <th className="pb-1.5 pr-1.5 font-medium">Estado</th>
                  <th className="pb-1.5 pr-1.5 font-medium">Uso</th>
                  <th className="pb-1.5 font-medium">Fin</th>
                </tr>
              </thead>
              <tbody>
                {ADMIN_DASHBOARD_CAMPAIGNS.map((campaign) => (
                  <tr key={campaign.name} className="border-b border-border/40 last:border-0">
                    <td className="py-1.5 pr-1.5 font-medium text-foreground">{campaign.name}</td>
                    <td className="py-1.5 pr-1.5 text-muted-foreground">{campaign.type}</td>
                    <td className="py-1.5 pr-1.5">
                      <span
                        className={cn(
                          'inline-flex rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold',
                          campaign.status === 'activa'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {campaign.status === 'activa' ? 'Activa' : 'Programada'}
                      </span>
                    </td>
                    <td className="py-1.5 pr-1.5 tabular-nums text-muted-foreground">
                      {campaign.usage}
                    </td>
                    <td className="py-1.5 text-muted-foreground">{campaign.endsAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </WidgetCard>
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <WidgetCard title="Clientes y soporte">
          <div className="space-y-2.5">
            <div>
              <p className="text-[0.6875rem] font-medium text-muted-foreground">
                Clientes nuevos (30 días)
              </p>
              <p className="mt-0.5 text-lg font-bold text-foreground">
                {ADMIN_DASHBOARD_SUPPORT_SUMMARY.newClients}
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[0.6875rem] font-medium text-muted-foreground">Tickets abiertos</p>
                <span className="text-xs font-bold text-foreground">
                  {ADMIN_DASHBOARD_SUPPORT_SUMMARY.openTickets}
                </span>
              </div>
              <div className="mt-1.5 flex h-1.5 overflow-hidden rounded-full bg-muted">
                {ADMIN_DASHBOARD_SUPPORT_SUMMARY.ticketBreakdown.map((segment) => (
                  <span
                    key={segment.label}
                    className="h-full"
                    style={{
                      width: `${(segment.count / ticketTotal) * 100}%`,
                      backgroundColor: segment.color,
                    }}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <ul className="mt-1.5 flex flex-wrap gap-x-2.5 gap-y-0.5 text-[0.625rem] text-muted-foreground">
                {ADMIN_DASHBOARD_SUPPORT_SUMMARY.ticketBreakdown.map((segment) => (
                  <li key={segment.label}>
                    {segment.label}: {segment.count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Finanzas">
          <div className="space-y-2.5">
            <div>
              <p className="text-[0.6875rem] font-medium text-muted-foreground">Comprobantes (mes)</p>
              <p className="mt-0.5 text-lg font-bold text-foreground">
                {ADMIN_DASHBOARD_FINANCE_SUMMARY.invoicesThisMonth}
              </p>
            </div>
            <div>
              <p className="text-[0.6875rem] font-medium text-muted-foreground">Caja y bancos</p>
              <p className="mt-0.5 text-lg font-bold text-foreground">
                {ADMIN_DASHBOARD_FINANCE_SUMMARY.cashBalance}
              </p>
            </div>
          </div>
        </WidgetCard>

        <WidgetCard title="Sistema">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-[0.625rem] text-muted-foreground">Usuarios</p>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {ADMIN_DASHBOARD_SYSTEM_SUMMARY.users}
              </p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-[0.625rem] text-muted-foreground">Integraciones</p>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {ADMIN_DASHBOARD_SYSTEM_SUMMARY.integrations}
              </p>
            </div>
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-[0.625rem] text-muted-foreground">Config.</p>
              <p className="mt-0.5 text-base font-bold text-foreground">
                {ADMIN_DASHBOARD_SYSTEM_SUMMARY.configurationPercent}%
              </p>
            </div>
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

export function AdminDashboardUtilityColumn() {
  return (
    <aside className="space-y-3">
      <WidgetCard title="Módulos más usados">
        <ul className="space-y-2">
          {ADMIN_DASHBOARD_MODULE_USAGE.map((module) => (
            <li key={module.label}>
              <div className="mb-0.5 flex items-center justify-between text-xs">
                <span className="text-foreground">{module.label}</span>
                <span className="font-semibold tabular-nums text-muted-foreground">
                  {module.percent}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-[hsl(var(--admin-accent))]"
                  style={{ width: `${module.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Estado operativo">
        <ul className="space-y-1.5">
          {ADMIN_DASHBOARD_OPERATIONAL_STATUS.map((item) => (
            <li key={item.label} className="flex items-center justify-between gap-2 text-xs">
              <span className="text-foreground">{item.label}</span>
              <span className="inline-flex items-center gap-1 text-[0.6875rem] font-medium">
                <span
                  className={cn(
                    'size-1.5 rounded-full',
                    item.status === 'operativo' ? 'bg-emerald-500' : 'bg-amber-500',
                  )}
                  aria-hidden="true"
                />
                {item.status === 'operativo' ? 'Operativo' : 'Advertencia'}
              </span>
            </li>
          ))}
        </ul>
      </WidgetCard>

      <WidgetCard title="Acciones rápidas">
        <ul className="space-y-0.5">
          {ADMIN_DASHBOARD_QUICK_ACTIONS.map((action) => {
            const Icon = quickActionIcons[action.icon as keyof typeof quickActionIcons] ?? Package;
            return (
              <li key={action.label}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-muted/60"
                >
                  <Icon className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  {action.label}
                </button>
              </li>
            );
          })}
        </ul>
      </WidgetCard>

      <p className="flex items-center justify-end gap-1 text-[0.6875rem] text-muted-foreground">
        <RefreshCw className="size-3" aria-hidden="true" />
        Actualizado:{' '}
        {formatDistanceToNow(ADMIN_DASHBOARD_UPDATED_AT, { addSuffix: true, locale: es })}
      </p>
    </aside>
  );
}

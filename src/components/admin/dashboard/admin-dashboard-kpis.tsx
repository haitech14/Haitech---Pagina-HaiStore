import {
  AlertTriangle,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';

import { useAdminDateRange } from '@/context/admin-date-range-context';
import { useAdminDashboardKpis, useAdminLowStockProducts } from '@/hooks/use-admin-dashboard';
import { formatPenFromUsd } from '@/lib/utils';
import { cn } from '@/lib/utils';

const iconStyles = {
  sales: 'bg-blue-50 text-blue-600',
  orders: 'bg-emerald-50 text-emerald-600',
  'low-stock': 'bg-orange-50 text-orange-600',
  clients: 'bg-violet-50 text-violet-600',
} as const;

const sparklineColors = {
  sales: '#3B82F6',
  orders: '#22C55E',
  'low-stock': '#F97316',
  clients: '#8B5CF6',
} as const;

function formatTrend(trend: number | null) {
  if (trend === null) return '—';
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;

  const width = 72;
  const height = 24;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-6 w-[4.5rem]"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function AdminDashboardKpis() {
  const { range } = useAdminDateRange();
  const { kpis, isLoading } = useAdminDashboardKpis(range);
  const lowStock = useAdminLowStockProducts(500);

  const cards = [
    {
      title: 'Ventas del mes',
      value: formatPenFromUsd(kpis.totalSales.value),
      trend: kpis.totalSales.trend,
      icon: Wallet,
      iconKey: 'sales' as const,
      sparkline: kpis.totalSales.sparkline.map((point) => point.value),
    },
    {
      title: 'Pedidos activos',
      value: String(kpis.orders.value),
      trend: kpis.orders.trend,
      icon: ShoppingBag,
      iconKey: 'orders' as const,
      sparkline: kpis.orders.sparkline.map((point) => point.value),
    },
    {
      title: 'Productos con stock bajo',
      value: String(lowStock.products.length),
      trend: null,
      icon: AlertTriangle,
      iconKey: 'low-stock' as const,
      sparkline: [lowStock.products.length],
    },
    {
      title: 'Clientes nuevos',
      value: String(kpis.newCustomers.value),
      trend: kpis.newCustomers.trend,
      icon: UserPlus,
      iconKey: 'clients' as const,
      sparkline: kpis.newCustomers.sparkline.map((point) => point.value),
    },
  ];

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Cargando métricas del dashboard…
      </p>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((kpi) => {
        const Icon = kpi.icon;
        const trendPositive = kpi.trend === null || kpi.trend >= 0;

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-xl font-bold leading-none tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  iconStyles[kpi.iconKey],
                )}
                aria-hidden="true"
              >
                <Icon className="size-3.5" />
              </span>
            </div>

            <div className="mt-2.5 flex items-end justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1">
                {kpi.trend === null ? null : trendPositive ? (
                  <TrendingUp className="size-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-3.5 shrink-0 text-red-600" aria-hidden="true" />
                )}
                <span
                  className={cn(
                    'text-xs font-semibold',
                    kpi.trend === null
                      ? 'text-muted-foreground'
                      : trendPositive
                        ? 'text-emerald-600'
                        : 'text-red-600',
                  )}
                >
                  {formatTrend(kpi.trend)}
                </span>
                <span className="truncate text-[0.6875rem] text-muted-foreground">
                  vs. periodo anterior
                </span>
              </div>
              <Sparkline values={kpi.sparkline} color={sparklineColors[kpi.iconKey]} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

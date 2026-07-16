import { FileText, Gauge, ShoppingBag, TrendingDown, TrendingUp, Users } from 'lucide-react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { calcTrendPercent, isDateInRange } from '@/components/admin/AdminDateRangePicker';
import { getPreviousPeriod } from '@/lib/admin-date-range-presets';
import { useAdminDateRange } from '@/context/admin-date-range-context';
import { useAdminProformas } from '@/hooks/use-admin-proformas';
import {
  useAdminDashboardKpis,
  useAdminProductsQuery,
} from '@/hooks/use-admin-dashboard';
import { cn } from '@/lib/utils';
import type { AdminResumenKpi } from '@/types/admin-resumen';

const iconMap = {
  users: Users,
  sales: ShoppingBag,
  orders: FileText,
  sla: Gauge,
} as const;

const iconStyles = {
  users: 'bg-violet-50 text-violet-600',
  sales: 'bg-emerald-50 text-emerald-600',
  orders: 'bg-blue-50 text-blue-600',
  sla: 'bg-amber-50 text-amber-600',
} as const;

function formatTrend(trend: number | null) {
  if (trend === null) return '—';
  const sign = trend > 0 ? '+' : '';
  return `${sign}${trend.toFixed(1)}%`;
}

export function AdminResumenKpis() {
  const { range } = useAdminDateRange();
  const previous = getPreviousPeriod(range);
  const { data: proformas = [], isLoading: proformasLoading } = useAdminProformas();
  const { kpis, isLoading: dashboardLoading } = useAdminDashboardKpis(range);
  const productsQuery = useAdminProductsQuery();

  const proformasInRange = proformas.filter((proforma) =>
    isDateInRange(proforma.createdAt, range),
  );
  const proformasPrev = proformas.filter((proforma) =>
    isDateInRange(proforma.createdAt, previous),
  );

  const products = productsQuery.data ?? [];
  const productsReviewed = products.reduce((sum, product) => sum + (product.view_count ?? 0), 0);

  const isLoading = proformasLoading || dashboardLoading || productsQuery.isLoading;

  const liveKpis: AdminResumenKpi[] = [
    {
      title: 'Cotizaciones solicitadas',
      value: String(proformasInRange.length),
      trend: calcTrendPercent(proformasInRange.length, proformasPrev.length) ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'orders',
    },
    {
      title: 'Visitantes únicos',
      value: '—',
      trend: 0,
      trendLabel: 'sin tracking aún',
      icon: 'users',
    },
    {
      title: 'Cuentas creadas',
      value: String(kpis.newCustomers.value),
      trend: kpis.newCustomers.trend ?? 0,
      trendLabel: 'vs. periodo anterior',
      icon: 'sales',
    },
    {
      title: 'Productos revisados',
      value: String(productsReviewed),
      trend: 0,
      trendLabel: 'vistas acumuladas',
      icon: 'sla',
    },
  ];

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Cargando métricas del resumen…
      </p>
    );
  }

  const hasAnyData =
    proformasInRange.length > 0 ||
    kpis.newCustomers.value > 0 ||
    productsReviewed > 0;

  if (!hasAnyData) {
    return (
      <AdminEmptyState
        title="Sin métricas disponibles"
        description="Los indicadores del resumen aparecerán cuando haya cotizaciones, cuentas o actividad en el catálogo."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {liveKpis.map((kpi) => {
        const Icon = iconMap[kpi.icon];
        const trendValue = kpi.title === 'Productos revisados' || kpi.title === 'Visitantes únicos'
          ? null
          : kpi.trend;
        const trendPositive = trendValue === null || trendValue >= 0;

        return (
          <article
            key={kpi.title}
            className="rounded-lg border border-border/60 bg-card p-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-lg font-bold tracking-tight text-foreground">
                  {kpi.value}
                </p>
              </div>
              <span
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-lg',
                  iconStyles[kpi.icon],
                )}
                aria-hidden="true"
              >
                <Icon className="size-3.5" />
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1">
              {trendValue === null ? null : trendPositive ? (
                <TrendingUp className="size-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <TrendingDown className="size-3.5 text-red-600" aria-hidden="true" />
              )}
              <span
                className={cn(
                  'text-xs font-semibold',
                  trendValue === null
                    ? 'text-muted-foreground'
                    : trendPositive
                      ? 'text-emerald-600'
                      : 'text-red-600',
                )}
              >
                {formatTrend(trendValue)}
              </span>
              <span className="text-[0.6875rem] text-muted-foreground">{kpi.trendLabel}</span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

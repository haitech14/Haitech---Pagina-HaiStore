import { Link } from 'react-router-dom';

import {
  AdminResumenQuotesPanel,
  AdminResumenVisitorsPanel,
} from '@/components/admin/resumen/admin-resumen-engagement-panels';
import { AdminResumenKpis } from '@/components/admin/resumen/admin-resumen-kpis';
import { AdminResumenPageHeader } from '@/components/admin/resumen/admin-resumen-page-header';
import { AdminResumenTablePanel } from '@/components/admin/resumen/admin-resumen-table-panel';
import { AdminResumenWidgets } from '@/components/admin/resumen/admin-resumen-widgets';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

const RESUMEN_VISTAS = [
  { id: 'general', label: 'Resumen' },
  { id: 'cotizaciones', label: 'Cotizaciones' },
  { id: 'visitantes', label: 'Visitantes' },
  { id: 'reportes', label: 'Reportes' },
  { id: 'estadisticas', label: 'Estadísticas' },
] as const;

type ResumenVista = (typeof RESUMEN_VISTAS)[number]['id'] | 'reseñas';

function normalizeVista(vista: string): ResumenVista {
  if (vista === 'reportes' || vista === 'estadisticas' || vista === 'estadísticas') {
    return vista === 'estadísticas' ? 'estadisticas' : vista;
  }
  if (vista === 'cotizaciones') return 'cotizaciones';
  if (vista === 'visitantes') return 'visitantes';
  if (vista === 'reseñas' || vista === 'resenas') return 'reseñas';
  return 'general';
}

interface AdminResumenDashboardProps {
  vista?: string;
}

export function AdminResumenDashboard({ vista = 'general' }: AdminResumenDashboardProps) {
  const activeVista = normalizeVista(vista);

  return (
    <div className="space-y-3">
      <AdminResumenPageHeader vista={activeVista === 'reseñas' ? 'reseñas' : activeVista} />

      {activeVista !== 'reseñas' ? (
        <nav
          className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-card p-1"
          aria-label="Vistas de resumen"
        >
          {RESUMEN_VISTAS.map((item) => {
            const isActive = activeVista === item.id;
            return (
              <Link
                key={item.id}
                to={
                  item.id === 'general'
                    ? ADMIN_ROUTES.RESUMEN
                    : `${ADMIN_ROUTES.RESUMEN}?vista=${item.id}`
                }
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--admin-accent))] text-white'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {activeVista === 'general' ? (
        <>
          <AdminResumenKpis />
          <div className="space-y-3">
            <AdminResumenQuotesPanel />
            <AdminResumenVisitorsPanel />
          </div>
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem] 2xl:grid-cols-[minmax(0,1fr)_17rem]">
            <AdminResumenTablePanel />
            <AdminResumenWidgets />
          </div>
        </>
      ) : null}

      {activeVista === 'cotizaciones' ? <AdminResumenQuotesPanel /> : null}

      {activeVista === 'visitantes' ? <AdminResumenVisitorsPanel /> : null}

      {activeVista === 'reportes' ? (
        <AdminEmptyState
          title="Reportes operativos"
          description="Los reportes detallados de ventas, inventario y soporte se consolidan aquí dentro del panel Resumen."
        />
      ) : null}

      {activeVista === 'estadisticas' ? (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_16rem]">
          <AdminResumenWidgets />
          <AdminEmptyState
            title="Estadísticas avanzadas"
            description="Las métricas históricas aparecerán cuando haya datos de operación en Supabase."
            className="h-full"
          />
        </div>
      ) : null}

      {activeVista === 'reseñas' ? (
        <AdminEmptyState
          title="Reseñas de clientes"
          description="El módulo de reseñas estará disponible cuando se conecte el catálogo con valoraciones verificadas."
        />
      ) : null}
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';

import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import {
  ADMIN_RESUMEN_PRIORITY_DISTRIBUTION,
  ADMIN_RESUMEN_STATUS_DISTRIBUTION,
} from '@/data/admin-resumen-data';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import { cn } from '@/lib/utils';

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

export function AdminResumenWidgets() {
  const hasStatusData = ADMIN_RESUMEN_STATUS_DISTRIBUTION.length > 0;
  const hasPriorityData = ADMIN_RESUMEN_PRIORITY_DISTRIBUTION.length > 0;

  return (
    <div className="space-y-3">
      <WidgetCard title="Distribución por estado">
        {hasStatusData ? null : (
          <AdminEmptyState
            title="Sin registros por estado"
            description="La distribución aparecerá cuando haya solicitudes registradas."
            className="border-0 bg-transparent py-6"
          />
        )}
      </WidgetCard>

      <WidgetCard title="Prioridad">
        {hasPriorityData ? null : (
          <AdminEmptyState
            title="Sin datos de prioridad"
            description="La distribución por prioridad se mostrará con registros reales."
            className="border-0 bg-transparent py-6"
          />
        )}
      </WidgetCard>

      <WidgetCard title="Rendimiento por área (SLA)">
        <AdminEmptyState
          title="Sin métricas de SLA"
          description="El rendimiento por área estará disponible cuando haya datos de soporte."
          className="border-0 bg-transparent py-6"
        />
        <Link
          to={ADMIN_ROUTES.REPORTS}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[hsl(var(--admin-accent))] hover:underline"
        >
          Ver reporte completo
          <span aria-hidden="true">→</span>
        </Link>
      </WidgetCard>
    </div>
  );
}

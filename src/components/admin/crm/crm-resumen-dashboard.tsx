import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useCrmPipeline } from '@/context/crm-pipeline-context';
import { formatResumenPenAmount } from '@/lib/crm-lead-form';
import {
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Clock,
  MessageCircle,
  MessageCircleMore,
  Trophy,
  UserRound,
  Users,
  X,
} from 'lucide-react';

import { CrmMetricCard } from '@/components/admin/crm/crm-metric-card';
import { Button } from '@/components/ui/button';
import { ADMIN_ROUTES } from '@/lib/admin-routes';
import {
  CRM_RESUMEN_PERIODS,
  crmResumenPeriodFooter,
  type CrmResumenPeriod,
} from '@/lib/crm-resumen-period';
import { cn } from '@/lib/utils';

function LeadSourcesChart() {
  const rings = [
    { size: 180, stroke: 'hsl(210 70% 55%)', opacity: 0.35 },
    { size: 140, stroke: 'hsl(175 55% 45%)', opacity: 0.4 },
    { size: 100, stroke: 'hsl(45 90% 55%)', opacity: 0.45 },
    { size: 60, stroke: 'hsl(270 45% 70%)', opacity: 0.5 },
  ];

  return (
    <div
      className="relative mx-auto flex size-44 items-center justify-center sm:size-48"
      aria-hidden="true"
    >
      {rings.map((ring) => (
        <span
          key={ring.size}
          className="absolute rounded-full border-2"
          style={{
            width: ring.size,
            height: ring.size,
            borderColor: ring.stroke,
            opacity: ring.opacity,
          }}
        />
      ))}
    </div>
  );
}

export function CrmResumenDashboard() {
  const { resumenMetrics, kpis } = useCrmPipeline();
  const [period, setPeriod] = useState<CrmResumenPeriod>('semana');
  const periodLabel = crmResumenPeriodFooter(period);

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex flex-wrap justify-center gap-1"
        role="group"
        aria-label="Periodo de análisis"
      >
        {CRM_RESUMEN_PERIODS.map((item) => (
          <Button
            key={item.id}
            type="button"
            size="sm"
            variant={period === item.id ? 'default' : 'ghost'}
            className={cn(
              'min-h-10',
              period === item.id &&
                'bg-[hsl(var(--admin-accent))] text-white hover:bg-[hsl(var(--admin-accent))]/90',
            )}
            onClick={() => setPeriod(item.id)}
            aria-pressed={period === item.id}
          >
            {item.id === 'fechas' ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                {item.label}
              </span>
            ) : (
              item.label
            )}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <CrmMetricCard
            title="Mensajes entrantes"
            value={0}
            periodLabel={periodLabel}
            icon={MessageCircle}
            tone="green"
            footer={
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-foreground">
                  <span
                    className="size-2.5 rounded-full bg-[hsl(var(--admin-accent))]"
                    aria-hidden="true"
                  />
                  Chats
                </span>
                <span className="font-semibold tabular-nums text-[hsl(var(--admin-accent))]">
                  0
                </span>
              </div>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-4">
          <CrmMetricCard
            title="Diálogos vigentes"
            value={0}
            periodLabel={periodLabel}
            icon={MessageCircleMore}
            tone="purple"
          />
          <CrmMetricCard
            title="Lapso medio de réplica"
            value={0}
            periodLabel={periodLabel}
            icon={Clock}
            tone="green"
          />
          <CrmMetricCard
            title="Diálogos sin réplica"
            value={0}
            periodLabel={periodLabel}
            icon={MessageCircle}
            tone="purple"
          />
          <CrmMetricCard
            title="Lapso mayor de réplica"
            value={0}
            periodLabel={periodLabel}
            icon={Clock}
            tone="purple"
          />
        </div>

        <article className="flex h-full flex-col rounded-lg border border-border/80 bg-card p-4 shadow-sm lg:col-span-4">
          <div className="flex items-start gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-100"
              aria-hidden="true"
            >
              <Users className="size-5 text-blue-600" />
            </span>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Fuentes de leads
            </h3>
          </div>
          <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 py-2 text-center">
            {kpis.totalLeads === 0 ? (
              <p className="inline-flex max-w-xs items-start gap-2 text-sm text-amber-700">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span>No hay suficientes datos para mostrar</span>
              </p>
            ) : (
              <p className="text-sm font-semibold tabular-nums text-foreground">
                {kpis.totalLeads} leads en pipeline
              </p>
            )}
            <LeadSourcesChart />
          </div>
        </article>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
          <CrmMetricCard
            title="Leads ganados"
            value={resumenMetrics.wonCount}
            secondaryValue={formatResumenPenAmount(resumenMetrics.wonValuePen)}
            periodLabel={periodLabel}
            icon={Trophy}
            tone="blue"
          />
          <CrmMetricCard
            title="Cantidad de leads perdidos"
            value={resumenMetrics.lostCount}
            secondaryValue={formatResumenPenAmount(resumenMetrics.lostValuePen)}
            periodLabel={periodLabel}
            icon={X}
            tone="red"
          />
          <CrmMetricCard
            title="Cantidad de leads activos"
            value={resumenMetrics.activeCount}
            secondaryValue={formatResumenPenAmount(resumenMetrics.activeValuePen)}
            periodLabel={periodLabel}
            icon={UserRound}
            tone="blue"
          />
          <CrmMetricCard
            title="Leads sin tareas"
            value={resumenMetrics.withoutTasksCount}
            secondaryValue={formatResumenPenAmount(resumenMetrics.withoutTasksValuePen)}
            periodLabel={periodLabel}
            icon={ClipboardList}
            tone="orange"
          />
        </div>

        <div className="lg:col-span-4">
          <CrmMetricCard
            title="Tareas"
            value={kpis.pendingTasks}
            periodLabel=""
            icon={CheckSquare}
            tone="blue"
            className="min-h-[12rem]"
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground" role="status">
        Leads activos, ganados y valor del pipeline se sincronizan con la vista{' '}
        <Link
          to={ADMIN_ROUTES.CRM_PIPELINE}
          className="font-medium text-[hsl(var(--admin-accent))] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]"
        >
          Pipeline
        </Link>
        . Los datos se guardan en este navegador.{' '}
        <Link
          to={ADMIN_ROUTES.CRM_CLIENTES}
          className="font-medium text-[hsl(var(--admin-accent))] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--admin-accent))]"
        >
          Ver clientes
        </Link>
      </p>
    </div>
  );
}

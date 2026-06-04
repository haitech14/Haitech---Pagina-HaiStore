import type { ReactNode } from 'react';
import {
  Calendar,
  DollarSign,
  ClipboardList,
  TrendingUp,
  Users,
} from 'lucide-react';

import { formatPipelinePen } from '@/lib/crm-pipeline-utils';
import type { CrmPipelineKpis } from '@/types/crm-pipeline';
import { cn } from '@/lib/utils';

interface CrmPipelineKpiRowProps {
  kpis: CrmPipelineKpis;
}

interface KpiCardProps {
  title: string;
  value: string;
  sublabel?: string;
  sublabelClass?: string;
  icon: ReactNode;
  iconWrapClass: string;
  footer?: ReactNode;
}

function KpiCard({
  title,
  value,
  sublabel,
  sublabelClass,
  icon,
  iconWrapClass,
  footer,
}: KpiCardProps) {
  return (
    <article className="flex min-w-[9rem] flex-1 flex-col rounded-md border border-border/80 bg-card px-2.5 py-2 shadow-sm">
      <div className="flex items-start justify-between gap-1.5">
        <div className="min-w-0">
          <p className="text-[0.65rem] font-medium leading-none text-muted-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-lg font-bold leading-tight tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {sublabel != null && (
            <p className={cn('mt-0.5 text-[0.65rem] font-medium leading-none', sublabelClass)}>
              {sublabel}
            </p>
          )}
        </div>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md',
            iconWrapClass,
          )}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>
      {footer != null && <div className="mt-1.5">{footer}</div>}
    </article>
  );
}

export function CrmPipelineKpiRow({ kpis }: CrmPipelineKpiRowProps) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="region"
      aria-label="Indicadores del pipeline"
    >
      <KpiCard
        title="Total de leads"
        value={String(kpis.totalLeads)}
        sublabel={`${kpis.openLeads} abiertos`}
        sublabelClass="text-violet-600"
        icon={<Users className="size-4 text-violet-600" />}
        iconWrapClass="bg-violet-100"
      />
      <KpiCard
        title="Valor del pipeline"
        value={formatPipelinePen(kpis.pipelineValuePen)}
        icon={<DollarSign className="size-4 text-emerald-600" />}
        iconWrapClass="bg-emerald-100"
      />
      <KpiCard
        title="Tareas pendientes"
        value={String(kpis.pendingTasks)}
        icon={<ClipboardList className="size-4 text-amber-700" />}
        iconWrapClass="bg-amber-100"
      />
      <KpiCard
        title="Seguimientos hoy"
        value={String(kpis.followUpsToday)}
        icon={<Calendar className="size-4 text-blue-600" />}
        iconWrapClass="bg-blue-100"
      />
      <KpiCard
        title="Conversión global"
        value={`${kpis.conversionPercent}%`}
        icon={<TrendingUp className="size-4 text-violet-600" />}
        iconWrapClass="bg-violet-100"
        footer={
          <div
            className="h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={kpis.conversionPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Conversión global"
          >
            <div
              className="h-full rounded-full bg-violet-500 transition-[width]"
              style={{ width: `${kpis.conversionPercent}%` }}
            />
          </div>
        }
      />
    </div>
  );
}

import type { CrmPipelineStage } from '@/types/crm-pipeline';

/** Etapas del embudo CRM (sin datos de muestra). */
export const CRM_PIPELINE_STAGES: CrmPipelineStage[] = [
  {
    id: 'leads',
    label: 'LEADS',
    accentClass: 'bg-violet-500',
    borderClass: 'border-violet-500',
  },
  {
    id: 'contactado',
    label: 'Contactado',
    accentClass: 'bg-blue-500',
    borderClass: 'border-blue-500',
  },
  {
    id: 'cotizacion',
    label: 'Cotizacion',
    accentClass: 'bg-teal-500',
    borderClass: 'border-teal-500',
  },
  {
    id: 'seguimiento',
    label: 'Seguimiento',
    accentClass: 'bg-orange-500',
    borderClass: 'border-orange-500',
  },
  {
    id: 'por_pagar',
    label: 'Por pagar',
    accentClass: 'bg-amber-500',
    borderClass: 'border-amber-500',
  },
  {
    id: 'por_enviar',
    label: 'Por enviar',
    accentClass: 'bg-emerald-600',
    borderClass: 'border-emerald-600',
  },
  {
    id: 'venta_completada',
    label: 'Venta completada',
    accentClass: 'bg-indigo-500',
    borderClass: 'border-indigo-500',
  },
];

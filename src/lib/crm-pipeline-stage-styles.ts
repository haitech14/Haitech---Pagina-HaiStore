import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import { leadAmountsInBothCurrencies } from '@/lib/crm-pipeline-utils';
import type { CrmLeadPriority, CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

export const CRM_PIPELINE_STAGE_AVATAR_CLASS: Record<CrmPipelineStageId, string> = {
  leads: 'bg-violet-100 text-violet-700',
  contactado: 'bg-blue-100 text-blue-700',
  cotizacion: 'bg-teal-100 text-teal-800',
  seguimiento: 'bg-orange-100 text-orange-800',
  por_pagar: 'bg-amber-100 text-amber-900',
  por_enviar: 'bg-emerald-100 text-emerald-800',
  venta_completada: 'bg-indigo-100 text-indigo-800',
};

export const CRM_PIPELINE_DRAG_TYPE = 'application/x-haistore-crm-lead-id';

export function priorityFromAmount(amountPen: number): CrmLeadPriority {
  if (amountPen >= 15_000) return 'alta';
  if (amountPen >= 5_000) return 'media';
  return 'baja';
}

export function applyLeadStageChange(
  lead: CrmPipelineLead,
  nextStageId: CrmPipelineStageId,
): Pick<CrmPipelineLead, 'stageId' | 'avatarClass' | 'formSnapshot' | 'priority' | 'followUpLabel'> {
  const base = {
    stageId: nextStageId,
    avatarClass: CRM_PIPELINE_STAGE_AVATAR_CLASS[nextStageId],
    formSnapshot: { ...lead.formSnapshot, stageId: nextStageId },
  };
  if (nextStageId === 'venta_completada') {
    return {
      ...base,
      priority: 'ganado' as const,
      followUpLabel: 'Seguimiento: Cerrado',
    };
  }
  return {
    ...base,
    priority: priorityFromAmount(
      leadAmountsInBothCurrencies(lead.valueAmount, lead.currency, getUsdToPenSaleRate()).pen,
    ),
    followUpLabel:
      lead.followUpLabel === 'Seguimiento: Cerrado' ? 'Seguimiento: Sin fecha' : lead.followUpLabel,
  };
}

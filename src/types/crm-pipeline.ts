import type { CrmLeadLineItem, CrmNewLeadFormValues } from '@/types/crm-lead-form';

export type CrmLeadPriority = 'alta' | 'media' | 'baja' | 'ganado';
export type CrmLeadCurrency = 'PEN' | 'USD';

export type CrmPipelineStageId =
  | 'leads'
  | 'contactado'
  | 'cotizacion'
  | 'seguimiento'
  | 'por_pagar'
  | 'por_enviar'
  | 'venta_completada';

export interface CrmPipelineStage {
  id: CrmPipelineStageId;
  label: string;
  accentClass: string;
  borderClass: string;
}

export interface CrmPipelineLead {
  id: string;
  stageId: CrmPipelineStageId;
  /** Título del negocio (línea principal en la tarjeta). */
  title: string;
  contactName: string;
  organization: string;
  valueAmount: number;
  currency: CrmLeadCurrency;
  initials: string;
  avatarClass: string;
  priority: CrmLeadPriority;
  followUpLabel: string;
  /** ISO 8601 — no cambia al editar, solo al crear o duplicar. */
  createdAt: string;
  productName: string;
  lineItems: CrmLeadLineItem[];
  sellerName: string;
  formSnapshot: CrmNewLeadFormValues;
}

export interface CrmPipelineKpis {
  totalLeads: number;
  openLeads: number;
  pipelineValuePen: number;
  pendingTasks: number;
  followUpsToday: number;
  conversionPercent: number;
}

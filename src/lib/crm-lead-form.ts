import { getUsdToPenSaleRate } from '@/lib/exchange-rate';
import {
  computeLeadLinesTotal,
  leadProductNameFromLines,
} from '@/lib/crm-lead-products';
import { leadAmountsInBothCurrencies } from '@/lib/crm-pipeline-utils';
import {
  CRM_PIPELINE_STAGE_AVATAR_CLASS,
  priorityFromAmount,
} from '@/lib/crm-pipeline-stage-styles';
import type { CrmNewLeadFormValues } from '@/types/crm-lead-form';
import type { CrmLeadCurrency, CrmLeadPriority, CrmPipelineLead } from '@/types/crm-pipeline';

export function leadInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

export function parseLeadCurrency(value: string): CrmLeadCurrency {
  return value === 'USD' ? 'USD' : 'PEN';
}

export function parseLeadValueAmount(value: string): number {
  return Math.max(0, Number.parseFloat(value.replace(',', '.')) || 0);
}

export function formatLeadFollowUpLabel(expectedCloseDate: string): string {
  if (!expectedCloseDate) return 'Seguimiento: Sin fecha';
  const parsed = new Date(`${expectedCloseDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return 'Seguimiento: Sin fecha';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(parsed);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() === today.getTime()) return 'Seguimiento: Hoy';
  return `Seguimiento: ${parsed.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`;
}

export function leadCardTitle(values: CrmNewLeadFormValues): string {
  const title = values.title.trim();
  if (title) return title;
  const contact = values.contactName.trim();
  if (contact) return contact;
  return values.organization.trim() || 'Sin título';
}

export function leadPriorityFromForm(
  values: CrmNewLeadFormValues,
  valueAmount: number,
  usdToPenRate = getUsdToPenSaleRate(),
): CrmLeadPriority {
  if (values.stageId === 'venta_completada') return 'ganado';
  const currency = parseLeadCurrency(values.currency);
  const { pen } = leadAmountsInBothCurrencies(valueAmount, currency, usdToPenRate);
  return priorityFromAmount(pen);
}

export interface CreatePipelineLeadMeta {
  createdAt?: string;
  sellerName?: string;
}

export function createPipelineLeadFromForm(
  values: CrmNewLeadFormValues,
  id: string,
  meta?: CreatePipelineLeadMeta,
): CrmPipelineLead | null {
  const contact = values.contactName.trim();
  const organization = values.organization.trim();
  if (!contact && !organization && !values.title.trim()) return null;

  const lineItems = values.lineItems ?? [];
  const linesTotal = computeLeadLinesTotal(lineItems);
  const parsedValue = parseLeadValueAmount(values.valueAmount);
  const valueAmount = lineItems.length > 0 ? linesTotal : parsedValue;
  const currency = parseLeadCurrency(values.currency);
  const title = leadCardTitle(values);
  const initialsSource = contact || organization || title;

  const sellerName =
    (meta?.sellerName ?? values.ownerLabel).trim() || 'Sin asignar';
  const productName =
    leadProductNameFromLines(lineItems) || values.productName.trim();
  const createdAt = meta?.createdAt ?? new Date().toISOString();

  const snapshot: CrmNewLeadFormValues = {
    ...values,
    stageId: values.stageId,
    ownerLabel: sellerName,
    productName,
    lineItems,
    valueAmount: String(valueAmount),
  };

  return {
    id,
    stageId: values.stageId,
    title,
    contactName: contact,
    organization: organization || '—',
    valueAmount,
    currency,
    initials: leadInitials(initialsSource),
    avatarClass: CRM_PIPELINE_STAGE_AVATAR_CLASS[values.stageId],
    priority: leadPriorityFromForm(values, valueAmount),
    followUpLabel: formatLeadFollowUpLabel(values.expectedCloseDate),
    createdAt,
    productName,
    lineItems,
    sellerName,
    formSnapshot: snapshot,
  };
}

export function duplicatePipelineLead(lead: CrmPipelineLead): CrmPipelineLead {
  const newId = crypto.randomUUID();
  const snapshot = {
    ...lead.formSnapshot,
    contactName: lead.contactName,
    organization: lead.organization === '—' ? '' : lead.organization,
    title: lead.title,
    productName: lead.productName,
    lineItems: lead.lineItems ?? [],
    valueAmount: String(lead.valueAmount),
    currency: lead.currency,
    stageId: lead.stageId,
    ownerLabel: lead.sellerName,
  };
  return createPipelineLeadFromForm(snapshot, newId, {
    sellerName: lead.sellerName,
  })!;
}

export function leadAmountInPen(lead: CrmPipelineLead, usdToPenRate: number): number {
  if (lead.currency === 'USD') return lead.valueAmount * usdToPenRate;
  return lead.valueAmount;
}

export interface CrmResumenLeadMetrics {
  wonCount: number;
  wonValuePen: number;
  activeCount: number;
  activeValuePen: number;
  lostCount: number;
  lostValuePen: number;
  withoutTasksCount: number;
  withoutTasksValuePen: number;
}

export function formatResumenPenAmount(amount: number): string {
  if (amount <= 0) return '0 S/';
  return `${amount.toLocaleString('es-PE', { maximumFractionDigits: 0 })} S/`;
}

export function computeResumenMetricsFromLeads(
  leads: CrmPipelineLead[],
  usdToPenRate: number,
): CrmResumenLeadMetrics {
  const won = leads.filter((l) => l.stageId === 'venta_completada');
  const active = leads.filter((l) => l.stageId !== 'venta_completada');
  const sumPen = (items: CrmPipelineLead[]) =>
    items.reduce((sum, l) => sum + leadAmountInPen(l, usdToPenRate), 0);

  return {
    wonCount: won.length,
    wonValuePen: sumPen(won),
    activeCount: active.length,
    activeValuePen: sumPen(active),
    lostCount: 0,
    lostValuePen: 0,
    withoutTasksCount: active.length,
    withoutTasksValuePen: sumPen(active),
  };
}

export function computePipelineKpisFromLeads(leads: CrmPipelineLead[], usdToPenRate: number) {
  const won = leads.filter((l) => l.stageId === 'venta_completada').length;
  const openLeads = leads.filter((l) => l.stageId !== 'venta_completada').length;
  const pipelineValuePen = leads
    .filter((l) => l.stageId !== 'venta_completada')
    .reduce((sum, l) => sum + leadAmountInPen(l, usdToPenRate), 0);
  const followUpsToday = leads.filter((l) => l.followUpLabel.includes('Hoy')).length;
  const conversionPercent =
    leads.length > 0 ? Math.round((won / leads.length) * 100) : 0;

  return {
    totalLeads: leads.length,
    openLeads,
    pipelineValuePen,
    pendingTasks: 0,
    followUpsToday,
    conversionPercent,
  };
}

import { normalizeLeadTasks } from '@/lib/crm-lead-tasks';
import type { CrmPipelineLead, CrmPipelineStageId } from '@/types/crm-pipeline';

export const CRM_PIPELINE_STORAGE_KEY = 'haistore-crm-pipeline-leads-v1';
export const CRM_PIPELINE_UPDATED_EVENT = 'haistore-crm-pipeline-updated';

const STORAGE_KEY = CRM_PIPELINE_STORAGE_KEY;

const STAGE_IDS = new Set<CrmPipelineStageId>([
  'leads',
  'contactado',
  'cotizacion',
  'seguimiento',
  'por_pagar',
  'por_enviar',
  'venta_completada',
]);

function isPipelineLead(value: unknown): value is CrmPipelineLead {
  if (!value || typeof value !== 'object') return false;
  const lead = value as CrmPipelineLead;
  return (
    typeof lead.id === 'string' &&
    typeof lead.title === 'string' &&
    STAGE_IDS.has(lead.stageId) &&
    typeof lead.valueAmount === 'number' &&
    (lead.currency === 'PEN' || lead.currency === 'USD') &&
    lead.formSnapshot != null &&
    typeof lead.formSnapshot === 'object'
  );
}

/** Completa campos nuevos en leads guardados antes de la migración. */
export function normalizePipelineLead(lead: CrmPipelineLead): CrmPipelineLead {
  const snapshot = lead.formSnapshot;
  const sellerName =
    lead.sellerName?.trim() ||
    snapshot.ownerLabel?.trim() ||
    'Sin asignar';
  const lineItems = Array.isArray(lead.lineItems)
    ? lead.lineItems
    : Array.isArray(snapshot.lineItems)
      ? snapshot.lineItems
      : [];
  const productName =
    lead.productName?.trim() ??
    snapshot.productName?.trim() ??
    (lineItems[0]?.productName ?? '');
  const createdAt =
    typeof lead.createdAt === 'string' && lead.createdAt
      ? lead.createdAt
      : new Date().toISOString();

  const tasks = normalizeLeadTasks(lead.tasks ?? snapshot.tasks);

  return {
    ...lead,
    createdAt,
    productName,
    lineItems,
    sellerName,
    tasks,
    isDraft: lead.isDraft === true,
    formSnapshot: {
      ...snapshot,
      productName: snapshot.productName ?? productName,
      lineItems: snapshot.lineItems ?? lineItems,
      ownerLabel: snapshot.ownerLabel ?? sellerName,
      tasks,
    },
  };
}

export function loadCrmPipelineLeads(): CrmPipelineLead[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPipelineLead).map(normalizePipelineLead);
  } catch {
    return [];
  }
}

export function saveCrmPipelineLeads(leads: CrmPipelineLead[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch {
    /* quota / modo privado */
  }
}

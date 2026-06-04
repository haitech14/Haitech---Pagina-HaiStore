import { leadProductNameFromLines } from '@/lib/crm-lead-products';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import type { CrmLeadLineItem } from '@/types/crm-lead-form';
import type {
  CrmLeadCurrency,
  CrmLeadPriority,
  CrmPipelineLead,
  CrmPipelineStageId,
} from '@/types/crm-pipeline';

export function formatPipelinePen(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPipelineUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatLeadDealValue(amount: number, currency: CrmLeadCurrency): string {
  return currency === 'USD' ? formatPipelineUsd(amount) : formatPipelinePen(amount);
}

export function leadAmountsInBothCurrencies(
  amount: number,
  currency: CrmLeadCurrency,
  usdToPenRate: number,
): { pen: number; usd: number } {
  const rate = usdToPenRate > 0 ? usdToPenRate : DEFAULT_USD_TO_PEN;
  if (currency === 'USD') {
    return { usd: amount, pen: amount * rate };
  }
  return { pen: amount, usd: amount / rate };
}

/** Valor principal y equivalente (p. ej. «US$ 900 o S/ 3.330»). */
export function formatLeadDealValueDual(
  amount: number,
  currency: CrmLeadCurrency,
  usdToPenRate: number,
): string {
  if (amount <= 0) {
    return formatLeadDealValue(0, currency);
  }
  const { pen, usd } = leadAmountsInBothCurrencies(amount, currency, usdToPenRate);
  const primary = formatLeadDealValue(amount, currency);
  const secondary =
    currency === 'USD' ? formatPipelinePen(pen) : formatPipelineUsd(usd);
  return `${primary} o ${secondary}`;
}

export function formatLeadCreatedAt(iso: string): string {
  if (!iso) return 'Sin fecha';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';
  return parsed.toLocaleDateString('es-PE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatLeadProductDisplay(
  productName: string,
  lineItems: CrmLeadLineItem[] | undefined,
): string {
  const fromLines = leadProductNameFromLines(lineItems ?? []);
  if (fromLines) return fromLines;
  return productName.trim() || '—';
}

export function formatLeadCreatedShort(iso: string): string {
  if (!iso) return 'Creación: Sin fecha';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Creación: Sin fecha';
  return `Creación: ${parsed.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}`;
}

export function formatLeadEquivalentHint(
  amount: number,
  currency: CrmLeadCurrency,
  usdToPenRate: number,
): string | null {
  if (amount <= 0) return null;
  const { pen, usd } = leadAmountsInBothCurrencies(amount, currency, usdToPenRate);
  return currency === 'USD'
    ? `Equivale a ${formatPipelinePen(pen)}`
    : `Equivale a ${formatPipelineUsd(usd)}`;
}

export function priorityLabel(priority: CrmLeadPriority): string {
  switch (priority) {
    case 'alta':
      return 'Alta';
    case 'media':
      return 'Media';
    case 'baja':
      return 'Baja';
    case 'ganado':
      return 'Ganado';
    default: {
      const _exhaustive: never = priority;
      return _exhaustive;
    }
  }
}

export function priorityBadgeClass(priority: CrmLeadPriority): string {
  switch (priority) {
    case 'alta':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'media':
      return 'border-amber-200 bg-amber-50 text-amber-800';
    case 'baja':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    case 'ganado':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800';
    default: {
      const _exhaustive: never = priority;
      return _exhaustive;
    }
  }
}

export function groupLeadsByStage(
  leads: CrmPipelineLead[],
): Record<CrmPipelineStageId, CrmPipelineLead[]> {
  const map = {} as Record<CrmPipelineStageId, CrmPipelineLead[]>;
  for (const lead of leads) {
    if (!map[lead.stageId]) map[lead.stageId] = [];
    map[lead.stageId].push(lead);
  }
  return map;
}

export function stageSummary(
  leads: CrmPipelineLead[],
  usdToPenRate: number,
): {
  count: number;
  totalPen: number;
  label: string;
} {
  const count = leads.length;
  const totalPen = leads.reduce(
    (sum, lead) =>
      sum +
      (lead.currency === 'USD' ? lead.valueAmount * usdToPenRate : lead.valueAmount),
    0,
  );
  const label =
    count === 1 ? '1 cliente potencial' : `${count} clientes potenciales`;
  return { count, totalPen, label };
}

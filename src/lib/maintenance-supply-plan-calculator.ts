import { extractProductYield } from '@/lib/product-cost-per-copy';
import {
  flattenConsumableGroupItems,
  type ConsumableGroup,
} from '@/lib/product-equipment-consumables';
import type { ConfigureTonerCard } from '@/lib/product-configure-toner';
import type { SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import { usdToPen } from '@/lib/utils';
import type { Product } from '@/types/product';

/** Páginas incluidas en el plan base (6 meses). El plan de 12 meses duplica este cupo. */
export const MAINTENANCE_SUPPLY_PLAN_BASE_PAGES = 5_600;

/**
 * Rendimiento del tóner (páginas) usado en el cálculo del plan de suministro.
 * Constante para la fórmula `(planPages / yield) * tonerPrice`; si el catálogo
 * no trae rendimiento, se usa este valor por defecto.
 */
export const DEFAULT_SUPPLY_TONER_YIELD_PAGES = 5_600;

/** Precio fijo del plan de mantenimiento (6 meses, USD). */
export const MAINTENANCE_SUPPLY_PLAN_BASE_USD = 200;

export const MAINTENANCE_SUPPLY_PLAN_TERM_OPTIONS = [6, 12] as const;

export type MaintenanceSupplyPlanTermMonths =
  (typeof MAINTENANCE_SUPPLY_PLAN_TERM_OPTIONS)[number];

export type MaintenanceSupplyPlanType =
  | 'none'
  | 'maintenance'
  | 'supply-original'
  | 'supply-compatible';

export interface MaintenanceSupplyPlanSelection {
  planType: MaintenanceSupplyPlanType;
  termMonths: MaintenanceSupplyPlanTermMonths;
}

export const MAINTENANCE_SUPPLY_PLAN_NONE: MaintenanceSupplyPlanSelection = {
  planType: 'none',
  termMonths: 6,
};

export interface MaintenanceSupplyPlanQuote {
  planType: Exclude<MaintenanceSupplyPlanType, 'none'>;
  termMonths: MaintenanceSupplyPlanTermMonths;
  planPages: number;
  priceUsd: number;
  label: string;
  description?: string;
}

export function resolveMaintenanceSupplyPlanPages(
  termMonths: MaintenanceSupplyPlanTermMonths,
): number {
  const factor = termMonths / 6;
  return Math.round(MAINTENANCE_SUPPLY_PLAN_BASE_PAGES * factor);
}

export function formatMaintenanceSupplyPlanDurationLabel(
  termMonths: MaintenanceSupplyPlanTermMonths,
): string {
  const pages = resolveMaintenanceSupplyPlanPages(termMonths);
  return `${termMonths} meses y/o ${pages.toLocaleString('es-PE')} páginas`;
}

export function calculateMaintenancePlanPriceUsd(
  termMonths: MaintenanceSupplyPlanTermMonths,
): number {
  const factor = termMonths / 6;
  return Math.round(MAINTENANCE_SUPPLY_PLAN_BASE_USD * factor * 100) / 100;
}

export function calculateSupplyPlanPriceUsd(
  planPages: number,
  tonerPriceUsd: number,
  tonerYieldPages: number | null | undefined,
): number | null {
  if (!tonerYieldPages || tonerYieldPages <= 0 || tonerPriceUsd <= 0) return null;
  const units = planPages / tonerYieldPages;
  return Math.round(units * tonerPriceUsd * 100) / 100;
}

export function resolveTonerYieldPages(
  card: ConfigureTonerCard,
  catalog: Product[],
  consumableGroups: ConsumableGroup[] = [],
): number {
  for (const item of flattenConsumableGroupItems(consumableGroups)) {
    if (item.productId === card.productId && item.yieldPages && item.yieldPages > 0) {
      return item.yieldPages;
    }
  }

  const product = catalog.find((row) => row.id === card.productId);
  if (product) {
    const yieldInfo = extractProductYield(product);
    if (yieldInfo.pages && yieldInfo.pages > 0) return yieldInfo.pages;
  }

  const fromDescription = extractProductYield({
    name: card.description,
    attributes: [],
    description: card.description,
  });
  if (fromDescription.pages && fromDescription.pages > 0) return fromDescription.pages;

  return DEFAULT_SUPPLY_TONER_YIELD_PAGES;
}

export function resolveMaintenanceSupplyPlanQuote(
  selection: MaintenanceSupplyPlanSelection,
  tonerCards: ConfigureTonerCard[],
  catalog: Product[],
  consumableGroups: ConsumableGroup[] = [],
): MaintenanceSupplyPlanQuote | null {
  if (selection.planType === 'none') return null;

  const planPages = resolveMaintenanceSupplyPlanPages(selection.termMonths);
  const durationLabel = formatMaintenanceSupplyPlanDurationLabel(selection.termMonths);

  if (selection.planType === 'maintenance') {
    return {
      planType: 'maintenance',
      termMonths: selection.termMonths,
      planPages,
      priceUsd: calculateMaintenancePlanPriceUsd(selection.termMonths),
      label: `Plan de Mantenimiento — ${durationLabel}`,
      description:
        'Incluye mantenimiento al término de garantía y al último mes.',
    };
  }

  const supplyType = selection.planType === 'supply-original' ? 'original' : 'compatible';
  const tonerCard = tonerCards.find((card) => card.supplyType === supplyType);
  if (!tonerCard) return null;

  const yieldPages = resolveTonerYieldPages(tonerCard, catalog, consumableGroups);
  const priceUsd = calculateSupplyPlanPriceUsd(
    planPages,
    tonerCard.prices.public,
    yieldPages,
  );
  if (priceUsd == null) return null;

  const supplyLabel =
    supplyType === 'original' ? 'Plan de Suministro Original' : 'Plan de Suministro Compatible';

  return {
    planType: selection.planType,
    termMonths: selection.termMonths,
    planPages,
    priceUsd,
    label: `${supplyLabel} — ${durationLabel}`,
  };
}

export function buildMaintenanceSupplyPlanCartOption(
  quote: MaintenanceSupplyPlanQuote,
): SelectedEquipmentOption {
  return {
    stepNumber: 99,
    stepTitle: 'Planes de Mantenimiento/Suministro',
    optionId: `maintenance-supply-${quote.planType}-${quote.termMonths}`,
    optionName: quote.label,
    pricePen: usdToPen(quote.priceUsd),
    priceUsd: quote.priceUsd,
  };
}

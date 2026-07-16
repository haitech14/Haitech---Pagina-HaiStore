import type { EquipmentConfigStep } from '@/types/product-detail';
import { penToUsd } from '@/lib/utils';

export type EquipmentSelectionState = Record<string, Set<string>>;

export interface SelectedEquipmentOption {
  stepNumber: number;
  stepTitle: string;
  optionId: string;
  optionName: string;
  pricePen: number;
  included?: boolean;
  productId?: string;
  sku?: string;
  imageUrl?: string | null;
  priceUsd?: number;
}

export function selectEquipmentOption(
  selection: EquipmentSelectionState,
  step: EquipmentConfigStep,
  optionId: string,
): EquipmentSelectionState {
  const option = step.options.find((entry) => entry.id === optionId);
  if (!option) return selection;

  const mode = step.selectionMode ?? 'multiple';
  const current = selection[step.id] ?? new Set<string>();

  if (mode === 'single') {
    return { ...selection, [step.id]: new Set([optionId]) };
  }

  const next = new Set(current);
  if (next.has(optionId)) {
    if (option.included) return selection;
    next.delete(optionId);
  } else {
    next.add(optionId);
  }

  return { ...selection, [step.id]: next };
}

/** Selección tipo radio en el hero: un tóner pagado a la vez; al deseleccionar queda sin selección. */
export function selectHeroTonerCard(
  selection: EquipmentSelectionState,
  step: EquipmentConfigStep,
  optionId: string,
): EquipmentSelectionState {
  const current = selection[step.id] ?? new Set<string>();

  if (current.has(optionId)) {
    return { ...selection, [step.id]: new Set<string>() };
  }

  return { ...selection, [step.id]: new Set([optionId]) };
}

/** Sin opciones preseleccionadas: el usuario agrega accesorios y tóner explícitamente. */
export function buildInitialEquipmentSelection(steps: EquipmentConfigStep[]): EquipmentSelectionState {
  return Object.fromEntries(steps.map((step) => [step.id, new Set<string>()]));
}

export function resolveSelectedEquipmentOptions(
  steps: EquipmentConfigStep[],
  selectedByStep: EquipmentSelectionState,
): SelectedEquipmentOption[] {
  const resolved: SelectedEquipmentOption[] = [];

  for (const step of steps) {
    const selectedIds = selectedByStep[step.id] ?? new Set<string>();
    for (const option of step.options) {
      if (!selectedIds.has(option.id)) continue;
      resolved.push({
        stepNumber: step.stepNumber,
        stepTitle: step.title,
        optionId: option.id,
        optionName: option.name,
        pricePen: option.pricePen,
        ...(option.included ? { included: true } : {}),
        ...(option.productId ? { productId: option.productId } : {}),
        ...(option.sku ? { sku: option.sku } : {}),
        ...(option.image ? { imageUrl: option.image } : {}),
        ...(option.priceUsd != null ? { priceUsd: option.priceUsd } : {}),
      });
    }
  }

  return resolved;
}

export function getPaidEquipmentOptions(options: SelectedEquipmentOption[]): SelectedEquipmentOption[] {
  return options.filter((option) => option.pricePen > 0);
}

export function computeEquipmentExtrasPen(options: SelectedEquipmentOption[]): number {
  return getPaidEquipmentOptions(options).reduce((sum, option) => sum + option.pricePen, 0);
}

export function computeEquipmentExtrasUsd(options: SelectedEquipmentOption[]): number {
  return getPaidEquipmentOptions(options).reduce((sum, option) => {
    if (option.priceUsd != null && option.priceUsd > 0) {
      return sum + option.priceUsd;
    }
    return sum + penToUsd(option.pricePen);
  }, 0);
}

export function buildEquipmentCartLineId(
  productId: string,
  paidOptions: SelectedEquipmentOption[],
): string {
  if (paidOptions.length === 0) return productId;
  const signature = paidOptions
    .map((option) => option.productId ?? option.optionId)
    .sort()
    .join(',');
  return `${productId}::${signature}`;
}

export interface ProductQuoteLineInput {
  name: string;
  sku: string;
  brand: string;
  pricePen: number;
  quantity?: number;
  imageUrl?: string | null;
  shortDescription?: string | null;
}

export function buildProductQuoteLines(
  mainLine: ProductQuoteLineInput,
  configuration?: { options: SelectedEquipmentOption[]; extrasPen: number },
): ProductQuoteLineInput[] {
  const lines: ProductQuoteLineInput[] = [
    {
      ...mainLine,
      quantity: mainLine.quantity ?? 1,
    },
  ];

  for (const option of getPaidEquipmentOptions(configuration?.options ?? [])) {
    lines.push({
      name: option.optionName,
      sku: option.sku ?? `CFG-${option.optionId}`,
      brand: `Paso ${option.stepNumber}`,
      pricePen: option.pricePen,
      quantity: 1,
      imageUrl: option.imageUrl ?? null,
    });
  }

  return lines;
}

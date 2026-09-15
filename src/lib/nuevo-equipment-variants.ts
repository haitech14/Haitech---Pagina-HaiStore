import { isPrinterEquipment, isSupplyProduct } from '@/lib/build-product-detail';
import {
  isDualFormatA4PrimaryProduct,
  resolveFormatoPapel,
} from '@/lib/category-catalog-filters';
import type { SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import { penToUsd, usdToPen } from '@/lib/utils';
import type { EquipmentConfigOption, EquipmentConfigStep, ProductComboItem } from '@/types/product-detail';
import type { Product } from '@/types/product';

export const NUEVO_EQUIPMENT_VARIANT_IDS = ['solo-equipo', 'mesa-2-caseteras-mueble'] as const;

export type NuevoEquipmentVariantId = (typeof NUEVO_EQUIPMENT_VARIANT_IDS)[number];

export const NUEVO_EQUIPMENT_VARIANT_LABELS: Record<NuevoEquipmentVariantId, string> = {
  'solo-equipo': 'Solo equipo',
  'mesa-2-caseteras-mueble': 'Opción 2',
};

/** Accesorios que ya van en la opción 2 (no duplicar en Complementa). */
export const NUEVO_MESA_BUNDLE_ACCESSORY_OPTION_IDS = [
  'casetera-250',
  'casetera-500',
  'gabinete',
  'tall-cabinet-u',
] as const;

const CASETERA_OPTION_IDS = ['casetera-500', 'casetera-250'] as const;
const MUEBLE_OPTION_IDS = ['gabinete', 'tall-cabinet-u'] as const;

const FLOOR_STANDING_NAME_PATTERN =
  /\bim\s*c?\s*\d{4}(?!\s*f)\b|\bmp\s*c\s*\d{3,4}\b|\bpro\s|\bformato\s*ancho\b|\bplotter\b|\bplanos\b/i;

function productHaystack(product: Product): string {
  return `${product.name} ${product.category ?? ''}`;
}

function optionUsd(option: EquipmentConfigOption): number {
  if (option.priceUsd != null && option.priceUsd > 0) return option.priceUsd;
  if (option.pricePen > 0) return penToUsd(option.pricePen);
  return 0;
}

function comboUsd(item: ProductComboItem): number {
  if (item.priceUsd != null && item.priceUsd > 0) return item.priceUsd;
  if (item.pricePen > 0) return penToUsd(item.pricePen);
  return 0;
}

function findStepOption(
  steps: readonly EquipmentConfigStep[],
  optionIds: readonly string[],
): { step: EquipmentConfigStep; option: EquipmentConfigOption } | null {
  for (const optionId of optionIds) {
    for (const step of steps) {
      const option = step.options.find((entry) => entry.id === optionId);
      if (option) return { step, option };
    }
  }
  return null;
}

function findComboItem(
  comboItems: readonly ProductComboItem[] | undefined,
  pattern: RegExp,
): ProductComboItem | null {
  if (!comboItems?.length) return null;
  return comboItems.find((item) => pattern.test(item.name)) ?? null;
}

/**
 * Equipo compacto de escritorio (IM xxxF, P xxx, A4), no de piso.
 * Sirve para escala visual en vitrina: los de mesa no deben llenar el recuadro como un A3.
 */
export function isDesktopTablePrinter(product: {
  name: string;
  category?: string | null;
}): boolean {
  const haystack = `${product.name} ${product.category ?? ''}`;
  if (FLOOR_STANDING_NAME_PATTERN.test(haystack)) return false;

  const cat = (product.category ?? '').toLowerCase();
  const name = product.name.toLowerCase();
  const looksLikePrinter =
    cat.includes('multifuncional') ||
    cat.includes('impresora') ||
    cat.includes('fotocop') ||
    name.includes('ricoh') ||
    name.includes('multifunc');
  if (!looksLikePrinter) return false;

  if (/\bIM\s*C?\s*\d{3,4}F\b/i.test(product.name)) return true;
  if (/\bP\s+\d{3,4}\b/i.test(product.name)) return true;
  if (/\bM\s+C?\s*\d{3,4}/i.test(product.name)) return true;
  return resolveFormatoPapel({ name: product.name, category: product.category ?? null } as Product) === 'A4';
}

/** Equipo nuevo de escritorio (A4 / de mesa): admite pack 2 caseteras + mueble. */
export function isNuevoDesktopTableEquipment(product: Product): boolean {
  if (isSupplyProduct(product) || !isPrinterEquipment(product)) return false;
  if (!productQualifiesAsNuevaEquipment(product)) return false;
  if (productQualifiesAsSeminuevaEquipment(product)) return false;
  if (productQualifiesAsRemanufacturadaEquipment(product)) return false;
  if (FLOOR_STANDING_NAME_PATTERN.test(productHaystack(product))) return false;
  if (isDualFormatA4PrimaryProduct(product)) return false;
  return resolveFormatoPapel(product) !== 'A3';
}

export function shouldShowNuevoEquipmentVariantSelector(product: Product): boolean {
  return isNuevoDesktopTableEquipment(product);
}

export function resolveNuevoMesaBundleOptions(
  steps: readonly EquipmentConfigStep[],
  comboItems?: readonly ProductComboItem[],
): SelectedEquipmentOption[] {
  const casetera = findStepOption(steps, CASETERA_OPTION_IDS);
  const mueble = findStepOption(steps, MUEBLE_OPTION_IDS);
  const comboCasetera = findComboItem(comboItems, /casetera|bandeja|paper\s*bank|paper\s*feed/i);
  const comboMueble = findComboItem(comboItems, /mueble|gabinete|pedestal|cabinet|soporte de piso/i);
  const accessoriesStep = steps.find((step) => step.id === 'accesorios');
  const options: SelectedEquipmentOption[] = [];

  const caseteraUnitUsd = casetera ? optionUsd(casetera.option) : 0;
  const caseteraSource = caseteraUnitUsd > 0 ? 'step' : comboCasetera ? 'combo' : casetera ? 'step' : null;
  if (caseteraSource === 'combo' && comboCasetera) {
    const unitUsd = comboUsd(comboCasetera);
    const totalUsd = unitUsd * 2;
    options.push({
      stepNumber: accessoriesStep?.stepNumber ?? 2,
      stepTitle: accessoriesStep?.title ?? 'Accesorios',
      optionId: 'nuevo-mesa-caseteras',
      optionName: '2 caseteras',
      pricePen: comboCasetera.pricePen * 2,
      ...(comboCasetera.productId ? { productId: comboCasetera.productId } : {}),
      ...(comboCasetera.image ? { imageUrl: comboCasetera.image } : {}),
      ...(totalUsd > 0 ? { priceUsd: totalUsd } : {}),
    });
  } else if (casetera) {
    const totalUsd = caseteraUnitUsd * 2;
    const totalPen = casetera.option.pricePen > 0 ? casetera.option.pricePen * 2 : usdToPen(totalUsd);
    options.push({
      stepNumber: casetera.step.stepNumber,
      stepTitle: casetera.step.title,
      optionId: 'nuevo-mesa-caseteras',
      optionName: '2 caseteras',
      pricePen: totalPen,
      ...(casetera.option.productId ? { productId: casetera.option.productId } : {}),
      ...(casetera.option.sku ? { sku: casetera.option.sku } : {}),
      ...(casetera.option.image ? { imageUrl: casetera.option.image } : {}),
      ...(totalUsd > 0 ? { priceUsd: totalUsd } : {}),
    });
  }

  const muebleUsd = mueble ? optionUsd(mueble.option) : 0;
  const muebleSource = muebleUsd > 0 ? 'step' : comboMueble ? 'combo' : mueble ? 'step' : null;
  if (muebleSource === 'combo' && comboMueble) {
    const totalUsd = comboUsd(comboMueble);
    options.push({
      stepNumber: accessoriesStep?.stepNumber ?? 2,
      stepTitle: accessoriesStep?.title ?? 'Accesorios',
      optionId: 'nuevo-mesa-mueble',
      optionName: '1 mueble',
      pricePen: comboMueble.pricePen,
      ...(comboMueble.productId ? { productId: comboMueble.productId } : {}),
      ...(comboMueble.image ? { imageUrl: comboMueble.image } : {}),
      ...(totalUsd > 0 ? { priceUsd: totalUsd } : {}),
    });
  } else if (mueble) {
    const totalPen = mueble.option.pricePen > 0 ? mueble.option.pricePen : usdToPen(muebleUsd);
    options.push({
      stepNumber: mueble.step.stepNumber,
      stepTitle: mueble.step.title,
      optionId: 'nuevo-mesa-mueble',
      optionName: '1 mueble',
      pricePen: totalPen,
      ...(mueble.option.productId ? { productId: mueble.option.productId } : {}),
      ...(mueble.option.sku ? { sku: mueble.option.sku } : {}),
      ...(mueble.option.image ? { imageUrl: mueble.option.image } : {}),
      ...(muebleUsd > 0 ? { priceUsd: muebleUsd } : {}),
    });
  }

  return options;
}

export function resolveNuevoMesaBundleSurchargeUsd(
  steps: readonly EquipmentConfigStep[],
  comboItems?: readonly ProductComboItem[],
): number {
  return resolveNuevoMesaBundleOptions(steps, comboItems).reduce((sum, option) => {
    if (option.priceUsd != null && option.priceUsd > 0) return sum + option.priceUsd;
    return sum + penToUsd(option.pricePen);
  }, 0);
}

export function mergeNuevoVariantEquipmentOptions(
  selectedOptions: readonly SelectedEquipmentOption[],
  variant: NuevoEquipmentVariantId,
  steps: readonly EquipmentConfigStep[],
  comboItems?: readonly ProductComboItem[],
): SelectedEquipmentOption[] {
  const withoutBundleAccessories = selectedOptions.filter(
    (option) =>
      !(NUEVO_MESA_BUNDLE_ACCESSORY_OPTION_IDS as readonly string[]).includes(option.optionId),
  );

  if (variant !== 'mesa-2-caseteras-mueble') {
    return withoutBundleAccessories;
  }

  return [...withoutBundleAccessories, ...resolveNuevoMesaBundleOptions(steps, comboItems)];
}

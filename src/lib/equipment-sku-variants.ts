import { extractEquipmentModelKey, HAITECH_EQUIPMENT_PART_CODES } from '@/data/haitech-equipment-part-codes';
import type { EquipmentSelectionState, SelectedEquipmentOption } from '@/lib/equipment-config-selection';
import type { NuevoEquipmentVariantId } from '@/lib/nuevo-equipment-variants';
import type { EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

export const EQUIPMENT_SKU_VARIANT_IDS = [
  'base',
  'bundle-b',
  'warranty-3',
  'pack-emprendedor',
] as const;

export type EquipmentSkuVariantId = (typeof EQUIPMENT_SKU_VARIANT_IDS)[number];

export interface EquipmentSkuVariant {
  id: EquipmentSkuVariantId;
  code: string;
  title: string;
  subtitle: string;
  image: string | null;
}

const BUNDLE_B_CASETERA_OPTION_IDS = [
  'casetera-adicional-423525',
  'casetera-500',
  'casetera-250',
] as const;

const BUNDLE_B_CABINET_OPTION_IDS = ['high-cabinet-a8', 'gabinete', 'tall-cabinet-u'] as const;

const BUNDLE_B_OPTION_IDS = new Set<string>([
  ...BUNDLE_B_CASETERA_OPTION_IDS,
  ...BUNDLE_B_CABINET_OPTION_IDS,
]);

function partCodeFromProductCode(code: string | null | undefined): string | null {
  const trimmed = code?.trim() ?? '';
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  const prefix = trimmed.split('-')[0];
  if (prefix && /^\d{6}$/.test(prefix)) return prefix;
  return null;
}

/** Código base del equipo (COD-PART de 6 dígitos), sin sufijos comerciales. */
export function resolveEquipmentBasePartCode(
  product: Pick<Product, 'name' | 'code'>,
): string | null {
  const model = extractEquipmentModelKey(product.name ?? '');
  if (model && HAITECH_EQUIPMENT_PART_CODES[model]) {
    return HAITECH_EQUIPMENT_PART_CODES[model];
  }
  return partCodeFromProductCode(product.code);
}

export function buildEquipmentSkuVariants(product: Product): EquipmentSkuVariant[] {
  const baseCode = resolveEquipmentBasePartCode(product);
  if (!baseCode) return [];

  const image = product.image_url?.trim() || null;

  return [
    {
      id: 'base',
      code: baseCode,
      title: baseCode,
      subtitle: 'Equipo',
      image,
    },
    {
      id: 'bundle-b',
      code: `${baseCode}-B`,
      title: `${baseCode}-B`,
      subtitle: '2 caseteras + 1 mueble',
      image,
    },
    {
      id: 'warranty-3',
      code: `${baseCode}-3`,
      title: `${baseCode}-3`,
      subtitle: '3 años de garantía',
      image,
    },
    {
      id: 'pack-emprendedor',
      code: `${baseCode}-PE`,
      title: 'Pack Emprendedor',
      subtitle: 'Papel adicional, Guillotina A3, Espiraladora y Espirales',
      image,
    },
  ];
}

function cloneSelection(selection: EquipmentSelectionState): EquipmentSelectionState {
  return Object.fromEntries(
    Object.entries(selection).map(([stepId, ids]) => [stepId, new Set(ids)]),
  );
}

function findStepOptionId(
  steps: readonly EquipmentConfigStep[],
  optionIds: readonly string[],
): string | undefined {
  for (const optionId of optionIds) {
    for (const step of steps) {
      if (step.options.some((option) => option.id === optionId)) return optionId;
    }
  }
  return undefined;
}

function hasIm460BundleOptions(steps: readonly EquipmentConfigStep[]): boolean {
  return Boolean(
    findStepOptionId(steps, ['casetera-adicional-423525']) &&
      findStepOptionId(steps, ['high-cabinet-a8']),
  );
}

export const PACK_EMPRENDEDOR_CART_OPTIONS: SelectedEquipmentOption[] = [
  {
    stepNumber: 9,
    stepTitle: 'Pack Emprendedor',
    optionId: 'pack-papel-adicional',
    optionName: 'Papel adicional',
    pricePen: 0,
  },
  {
    stepNumber: 9,
    stepTitle: 'Pack Emprendedor',
    optionId: 'pack-guillotina-a3',
    optionName: 'Guillotina A3',
    pricePen: 0,
  },
  {
    stepNumber: 9,
    stepTitle: 'Pack Emprendedor',
    optionId: 'pack-espiraladora',
    optionName: 'Espiraladora',
    pricePen: 0,
  },
  {
    stepNumber: 9,
    stepTitle: 'Pack Emprendedor',
    optionId: 'pack-espirales',
    optionName: 'Espirales',
    pricePen: 0,
  },
];

export function applyEquipmentSkuVariant(params: {
  variantId: EquipmentSkuVariantId;
  selection: EquipmentSelectionState;
  steps: readonly EquipmentConfigStep[];
  showNuevoVariantSelector: boolean;
}): {
  selection: EquipmentSelectionState;
  nuevoVariant: NuevoEquipmentVariantId;
} {
  const { variantId, steps, showNuevoVariantSelector } = params;
  const next = cloneSelection(params.selection);
  const accessories = new Set(next.accesorios ?? []);

  for (const optionId of BUNDLE_B_OPTION_IDS) {
    accessories.delete(optionId);
  }

  const useIm460Bundle = hasIm460BundleOptions(steps);
  let nuevoVariant: NuevoEquipmentVariantId = 'solo-equipo';

  if (variantId === 'bundle-b') {
    if (useIm460Bundle) {
      const caseteraId = findStepOptionId(steps, BUNDLE_B_CASETERA_OPTION_IDS);
      const cabinetId = findStepOptionId(steps, BUNDLE_B_CABINET_OPTION_IDS);
      if (caseteraId) accessories.add(caseteraId);
      if (cabinetId) accessories.add(cabinetId);
    } else if (showNuevoVariantSelector) {
      nuevoVariant = 'mesa-2-caseteras-mueble';
    } else {
      const caseteraId = findStepOptionId(steps, BUNDLE_B_CASETERA_OPTION_IDS);
      const cabinetId = findStepOptionId(steps, BUNDLE_B_CABINET_OPTION_IDS);
      if (caseteraId) accessories.add(caseteraId);
      if (cabinetId) accessories.add(cabinetId);
    }
    next.garantia = new Set();
  } else if (variantId === 'warranty-3') {
    next.garantia = new Set(['garantia-3y']);
  } else {
    next.garantia = new Set();
  }

  next.accesorios = accessories;
  return { selection: next, nuevoVariant };
}

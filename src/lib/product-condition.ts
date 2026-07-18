import {
  isRemanufacturadaProductName,
  isSeminuevaProductName,
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import type { Product } from '@/types/product';

export type ProductCondition = 'originales' | 'compatibles' | 'remanufacturados' | 'partes';

export const PRODUCT_CONDITIONS: readonly ProductCondition[] = [
  'originales',
  'compatibles',
  'remanufacturados',
  'partes',
] as const;

export const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
  originales: 'Originales',
  compatibles: 'Compatibles',
  remanufacturados: 'Remanufacturados',
  partes: 'Partes',
};

/** Pestañas en inicio/catálogo para multifuncionales e impresoras. */
export const EQUIPMENT_PRODUCT_CONDITIONS: readonly ProductCondition[] = [
  'originales',
  'compatibles',
  'remanufacturados',
  'partes',
];

export const EQUIPMENT_CONDITION_LABELS: Record<ProductCondition, string> = {
  originales: 'Nueva',
  compatibles: 'Seminueva',
  remanufacturados: 'Remanufacturada',
  partes: 'Partes',
};

/** Condición en tienda/equipos: sin «Partes» (solo Nueva / Seminueva / Remanufacturada). */
export const EQUIPMENT_STOREFRONT_CONDITIONS: readonly ProductCondition[] = [
  'originales',
  'compatibles',
  'remanufacturados',
] as const;

export function isEquipmentCatalogFamily(family: CatalogFamilySlug): boolean {
  return family === 'multifuncionales' || family === 'impresoras';
}

export function getConditionsForCatalogFamily(
  family: CatalogFamilySlug | null | undefined,
): readonly ProductCondition[] {
  if (family && isEquipmentCatalogFamily(family)) {
    return EQUIPMENT_PRODUCT_CONDITIONS;
  }
  return PRODUCT_CONDITIONS;
}

export function getProductConditionLabel(
  condition: ProductCondition,
  family: CatalogFamilySlug | null | undefined,
): string {
  if (family && isEquipmentCatalogFamily(family)) {
    return EQUIPMENT_CONDITION_LABELS[condition];
  }
  return PRODUCT_CONDITION_LABELS[condition];
}

export type CatalogFamilySlug =
  | 'multifuncionales'
  | 'impresoras'
  | 'toner-suministros'
  | 'repuestos';

const CONDITION_URL_ALIASES: Record<string, ProductCondition> = {
  originales: 'originales',
  nuevas: 'originales',
  nuevos: 'originales',
  nuevo: 'originales',
  compatibles: 'compatibles',
  seminuevas: 'compatibles',
  seminuevos: 'compatibles',
  seminuevo: 'compatibles',
  remanufacturados: 'remanufacturados',
  remanufacturadas: 'remanufacturados',
  recargas: 'remanufacturados',
  partes: 'partes',
  repuestos: 'partes',
};

function productHaystack(product: Product): string {
  return `${product.category ?? ''} ${product.name} ${product.description ?? ''}`.toLowerCase();
}

function categoryIndicatesFamily(
  category: string | null | undefined,
  family: CatalogFamilySlug,
): boolean {
  if (!category?.trim()) return false;
  const haystack = category.toLowerCase();

  switch (family) {
    case 'multifuncionales':
      return haystack.includes('multifuncional');
    case 'impresoras':
      return haystack.includes('impresor') && !haystack.includes('multifuncional');
    case 'toner-suministros':
      return (
        (haystack.includes('toner') ||
          haystack.includes('tóner') ||
          haystack.includes('suministro') ||
          haystack.includes('consumible') ||
          haystack.includes('cartucho')) &&
        !haystack.includes('repuesto')
      );
    case 'repuestos':
      return (
        haystack.includes('repuesto') ||
        haystack.includes('partes') ||
        haystack.includes('tambor') ||
        haystack.includes('fusor') ||
        haystack.includes('rodillo') ||
        haystack.includes('mantenimiento')
      );
    default:
      return false;
  }
}

function hasPartes(haystack: string): boolean {
  return (
    haystack.includes('repuesto') ||
    haystack.includes('partes') ||
    haystack.includes('tambor') ||
    haystack.includes('fusor') ||
    haystack.includes('fusing') ||
    haystack.includes('rodillo') ||
    haystack.includes('transfer roller') ||
    haystack.includes('waste toner') ||
    haystack.includes('waste bottle') ||
    haystack.includes('kit de mantenimiento') ||
    haystack.includes('unidad de imagen') ||
    haystack.includes('fusor')
  );
}

function hasRemanufactured(haystack: string): boolean {
  return (
    haystack.includes('remanufactur') ||
    haystack.includes('reacondicion') ||
    haystack.includes('recarga') ||
    haystack.includes('refill') ||
    haystack.includes('relleno')
  );
}

function hasCompatible(haystack: string): boolean {
  return (
    haystack.includes('compatible') ||
    haystack.includes('compat') ||
    haystack.includes('->') ||
    haystack.includes('alternativ') ||
    haystack.includes('seminuev') ||
    haystack.includes('semi-nuev') ||
    haystack.includes('semi nuev') ||
    haystack.includes('usad') ||
    haystack.includes('segunda mano') ||
    haystack.includes('open box')
  );
}

function hasOriginal(haystack: string): boolean {
  return (
    haystack.includes('original') ||
    haystack.includes('originales') ||
    haystack.includes('oem') ||
    haystack.includes('genuine') ||
    haystack.includes('nueva') ||
    haystack.includes('nuevo')
  );
}

function isSuppliesProduct(product: Product): boolean {
  return productMatchesCatalogFamily(product, 'toner-suministros');
}

function isPartsProduct(product: Product): boolean {
  return productMatchesCatalogFamily(product, 'repuestos') || hasPartes(productHaystack(product));
}

/** Equipo completo que no debe aparecer en la familia Repuestos (p. ej. seminuevas con «unidad de imagen»). */
export function isPrinterEquipmentProduct(product: Product): boolean {
  const haystack = productHaystack(product);
  if (categoryIndicatesFamily(product.category, 'repuestos')) {
    return false;
  }
  return (
    haystack.includes('impresora') ||
    (haystack.includes('multifuncional') && !haystack.includes('repuesto'))
  );
}

function productMatchesTonerSuministrosCondition(
  product: Product,
  condition: ProductCondition,
): boolean {
  const haystack = productHaystack(product);

  if (condition === 'remanufacturados') {
    return hasRemanufactured(haystack);
  }

  if (condition === 'compatibles') {
    return hasCompatible(haystack) && !hasRemanufactured(haystack);
  }

  if (condition === 'partes') {
    return false;
  }

  if (condition === 'originales') {
    return !hasRemanufactured(haystack) && !hasCompatible(haystack);
  }

  return false;
}

function productMatchesRepuestosSpareCondition(
  product: Product,
  condition: ProductCondition,
): boolean {
  const haystack = productHaystack(product);

  if (condition === 'remanufacturados') {
    return hasRemanufactured(haystack);
  }

  if (condition === 'compatibles') {
    return hasCompatible(haystack) && !hasRemanufactured(haystack);
  }

  if (condition === 'partes') {
    const categoryHint =
      product.category != null ? inferProductConditionFromText(product.category) : null;
    return categoryHint === 'partes';
  }

  if (condition === 'originales') {
    return !hasRemanufactured(haystack) && !hasCompatible(haystack);
  }

  return false;
}

/** Condición explícita en categoría o nombre del producto. */
export function inferProductConditionFromText(text: string): ProductCondition | null {
  const haystack = text.toLowerCase();

  if (haystack.includes('repuesto') || haystack.includes('partes')) return 'partes';
  if (hasPartes(haystack) && !haystack.includes('toner originales')) return 'partes';

  if (haystack.includes('toner originales') || haystack.includes('tóner originales')) {
    return 'originales';
  }
  if (hasRemanufactured(haystack)) return 'remanufacturados';
  if (hasCompatible(haystack)) return 'compatibles';
  if (hasOriginal(haystack)) return 'originales';

  if (haystack.includes('multifuncionales nuevas') || haystack.includes('impresoras laser nuevas')) {
    return 'originales';
  }
  if (haystack.includes('seminuevas')) return 'compatibles';
  if (haystack.includes('remanufacturadas')) return 'remanufacturados';

  if (haystack === 'toner' || (haystack.includes('toner') && !haystack.includes('originales'))) {
    return 'compatibles';
  }

  return null;
}

function productMatchesSuppliesCondition(
  product: Product,
  condition: ProductCondition,
): boolean {
  const haystack = productHaystack(product);

  if (hasPartes(haystack)) {
    if (condition === 'partes') {
      return true;
    }
    if (condition === 'remanufacturados') {
      return hasRemanufactured(haystack);
    }
    if (condition === 'compatibles') {
      return hasCompatible(haystack) && !hasRemanufactured(haystack);
    }
    if (condition === 'originales') {
      return !hasRemanufactured(haystack) && !hasCompatible(haystack);
    }
    return false;
  }

  if (condition === 'partes') {
    return hasPartes(haystack);
  }

  const categoryHint =
    product.category != null ? inferProductConditionFromText(product.category) : null;
  if (categoryHint !== null && categoryHint !== 'partes') {
    return condition === categoryHint;
  }

  if (condition === 'remanufacturados') {
    return hasRemanufactured(haystack);
  }

  if (condition === 'compatibles') {
    return hasCompatible(haystack) && !hasRemanufactured(haystack) && !hasPartes(haystack);
  }

  if (condition === 'originales') {
    if (hasRemanufactured(haystack) || hasCompatible(haystack) || hasPartes(haystack)) {
      return false;
    }
    return (
      hasOriginal(haystack) ||
      haystack.includes('toner') ||
      haystack.includes('cartucho') ||
      haystack.includes('print cartridge')
    );
  }

  return false;
}

function productMatchesEquipmentCondition(
  product: Product,
  condition: ProductCondition,
): boolean {
  if (condition === 'partes') {
    return isPartsProduct(product);
  }

  const name = String(product.name ?? '');

  // El nombre manda sobre una categoría de inventario mal asignada.
  if (isSeminuevaProductName(name)) {
    return condition === 'compatibles';
  }
  if (isRemanufacturadaProductName(name)) {
    return condition === 'remanufacturados';
  }
  if (productQualifiesAsNuevaEquipment(product)) {
    return condition === 'originales';
  }
  if (productQualifiesAsRemanufacturadaEquipment(product)) {
    return condition === 'remanufacturados';
  }
  if (productQualifiesAsSeminuevaEquipment(product)) {
    return condition === 'compatibles';
  }

  const categoryHint =
    product.category != null ? inferProductConditionFromText(product.category) : null;
  if (categoryHint !== null) {
    return condition === categoryHint;
  }

  const haystack = productHaystack(product);

  if (condition === 'remanufacturados') {
    return false;
  }

  if (condition === 'compatibles') {
    return hasCompatible(haystack) && !hasRemanufactured(haystack);
  }

  if (condition === 'originales') {
    return hasOriginal(haystack);
  }

  return false;
}

export function productMatchesCondition(
  product: Product,
  condition: ProductCondition,
  catalogFamily?: CatalogFamilySlug | null,
): boolean {
  if (
    catalogFamily === 'toner-suministros' &&
    productMatchesCatalogFamily(product, 'toner-suministros')
  ) {
    return productMatchesTonerSuministrosCondition(product, condition);
  }

  if (
    catalogFamily === 'repuestos' &&
    !isPrinterEquipmentProduct(product) &&
    (productMatchesCatalogFamily(product, 'repuestos') || hasPartes(productHaystack(product)))
  ) {
    return productMatchesRepuestosSpareCondition(product, condition);
  }

  if (
    catalogFamily !== 'toner-suministros' &&
    isPartsProduct(product) &&
    condition === 'partes'
  ) {
    return true;
  }

  if (condition === 'partes') {
    return isPartsProduct(product);
  }

  if (isSuppliesProduct(product)) {
    return productMatchesSuppliesCondition(product, condition);
  }

  return productMatchesEquipmentCondition(product, condition);
}

export function productMatchesCatalogFamily(
  product: Product,
  family: CatalogFamilySlug,
): boolean {
  if (categoryIndicatesFamily(product.category, family)) {
    return true;
  }

  const haystack = productHaystack(product);

  switch (family) {
    case 'multifuncionales':
      return haystack.includes('multifuncional');
    case 'impresoras':
      // Evitar falsos positivos como "impresiones" en tóner/repuestos.
      if (productMatchesCatalogFamily(product, 'toner-suministros')) return false;
      if (productMatchesCatalogFamily(product, 'repuestos')) return false;

      // Mantener solo los modelos permitidos en "Impresoras" (según requerimiento de tienda).
      // SP 3710DN, P 311, P502, P800, P801, P C600.
      return (
        /\bsp\s*3710\s*dn\b/i.test(haystack) ||
        /\bp\s*311\b/i.test(haystack) ||
        /\bp\s*502\b/i.test(haystack) ||
        /\bp\s*800\b/i.test(haystack) ||
        /\bp\s*801\b/i.test(haystack) ||
        /\bp\s*-?\s*c\s*600\b/i.test(haystack)
      );
    case 'toner-suministros':
      return (
        (haystack.includes('toner') ||
          haystack.includes('tóner') ||
          haystack.includes('suministro') ||
          haystack.includes('consumible') ||
          haystack.includes('cartucho')) &&
        !haystack.includes('repuesto')
      );
    case 'repuestos':
      if (isPrinterEquipmentProduct(product)) {
        return false;
      }
      return hasPartes(haystack);
    default:
      return false;
  }
}

export function parseProductCondition(value: string | null): ProductCondition | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  return CONDITION_URL_ALIASES[key] ?? null;
}

const CATEGORY_SLUG_TO_FAMILY: Partial<Record<string, CatalogFamilySlug>> = {
  multifuncionales: 'multifuncionales',
  impresoras: 'impresoras',
  'toner-suministros': 'toner-suministros',
  'toner-compatibles': 'toner-suministros',
  repuestos: 'repuestos',
};

export function catalogFamilyForCategorySlug(slug: string): CatalogFamilySlug | null {
  return CATEGORY_SLUG_TO_FAMILY[slug] ?? null;
}

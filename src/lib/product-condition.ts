import type { Product } from '@/types/product';

export type ProductCondition = 'nuevas' | 'seminuevas' | 'remanufacturadas';

export const PRODUCT_CONDITIONS: readonly ProductCondition[] = [
  'nuevas',
  'seminuevas',
  'remanufacturadas',
] as const;

export const PRODUCT_CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevas: 'Nuevas',
  seminuevas: 'Seminuevas',
  remanufacturadas: 'Remanufacturadas',
};

export type CatalogFamilySlug =
  | 'multifuncionales'
  | 'impresoras'
  | 'toner-suministros'
  | 'repuestos';

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
        haystack.includes('tambor') ||
        haystack.includes('fusor') ||
        haystack.includes('rodillo') ||
        haystack.includes('mantenimiento')
      );
    default:
      return false;
  }
}

function hasRemanufactured(haystack: string): boolean {
  return haystack.includes('remanufactur') || haystack.includes('reacondicion');
}

function hasSeminueva(haystack: string): boolean {
  return (
    haystack.includes('seminuev') ||
    haystack.includes('semi-nuev') ||
    haystack.includes('semi nuev') ||
    haystack.includes('usad') ||
    haystack.includes('segunda mano') ||
    haystack.includes('open box')
  );
}

function hasNueva(haystack: string): boolean {
  return haystack.includes('nueva') || haystack.includes('nuevo');
}

/** Condición explícita en categoría de inventario (p. ej. «Multifuncionales Nuevas»). */
export function inferProductConditionFromText(text: string): ProductCondition | null {
  const haystack = text.toLowerCase();
  if (hasRemanufactured(haystack)) return 'remanufacturadas';
  if (hasSeminueva(haystack)) return 'seminuevas';
  if (hasNueva(haystack)) return 'nuevas';
  return null;
}

export function productMatchesCondition(
  product: Product,
  condition: ProductCondition,
): boolean {
  const categoryHint =
    product.category != null ? inferProductConditionFromText(product.category) : null;
  if (categoryHint !== null) {
    return condition === categoryHint;
  }

  const haystack = productHaystack(product);

  if (condition === 'remanufacturadas') {
    return hasRemanufactured(haystack);
  }

  if (condition === 'seminuevas') {
    return hasSeminueva(haystack) && !hasRemanufactured(haystack);
  }

  if (hasRemanufactured(haystack) || hasSeminueva(haystack)) {
    return false;
  }

  return hasNueva(haystack) || (!hasRemanufactured(haystack) && !hasSeminueva(haystack));
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
        haystack.includes('tambor') ||
        haystack.includes('fusor') ||
        haystack.includes('rodillo') ||
        haystack.includes('kit de mantenimiento')
      );
    default:
      return false;
  }
}

export function parseProductCondition(value: string | null): ProductCondition | null {
  if (value === 'nuevas' || value === 'seminuevas' || value === 'remanufacturadas') {
    return value;
  }
  return null;
}

const CATEGORY_SLUG_TO_FAMILY: Partial<Record<string, CatalogFamilySlug>> = {
  multifuncionales: 'multifuncionales',
  impresoras: 'impresoras',
  'toner-suministros': 'toner-suministros',
  repuestos: 'repuestos',
};

export function catalogFamilyForCategorySlug(slug: string): CatalogFamilySlug | null {
  return CATEGORY_SLUG_TO_FAMILY[slug] ?? null;
}

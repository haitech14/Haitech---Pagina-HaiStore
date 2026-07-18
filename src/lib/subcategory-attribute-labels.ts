import { inferColor, resolveFormatoPapelBadgeLabels } from '@/lib/category-catalog-filters';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import type { Product } from '@/types/product';

const MAX_ATTRIBUTE_LABELS = 3;

/** Copy breve por condición cuando no hay atributos agregables del inventario. */
const CONDITION_ATTRIBUTE_FALLBACKS: Array<{ match: RegExp; labels: string[] }> = [
  {
    match: /remanufactur|reacondicion/i,
    labels: ['Calidad renovada', 'Garantía', 'Precio accesible'],
  },
  {
    match: /seminuev|ligero\s*uso/i,
    labels: ['Revisadas', 'Garantía', 'Listas para usar'],
  },
  {
    match: /nueva|nuevo/i,
    labels: ['Garantía de fábrica', 'Última generación', 'Soporte oficial'],
  },
  {
    match: /original/i,
    labels: ['Original', 'Rendimiento certificado'],
  },
  {
    match: /compatible/i,
    labels: ['Compatible', 'Buen rendimiento'],
  },
];

function productMatchesSubcategory(
  product: Product,
  sub: { name: string; inventoryLabels?: string[] },
): boolean {
  for (const label of sub.inventoryLabels ?? []) {
    if (productMatchesCategoryFilter(product, label)) return true;
  }
  const haystack = `${product.category ?? ''} ${product.name}`.toLowerCase();
  const name = sub.name.toLowerCase();
  if (name.includes('remanufactur')) {
    return haystack.includes('remanufactur') || haystack.includes('reacondicion');
  }
  if (name.includes('seminuev')) {
    return haystack.includes('seminuev') || haystack.includes('ligero');
  }
  if (name.includes('nueva') || name.includes('nuevo')) {
    return (
      (haystack.includes('nueva') || haystack.includes('nuevo')) &&
      !haystack.includes('remanufactur') &&
      !haystack.includes('seminuev')
    );
  }
  return false;
}

/**
 * Atributos cortos de una subcategoría: Color/B/N, formatos y fallbacks por condición.
 */
export function resolveSubcategoryAttributeLabels(
  sub: { name: string; tagline?: string | null; inventoryLabels?: string[]; productCount?: number },
  products: Product[] = [],
): string[] {
  const matched = products.filter((product) => productMatchesSubcategory(product, sub));
  const labels: string[] = [];
  const seen = new Set<string>();

  const push = (label: string | null | undefined) => {
    const trimmed = label?.trim();
    if (!trimmed || seen.has(trimmed.toLowerCase())) return;
    if (labels.length >= MAX_ATTRIBUTE_LABELS) return;
    seen.add(trimmed.toLowerCase());
    labels.push(trimmed);
  };

  if (sub.tagline?.trim()) {
    // Tagline largo → no como chip; se usa en UI aparte si hace falta.
  }

  let hasColor = false;
  let hasBn = false;
  const formatos = new Set<string>();

  for (const product of matched) {
    if (inferColor(product) === 'Color') hasColor = true;
    else hasBn = true;
    for (const formato of resolveFormatoPapelBadgeLabels(product)) {
      formatos.add(formato);
    }
  }

  if (hasColor) push('Color');
  if (hasBn) push('B/N');
  for (const formato of [...formatos].sort()) {
    push(formato);
  }

  if (labels.length < MAX_ATTRIBUTE_LABELS) {
    for (const entry of CONDITION_ATTRIBUTE_FALLBACKS) {
      if (!entry.match.test(sub.name)) continue;
      for (const fallback of entry.labels) {
        push(fallback);
        if (labels.length >= MAX_ATTRIBUTE_LABELS) break;
      }
      break;
    }
  }

  if (labels.length === 0 && typeof sub.productCount === 'number' && sub.productCount > 0) {
    push(`${sub.productCount} productos`);
  }

  return labels;
}

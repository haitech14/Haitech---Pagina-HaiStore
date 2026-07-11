import {
  CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS,
} from '@/data/catalog-format-spotlight';
import {
  FORMATO_PAPEL_ATTR,
  inferColor,
  inferFormatoPapelFromModel,
  inferProduccionTier,
  PRODUCTION_FILTER_OPTIONS,
  productAttributeKeys,
  resolveFormatoPapel,
} from '@/lib/category-catalog-filters';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import { buildProductDetailBadges, isPrinterProduct } from '@/lib/product-detail-badges';
import type { Product } from '@/types/product';

function attributeKey(name: string, value: string): string {
  return `${name}::${value}`;
}

export interface ProductCardSpecBadge {
  id: string;
  label: string;
}

function productMatchesPatterns(product: Product, patterns: readonly RegExp[]): boolean {
  const haystack = `${product.name} ${product.category ?? ''}`;
  return patterns.some((pattern) => pattern.test(haystack));
}

function resolveConditionBadge(product: Product): ProductCardSpecBadge | null {
  if (productQualifiesAsSeminuevaEquipment(product)) {
    return { id: 'condicion', label: 'Seminueva' };
  }
  if (productQualifiesAsNuevaEquipment(product)) {
    return { id: 'condicion', label: 'Nueva' };
  }

  const fromAttr = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (row) => row.id === 'condicion',
  );
  const value = fromAttr?.value.trim() ?? '';
  if (/seminov/i.test(value)) return { id: 'condicion', label: 'Seminueva' };
  if (/^nuevo$/i.test(value) || /^nueva$/i.test(value)) {
    return { id: 'condicion', label: 'Nueva' };
  }

  return null;
}

function resolveFormatoBadge(product: Product): ProductCardSpecBadge | null {
  const keys = productAttributeKeys(product);
  const hasA4Attr = keys.has(attributeKey(FORMATO_PAPEL_ATTR, 'A4'));
  const hasA3Attr = keys.has(attributeKey(FORMATO_PAPEL_ATTR, 'A3'));
  const fromModel = inferFormatoPapelFromModel(product);
  const crossList =
    fromModel === 'A3' && productMatchesPatterns(product, CATALOG_FORMAT_CROSS_LIST_TO_A4_PATTERNS);

  if (hasA4Attr && hasA3Attr) {
    return { id: 'formato', label: 'A4 · A3' };
  }
  if (crossList) {
    return { id: 'formato', label: 'A4 · A3' };
  }
  if (hasA3Attr || fromModel === 'A3') {
    return { id: 'formato', label: 'A3' };
  }
  if (hasA4Attr || fromModel === 'A4') {
    return { id: 'formato', label: 'A4' };
  }

  const resolved = resolveFormatoPapel(product);
  return { id: 'formato', label: resolved };
}

function resolveColorBadge(product: Product): ProductCardSpecBadge {
  return { id: 'color', label: inferColor(product) };
}

function resolveProduccionBadge(product: Product): ProductCardSpecBadge | null {
  const keys = productAttributeKeys(product);
  for (const option of PRODUCTION_FILTER_OPTIONS) {
    if (keys.has(option.key)) {
      return { id: 'produccion', label: option.sidebarLabel };
    }
  }

  const tier = inferProduccionTier(product);
  const option = PRODUCTION_FILTER_OPTIONS.find((row) => row.value === tier);
  return option ? { id: 'produccion', label: option.sidebarLabel } : null;
}

/** Badges compactos bajo el título en tarjetas de equipos (condición, formato, color, producción). */
export function buildProductCardSpecBadges(product: Product): ProductCardSpecBadge[] {
  if (!isPrinterProduct(product)) return [];

  const badges: ProductCardSpecBadge[] = [];
  const condicion = resolveConditionBadge(product);
  if (condicion) badges.push(condicion);

  const formato = resolveFormatoBadge(product);
  if (formato) badges.push(formato);

  badges.push(resolveColorBadge(product));

  const produccion = resolveProduccionBadge(product);
  if (produccion) badges.push(produccion);

  return badges;
}

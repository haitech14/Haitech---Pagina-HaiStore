import {
  inferColor,
  inferProduccionTier,
  PRODUCTION_FILTER_OPTIONS,
  productAttributeKeys,
  resolveFormatoPapelBadgeLabels,
} from '@/lib/category-catalog-filters';
import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from '@/lib/inventory-product-name';
import { buildProductDetailBadges, isPrinterProduct } from '@/lib/product-detail-badges';
import type { Product } from '@/types/product';

export interface ProductCardSpecBadge {
  id: string;
  label: string;
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

function resolveFormatoBadges(product: Product): ProductCardSpecBadge[] {
  return resolveFormatoPapelBadgeLabels(product).map((label, index) => ({
    id: index === 0 ? 'formato' : `formato-${label.toLowerCase()}`,
    label,
  }));
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

  badges.push(...resolveFormatoBadges(product));
  badges.push(resolveColorBadge(product));

  const produccion = resolveProduccionBadge(product);
  if (produccion) badges.push(produccion);

  return badges;
}

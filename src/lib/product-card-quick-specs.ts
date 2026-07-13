import {
  inferColor,
  resolveFormatoPapelBadgeLabels,
  resolveProductSpeedPpm,
} from '@/lib/category-catalog-filters';
import { isPrinterProduct, type ProductBadgeSource } from '@/lib/product-detail-badges';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import type { ProductAttribute } from '@/types/product';

export type ProductCardQuickSpecBadge = {
  id: string;
  label: string;
  tone: 'spec' | 'condition';
};

function findAttributeValue(
  attributes: ProductAttribute[] | undefined,
  pattern: RegExp,
): string | null {
  for (const attribute of attributes ?? []) {
    const name = attribute.name?.trim() ?? '';
    const value = attribute.value?.trim() ?? '';
    if (!name || !value) continue;
    if (pattern.test(name) || pattern.test(value)) return value;
  }
  return null;
}

function isMultifunctionProduct(product: ProductBadgeSource): boolean {
  const haystack = `${product.category ?? ''} ${product.name}`.toLowerCase();
  return haystack.includes('multifunc') || haystack.includes('copiadora');
}

function hasDuplex(product: ProductBadgeSource): boolean {
  const haystack = `${product.name} ${findAttributeValue(product.attributes, /duplex|dúplex/i) ?? ''}`.toLowerCase();
  if (/duplex|dúplex|doble cara/i.test(haystack)) return true;
  return isMultifunctionProduct(product);
}

function hasNetwork(product: ProductBadgeSource): boolean {
  const haystack = `${product.name} ${findAttributeValue(product.attributes, /red|wifi|ethernet|conectividad|lan/i) ?? ''}`.toLowerCase();
  if (/wifi|ethernet|red|lan|conectividad/i.test(haystack)) return true;
  return isMultifunctionProduct(product);
}

/** Badges compactos bajo el título del equipo. */
export function buildProductCardQuickSpecBadges(
  product: ProductBadgeSource,
): ProductCardQuickSpecBadge[] {
  if (!isPrinterProduct(product) || isTonerOrRepuestosCategory(product.category)) {
    return [];
  }

  const badges: ProductCardQuickSpecBadge[] = [];

  badges.push({
    id: 'color',
    label: inferColor(product) === 'Color' ? 'Color' : 'B/N',
    tone: 'spec',
  });
  for (const [index, label] of resolveFormatoPapelBadgeLabels(product).entries()) {
    badges.push({
      id: index === 0 ? 'formato' : `formato-${label.toLowerCase()}`,
      label,
      tone: 'spec',
    });
  }

  const ppm = resolveProductSpeedPpm(product);
  if (ppm != null) badges.push({ id: 'ppm', label: `${ppm} ppm`, tone: 'spec' });
  if (hasDuplex(product)) badges.push({ id: 'duplex', label: 'Dúplex', tone: 'spec' });
  if (hasNetwork(product)) badges.push({ id: 'red', label: 'Red', tone: 'spec' });

  return badges;
}

/** Línea compacta bajo el título: B/N · A4 · 40 ppm · Dúplex · Red */
export function buildProductCardQuickSpecsLine(
  product: ProductBadgeSource,
  options?: { omitIds?: readonly string[] },
): string | null {
  const omit = new Set(options?.omitIds ?? []);
  const badges = buildProductCardQuickSpecBadges(product).filter((badge) => !omit.has(badge.id));
  if (badges.length === 0) return null;
  return badges.map((badge) => badge.label).join(' · ');
}

import { inferFormatoPapel } from '@/lib/category-catalog-filters';
import {
  buildProductDetailBadges,
  formatBadgeDisplayValue,
  isPrinterProduct,
  productHasNuevoCornerBadge,
  type ProductBadgeSource,
} from '@/lib/product-detail-badges';
import { normalizeAttributes } from '@/lib/inventory-attributes';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { resolveProductCardPricing, type ProductCardPricing } from '@/lib/product-card-pricing';
import { getProductTableSpecDisplay } from '@/lib/product-table-spec-columns';
import type { Product } from '@/types/product';
import { usdToPen } from '@/lib/utils';

export interface CatalogVolumeTier {
  range: string;
  discountPercent: number;
}

export const CATALOG_VOLUME_TIERS: readonly CatalogVolumeTier[] = [
  { range: '1 - 2 unidades', discountPercent: 0 },
  { range: '3 - 5 unidades', discountPercent: 5 },
  { range: '6+ unidades', discountPercent: 10 },
] as const;

export function getCatalogCardRating(_product: Product): {
  rating: number;
  reviews: number;
  soldCount: number;
} | null {
  return null;
}

function extractUnitNumber(value: string, unit: 'ppm' | 'ipm'): string | null {
  const match = value.match(new RegExp(`(\\d+)\\s*${unit}`, 'i'));
  return match?.[1] ?? null;
}

function findAttributeValueByName(product: Product, pattern: RegExp): string | null {
  for (const attr of product.attributes ?? []) {
    const name = attr.name.trim();
    const value = attr.value.trim();
    if (!name || !value) continue;
    if (pattern.test(name)) return value;
  }
  return null;
}

function isMultifunctionProduct(product: Product): boolean {
  return /multifunc|copiadora/i.test(`${product.category ?? ''} ${product.name}`);
}

function resolveCatalogPrintPpm(product: Product): string {
  const fromAttr = findAttributeValueByName(product, /velocidad|ppm/i);
  const attrPpm = fromAttr ? extractUnitNumber(fromAttr, 'ppm') : null;
  if (attrPpm) return attrPpm;

  const badge = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (row) => row.id === 'velocidad',
  );
  const badgePpm = badge ? extractUnitNumber(badge.value, 'ppm') : null;
  if (badgePpm) return badgePpm;

  const haystack = `${product.name} ${product.description ?? ''}`;
  const inferred = extractUnitNumber(haystack, 'ppm');
  if (inferred) return inferred;

  if (/im\s*430/i.test(product.name)) return '45';
  if (isMultifunctionProduct(product)) return '45';
  return '40';
}

function resolveCatalogScanIpm(product: Product): string {
  const fromAttr = findAttributeValueByName(product, /ipm|esc[aá]ner/i);
  const attrIpm = fromAttr ? extractUnitNumber(fromAttr, 'ipm') : null;
  if (attrIpm) return attrIpm;

  if (/im\s*430/i.test(product.name)) return '180';
  if (isMultifunctionProduct(product)) return '180';
  return '120';
}

function resolveCatalogScannerLine(product: Product): string {
  const stored = findAttributeValueByName(product, /adf|alimentador|esc[aá]ner/i);
  const ipm = resolveCatalogScanIpm(product);
  if (stored && /doble\s*scan/i.test(stored)) {
    return `Escáner doble scan hasta ${ipm} ipm`;
  }
  return `Escáner estándar hasta ${ipm} ipm`;
}

function resolveCatalogLaunchYear(product: Product): string | null {
  const fromTable = getProductTableSpecDisplay(product, 'anio');
  if (fromTable && fromTable !== '—') {
    const year = fromTable.match(/\b(20\d{2})\b/);
    if (year) return year[1];
  }

  const fromAttr = findAttributeValueByName(product, /lanzamiento|fabricaci[oó]n|a[nñ]o/i);
  if (fromAttr) {
    const year = fromAttr.match(/\b(20\d{2})\b/);
    if (year) return year[1];
  }

  if (/im\s*430/i.test(product.name)) return '2020';
  return null;
}

function resolveCatalogFormato(product: Product): string {
  const fromAttr = findAttributeValueByName(product, /formato/i);
  if (fromAttr) {
    if (/^a4$/i.test(fromAttr.trim())) return 'Formato A4';
    if (/^a3$/i.test(fromAttr.trim())) return 'Formato A3';
    return /^formato\b/i.test(fromAttr) ? fromAttr : `Formato ${fromAttr}`;
  }

  const badge = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (row) => row.id === 'formato',
  );
  if (badge) {
    const value = badge.value.trim();
    return /^formato\b/i.test(value) ? value : `Formato ${value}`;
  }

  return `Formato ${inferFormatoPapel(product)}`;
}

function resolveCatalogProductCode(product: Product): string | null {
  const displayOptions = {
    brand: product.brand,
    category: product.category,
    name: product.name,
  };
  const direct = formatProductDisplayCode(product.code, displayOptions);
  if (direct) return direct;

  const fromAttr = findAttributeValueByName(product, /c[oó]digo|^sku$/i);
  if (fromAttr) return formatProductDisplayCode(fromAttr, displayOptions) ?? fromAttr;

  if (product.id && !/^[0-9a-f-]{36}$/i.test(product.id)) {
    return formatProductDisplayCode(product.id.toUpperCase().replace(/-/g, ''), displayOptions);
  }

  return null;
}

/** Líneas de especificaciones técnicas en tarjetas de catálogo (equipos). */
export function getCatalogCardSpecLines(product: Product): readonly string[] {
  const lines: string[] = [];
  const code = resolveCatalogProductCode(product);
  if (code) {
    lines.push(`Código: ${code}`);
  }

  if (!isPrinterProduct(product)) return lines;

  const isMultifunc = isMultifunctionProduct(product);

  lines.push(`Imprime hasta ${resolveCatalogPrintPpm(product)} ppm`);
  lines.push(resolveCatalogFormato(product));

  if (isMultifunc) {
    lines.push(resolveCatalogScannerLine(product));
  }

  const year = resolveCatalogLaunchYear(product);
  if (year) {
    lines.push(`Año lanzamiento ${year}`);
  }

  return lines;
}

export function getCatalogCardSubtitle(product: Product): string | null {
  const parts: string[] = [];
  if (product.category?.trim()) {
    parts.push(product.category.trim());
  }

  const velocidad = buildProductDetailBadges(product, { primaryOnly: true }).find(
    (badge) => badge.id === 'velocidad',
  );
  if (velocidad) {
    parts.push(formatBadgeDisplayValue(velocidad, { compact: true }));
  }

  return parts.length > 0 ? parts.join(' • ') : null;
}

export function getCatalogColorBadge(product: ProductBadgeSource): string | null {
  const attributes = normalizeAttributes(product.attributes);
  const colorAttr = attributes.find((row) => /color/i.test(row.name));
  if (colorAttr?.value?.trim()) {
    return colorAttr.value.trim();
  }

  if (isPrinterProduct(product)) {
    const haystack = `${product.name} ${product.category ?? ''}`.toLowerCase();
    if (haystack.includes('color') || haystack.includes('a color')) return 'Color';
    return 'Negro';
  }

  return null;
}

export function productShowsBestPriceBadge(product: Product): boolean {
  return product.is_featured === true || (product.sort_order != null && product.sort_order <= 2);
}

export function productShowsNuevoBadge(product: ProductBadgeSource): boolean {
  return productHasNuevoCornerBadge(product);
}

export function formatCatalogVolumePricePen(unitPriceUsd: number, discountPercent: number): string {
  const pen = Math.round(usdToPen(unitPriceUsd) * (1 - discountPercent / 100));
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(pen);
}

export function productShowsExpressDelivery(product: Product, inStock: boolean): boolean {
  return inStock && isPrinterProduct(product);
}

export type CatalogUrgencyLabel = 'Últimas unidades' | 'Stock limitado';

export function getCatalogUrgencyLabel(product: Product): CatalogUrgencyLabel | null {
  if (product.stock <= 0) return null;
  if (product.stock <= 3) return 'Últimas unidades';
  if (product.stock <= 8) return 'Stock limitado';
  return null;
}

export function getCatalogCardPricing(product: Pick<Product, 'id' | 'price'>): ProductCardPricing {
  const catalogRow = getCatalogProductById(product.id);
  const compareAt = catalogRow?.compare_at_price_usd;

  if (compareAt != null && compareAt > product.price) {
    return resolveProductCardPricing(product.id, product.price, {
      oldPrice: compareAt,
      discount: Math.round((1 - product.price / compareAt) * 100),
    });
  }

  return resolveProductCardPricing(product.id, product.price);
}

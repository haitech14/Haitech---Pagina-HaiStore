import { normalizeAttributes } from '@/lib/inventory-attributes';
import type { ProductAttribute } from '@/types/product';

/** Datos mínimos para generar badges (ficha, tarjetas, carrusel). */
export interface ProductBadgeSource {
  id: string;
  name: string;
  category?: string | null;
  brand?: string | null;
  attributes?: ProductAttribute[];
}

export interface ProductDetailBadge {
  id: string;
  label: string;
  value: string;
}

const BADGE_SPECS: readonly {
  id: string;
  label: string;
  match: readonly string[];
}[] = [
  { id: 'condicion', label: 'Condición', match: ['condición', 'condicion', 'estado'] },
  { id: 'velocidad', label: 'Velocidad', match: ['velocidad', 'ppm', 'velocidad de impresión'] },
  { id: 'formato', label: 'Formato', match: ['formato', 'formato papel', 'tamaño'] },
  { id: 'adf', label: 'ADF', match: ['adf', 'alimentador (adf)', 'alimentador', 'escáner adf'] },
];

function normalizeAttrName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function attributeValue(attributes: ProductAttribute[], match: readonly string[]): string | null {
  for (const row of attributes) {
    const key = normalizeAttrName(row.name);
    if (!key) continue;
    if (match.some((needle) => key === needle || key.includes(needle))) {
      const value = row.value?.trim();
      if (value) return value;
    }
  }
  return null;
}

function isPrinterProduct(product: ProductBadgeSource): boolean {
  const text = `${product.category ?? ''} ${product.name}`.toLowerCase();
  return (
    text.includes('impres') ||
    text.includes('multifunc') ||
    text.includes('plotter') ||
    text.includes('ricoh') ||
    text.includes('bizhub')
  );
}

function isIm430f(product: ProductBadgeSource): boolean {
  return product.id === 'ricoh-im-430f' || product.name.toLowerCase().includes('im 430');
}

/** Texto visible en tarjetas (sin prefijo «Condición:», etc.). */
export function formatBadgeDisplayValue(
  badge: ProductDetailBadge,
  options?: { compact?: boolean },
): string {
  const compact = options?.compact === true;
  const value = badge.value.trim();
  if (badge.id === 'formato' && !/^formato\b/i.test(value)) {
    return compact ? value : `Formato ${value}`;
  }
  if (badge.id === 'adf' && !/^adf\b/i.test(value)) {
    if (compact) {
      if (/doble\s*scan/i.test(value)) return 'ADF D.Scan';
      if (/est[aá]ndar/i.test(value)) return 'ADF Std.';
      return value.length > 10 ? `ADF ${value.slice(0, 8)}…` : `ADF ${value}`;
    }
    return `ADF ${value}`;
  }
  if (badge.id === 'condicion' && /^nuevo$/i.test(value)) {
    return 'Nuevo';
  }
  return value;
}

const PRIMARY_BADGE_IDS = new Set(BADGE_SPECS.map((spec) => spec.id));

export function isPrimaryProductBadge(id: string): boolean {
  return PRIMARY_BADGE_IDS.has(id);
}

function defaultBadges(product: ProductBadgeSource): ProductDetailBadge[] {
  if (isIm430f(product)) {
    return [
      { id: 'condicion', label: 'Condición', value: 'Nuevo' },
      { id: 'velocidad', label: 'Velocidad', value: '40 ppm' },
      { id: 'formato', label: 'Formato', value: 'A4' },
      { id: 'adf', label: 'ADF', value: 'Doble Scan' },
    ];
  }

  if (isPrinterProduct(product)) {
    return [
      { id: 'condicion', label: 'Condición', value: 'Nuevo' },
      { id: 'velocidad', label: 'Velocidad', value: '40 ppm' },
      { id: 'formato', label: 'Formato', value: 'A4' },
      { id: 'adf', label: 'ADF', value: 'Estándar' },
    ];
  }

  return [];
}

export function buildProductDetailBadges(
  product: ProductBadgeSource,
  options?: { primaryOnly?: boolean },
): ProductDetailBadge[] {
  const attributes = normalizeAttributes(product.attributes);
  const printer = isPrinterProduct(product);
  const defaults = printer ? defaultBadges(product) : [];
  const badges: ProductDetailBadge[] = [];

  for (const spec of BADGE_SPECS) {
    const fromAttr = attributeValue(attributes, spec.match);
    const fallback = defaults.find((row) => row.id === spec.id);
    const value = fromAttr ?? (printer ? fallback?.value : null);
    if (value) {
      badges.push({ id: spec.id, label: spec.label, value });
    }
  }

  if (!options?.primaryOnly) {
    for (const row of attributes) {
      if (!row.name?.trim() || !row.value?.trim()) continue;
      const covered = BADGE_SPECS.some((spec) => attributeValue([row], spec.match));
      if (!covered) {
        badges.push({ id: row.id, label: row.name.trim(), value: row.value.trim() });
      }
    }
  }

  return badges;
}

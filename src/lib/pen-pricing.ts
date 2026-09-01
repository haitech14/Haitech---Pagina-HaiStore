import { categories } from '@/data/categories';
import { normalizeCategoryName } from '@/lib/catalog-featured';
import { productCategoryTags } from '@/lib/inventory-categories';

const IMPRESORA_MULTIFUNCIONAL_INVENTORY_LABELS = categories
  .filter((category) => category.slug === 'impresoras' || category.slug === 'multifuncionales')
  .flatMap((category) => category.inventoryCategories ?? [category.name])
  .map((label) => normalizeCategoryName(label));

/** Impresoras y multifuncionales: precios en enteros (sin centavos) en tablas de inventario. */
export function isImpresoraOrMultifuncionalCategory(
  category: string | null | undefined,
): boolean {
  const tags = productCategoryTags({ category: category ?? null });
  if (tags.length === 0) {
    return IMPRESORA_MULTIFUNCIONAL_INVENTORY_LABELS.includes(
      normalizeCategoryName(category ?? ''),
    );
  }
  return tags.some((tag) =>
    IMPRESORA_MULTIFUNCIONAL_INVENTORY_LABELS.includes(normalizeCategoryName(tag)),
  );
}

/** Equipos de vitrina (no tóner/repuestos): USD al 49/99 más cercano, centavos .00. */
export function isEquipmentDisplayPriceCategory(
  category: string | null | undefined,
): boolean {
  if (isTonerOrRepuestosCategory(category)) return false;
  const normalized = (category ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return (
    isImpresoraOrMultifuncionalCategory(category) ||
    /escan|scanner|plotter|formato\s*ancho|laptop|monitor|equipo|fotocop|impresor|multifunc/i.test(
      normalized,
    )
  );
}

/**
 * Redondeo comercial en USD enteros al 49 o 99 más cercano (centavos .00).
 * Ej.: 438.30 → 449; 964.62 → 949; 993.86 → 999.
 */
export function roundUsdToNearestFortyNineOrNinetyNine(usd: number): number {
  if (!Number.isFinite(usd) || usd <= 0) return 0;

  const n = Math.round(usd);
  const base = Math.floor(n / 100);
  const candidates = new Set<number>();

  for (const block of [base - 1, base, base + 1]) {
    if (block < 0) continue;
    const c49 = block * 100 + 49;
    const c99 = block * 100 + 99;
    if (c49 > 0) candidates.add(c49);
    if (c99 > 0) candidates.add(c99);
  }

  if (n < 100) {
    candidates.add(49);
    candidates.add(99);
  }

  let best = [...candidates][0] ?? 99;
  let bestDistance = Math.abs(n - best);

  for (const candidate of candidates) {
    const distance = Math.abs(n - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

export function roundEquipmentDisplayUsd(usd: number): number {
  return roundUsdToNearestFortyNineOrNinetyNine(usd);
}

/**
 * Redondeo comercial en soles enteros al dígito 9 más cercano.
 * Ej.: 2287 → 2289; 2190 → 2189; 2429 (ya termina en 9) se mantiene.
 */
export function roundPenToNearestNine(pen: number): number {
  if (!Number.isFinite(pen) || pen <= 0) return 0;

  const n = Math.round(pen);
  const base = Math.floor(n / 10);
  const candidates = [base * 10 - 1, base * 10 + 9].filter((value) => value > 0);

  let best = candidates[0] ?? 9;
  let bestDistance = Math.abs(n - best);

  for (const candidate of candidates) {
    const distance = Math.abs(n - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}

/** Tóner y repuestos mantienen precio con centavos; el resto usa redondeo al 9. */
export function isTonerOrRepuestosCategory(category: string | null | undefined): boolean {
  const normalized = (category ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  return /toner|repuesto/.test(normalized);
}

/**
 * Redondeo comercial en soles: centésimas que terminan en 9 (segundo decimal = 9).
 * Ej.: 33.30 → 33.29; 10.04 → 10.09; 10.09 (ya termina en 9) se mantiene.
 */
export function roundPenCharm99(pen: number): number {
  if (!Number.isFinite(pen) || pen <= 0) return 0;

  const centavos = Math.round(pen * 100);
  const quotient = Math.floor(centavos / 10);

  const candidates = [
    (quotient - 1) * 10 + 9,
    quotient * 10 + 9,
    (quotient + 1) * 10 + 9,
  ].filter((value) => value >= 9);

  let best = candidates[0] ?? 9;
  let bestDistance = Math.abs(centavos - best);

  for (const candidate of candidates) {
    const distance = Math.abs(centavos - candidate);
    if (distance < bestDistance || (distance === bestDistance && candidate > best)) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best / 100;
}

/** Conversión USD → PEN sin redondeo comercial (p. ej. precio de compra). */
export function usdToPenPrecise(usd: number, exchangeRate: number): number {
  if (!Number.isFinite(usd) || usd <= 0 || exchangeRate <= 0) return 0;
  return Math.round(usd * exchangeRate * 100) / 100;
}

export function usdToPenCharm(usd: number, exchangeRate: number): number {
  if (!Number.isFinite(usd) || usd <= 0 || exchangeRate <= 0) return 0;
  return roundPenCharm99(usd * exchangeRate);
}

export function penCharmToUsd(pen: number, exchangeRate: number): number {
  if (!Number.isFinite(pen) || pen <= 0 || exchangeRate <= 0) return 0;
  return Math.round((pen / exchangeRate) * 100) / 100;
}

export function formatPenInteger(pen: number): string {
  const rounded = Math.round(pen * 100) / 100;
  const hasFraction = Math.abs(rounded % 1) > 0.001;

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rounded);
}

/** Soles redondeados al entero más cercano, sin centavos. */
export function formatPenWhole(pen: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 0,
  }).format(Math.round(pen));
}

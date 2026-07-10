import { RENDIMIENTO_ATTR } from '@/lib/category-catalog-filters';
import { ensureFullPrices } from '@/lib/roles';
import { usdToPen } from '@/lib/utils';
import type { Product } from '@/types/product';

export interface ProductYieldInfo {
  pages: number | null;
  label: string | null;
}

/** Extrae el rendimiento en páginas desde atributos o nombre del producto. */
export function extractProductYield(product: Pick<Product, 'name' | 'attributes' | 'description'>): ProductYieldInfo {
  const rendAttr = product.attributes?.find(
    (attr) =>
      attr.name === RENDIMIENTO_ATTR ||
      attr.name.toLowerCase().includes('rendimiento'),
  );

  if (rendAttr?.value?.trim()) {
    const pages = parseYieldPageCount(rendAttr.value);
    return { pages, label: rendAttr.value.trim() };
  }

  const fromName = parseYieldFromText(product.name);
  if (fromName.pages) {
    return fromName;
  }

  if (product.description?.trim()) {
    const fromDescription = parseYieldFromText(product.description);
    if (fromDescription.pages) {
      return fromDescription;
    }
  }

  return { pages: null, label: null };
}

function parseYieldPageCount(text: string): number | null {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return null;

  const explicit = normalized.match(/([\d][\d.,]*)\s*(?:p[aá]ginas?|pp|copias?)/i);
  if (explicit?.[1]) {
    return parseDigitsToInt(explicit[1]);
  }

  const loose = normalized.match(/([\d][\d.,]{2,})/);
  if (loose?.[1]) {
    return parseDigitsToInt(loose[1]);
  }

  return null;
}

function parseYieldFromText(text: string): ProductYieldInfo {
  const parenMatch = text.match(/\(([\d,.\s]+(?:5%[- ]?A4|p[aá]ginas?)[^)]*)\)/i);
  if (parenMatch?.[1]) {
    const label = parenMatch[1].replace(/\s+/g, ' ').trim();
    return { pages: parseYieldPageCount(label), label };
  }

  const rendMatch = text.match(/rend(?:imiento)?:?\s*([\d,.\s]+(?:p[aá]ginas?)?)/i);
  if (rendMatch?.[1]) {
    const label = rendMatch[1].replace(/\s+/g, ' ').trim();
    return { pages: parseYieldPageCount(label), label };
  }

  const pagesOnly = text.match(/\b([\d][\d.,]*)\s*p[aá]ginas?\b/i);
  if (pagesOnly?.[1]) {
    const label = pagesOnly[0].trim();
    return { pages: parseDigitsToInt(pagesOnly[1]), label };
  }

  return { pages: null, label: null };
}

function parseDigitsToInt(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return null;
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** Costo por copia en soles: precio del producto / rendimiento (páginas). */
export function computeCostPerCopyPen(priceUsd: number, yieldPages: number | null | undefined): number | null {
  if (!yieldPages || yieldPages <= 0) return null;
  const pricePen = usdToPen(ensureFullPrices({ public: priceUsd }).public);
  return pricePen / yieldPages;
}

export function formatCostPerCopyPen(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 4, maximumFractionDigits: 4 })}`;
}

export function formatYieldLabel(pages: number | null, label: string | null): string {
  if (label?.trim()) return label.trim();
  if (pages != null && pages > 0) {
    return `${pages.toLocaleString('es-PE')} páginas`;
  }
  return '—';
}

const TONER_YIELD_CARD_EMPTY = 'Rinde: — págs al 5%';

function parseYieldPagesFromText(text: string): number | null {
  const stripped = text
    .replace(/^rend(?:imiento)?:?\s*/i, '')
    .replace(/^rinde:?\s*/i, '')
    .trim();
  const numMatch = stripped.match(/([\d][\d.,\s]*\d|\d+)/);
  if (!numMatch) return null;
  const pages = Number.parseInt(numMatch[1].replace(/[^\d]/g, ''), 10);
  return Number.isFinite(pages) && pages > 0 ? pages : null;
}

/** Texto de rendimiento para cards de tóner en ficha de producto. */
export function formatTonerYieldCardLabel(
  raw: string | null | undefined,
  pages?: number | null,
): string {
  if (pages != null && pages > 0) {
    return `Rinde: ${pages.toLocaleString('es-PE')} págs al 5%`;
  }

  const trimmed = raw?.trim();
  if (!trimmed || trimmed === '—' || trimmed === '-') return TONER_YIELD_CARD_EMPTY;
  if (/^rinde:/i.test(trimmed)) return trimmed;

  const parsed = parseYieldPagesFromText(trimmed);
  if (parsed != null) {
    return `Rinde: ${parsed.toLocaleString('es-PE')} págs al 5%`;
  }

  return TONER_YIELD_CARD_EMPTY;
}

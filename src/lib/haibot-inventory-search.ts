import {
  filterProductsBySearch,
  MIN_PRODUCT_SEARCH_LENGTH,
  normalizeSearchText,
} from '@/lib/product-search';
import { INVENTORY_STOCK_STATUS_LABELS, getInventoryStockStatus } from '@/lib/inventory-stock-status';
import { formatPenFromUsd, formatUsd } from '@/lib/utils';
import type { Product } from '@/types/product';

export const HAIBOT_INVENTORY_SEARCH_LIMIT = 5;

export type HaibotSearchFocus = 'price' | 'stock' | 'all';

const SEARCH_PREFIX_PATTERNS = [
  /^precio\s+(de\s+)?/i,
  /^stock\s+(de\s+)?/i,
  /^disponibilidad\s+(de\s+)?/i,
  /^cu[aá]nto\s+(cuesta\s+)?(el\s+)?/i,
  /^codigo\s+/i,
  /^c[oó]digo\s+/i,
  /^sku\s+/i,
  /^buscar\s+/i,
  /^consultar\s+/i,
  /^tienen\s+/i,
  /^hay\s+/i,
];

export function extractHaibotSearchQuery(text: string): string {
  let query = text.trim();
  for (const pattern of SEARCH_PREFIX_PATTERNS) {
    query = query.replace(pattern, '');
  }
  return query.trim();
}

function hasInventorySearchIntent(text: string): boolean {
  const normalized = normalizeSearchText(text);
  return (
    normalized.includes('precio') ||
    normalized.includes('stock') ||
    normalized.includes('disponib') ||
    normalized.includes('inventario') ||
    normalized.includes('codigo') ||
    normalized.includes('sku') ||
    normalized.includes('cuanto') ||
    normalized.includes('cuesta') ||
    normalized.includes('buscar') ||
    normalized.includes('consultar')
  );
}

export function resolveHaibotInventorySearch(
  text: string,
  products: Product[],
  activeFocus: HaibotSearchFocus | null,
): { query: string; focus: HaibotSearchFocus } | null {
  const extracted = extractHaibotSearchQuery(text);
  if (extracted.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return null;
  }

  if (activeFocus) {
    return { query: extracted, focus: activeFocus };
  }

  const matches = filterProductsBySearch(products, extracted, {
    limit: HAIBOT_INVENTORY_SEARCH_LIMIT,
  });

  if (matches.length > 0 && !hasInventorySearchIntent(text)) {
    return { query: extracted, focus: 'all' };
  }

  if (hasInventorySearchIntent(text)) {
    const normalized = normalizeSearchText(text);
    const focus: HaibotSearchFocus = normalized.includes('stock') ||
      normalized.includes('disponib') ||
      normalized.includes('inventario')
      ? 'stock'
      : normalized.includes('precio') ||
          normalized.includes('cuanto') ||
          normalized.includes('cuesta') ||
          normalized.includes('cotiz')
        ? 'price'
        : 'all';
    return { query: extracted, focus };
  }

  return null;
}

function formatStockLine(stock: number): string {
  const status = getInventoryStockStatus(stock);
  const label = INVENTORY_STOCK_STATUS_LABELS[status];
  if (stock <= 0) return label;
  return `${stock} uds. · ${label}`;
}

function formatProductResult(product: Product, focus: HaibotSearchFocus, index: number): string {
  const brandCode = [product.brand?.toUpperCase(), product.code].filter(Boolean).join(' · ');
  const lines = [`${index}. ${product.name}`];

  if (brandCode) {
    lines.push(`   ${brandCode}`);
  }

  if (focus === 'price' || focus === 'all') {
    lines.push(`   Precio: ${formatUsd(product.price)} — ${formatPenFromUsd(product.price)}`);
  }

  if (focus === 'stock' || focus === 'all') {
    lines.push(`   Stock: ${formatStockLine(product.stock)}`);
  }

  return lines.join('\n');
}

export function formatHaibotInventorySearchReply(
  query: string,
  products: Product[],
  focus: HaibotSearchFocus,
): string {
  const matches = filterProductsBySearch(products, query, {
    limit: HAIBOT_INVENTORY_SEARCH_LIMIT,
  });

  if (matches.length === 0) {
    return `No encontré productos para «${query}».\n\nPrueba con marca, modelo o código (mín. ${MIN_PRODUCT_SEARCH_LENGTH} caracteres). Ej: Ricoh IM 430F o 423509.`;
  }

  const total = filterProductsBySearch(products, query).length;
  const header =
    total === 1
      ? `Encontré 1 producto para «${query}»:\n`
      : `Encontré ${Math.min(matches.length, total)} de ${total} productos para «${query}»:\n`;

  const body = matches
    .map((product, index) => formatProductResult(product, focus, index + 1))
    .join('\n\n');

  const footer =
    total > HAIBOT_INVENTORY_SEARCH_LIMIT
      ? `\n\nHay ${total - HAIBOT_INVENTORY_SEARCH_LIMIT} resultados más. Refina la búsqueda o visita la tienda.`
      : '\n\nEscribe otro modelo o código para seguir consultando.';

  return `${header}\n${body}${footer}`;
}

export function getHaibotSearchPlaceholder(focus: HaibotSearchFocus | null): string {
  if (focus === 'price') return 'Ej: Ricoh IM 430F o código 423509';
  if (focus === 'stock') return 'Ej: toner Ricoh o IM C3000';
  if (focus === 'all') return 'Marca, modelo o código…';
  return 'Mensaje';
}

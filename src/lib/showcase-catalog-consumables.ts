import type { CatalogRow } from '@/lib/catalog-featured';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatConsumableListDisplayName } from '@/lib/product-equipment-consumables';
import { isTonerOrRepuestosCategory, usdToPenCharm } from '@/lib/pen-pricing';
import { productPath } from '@/lib/product-path';
import { productMatchesCatalogFamily } from '@/lib/product-condition';
import { isPriceOnRequest } from '@/lib/display-price';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import type { Product } from '@/types/product';

function catalogProductStub(row: Pick<CatalogRow, 'category' | 'name'>): Product {
  return { category: row.category ?? null, name: row.name ?? '' } as Product;
}

function isCatalogRepuestoRow(row: Pick<CatalogRow, 'category' | 'name'>): boolean {
  if (productMatchesCatalogFamily(catalogProductStub(row), 'repuestos')) {
    return true;
  }
  const name = (row.name ?? '').toLowerCase();
  return /repuesto|unidad de imagen|cilindro|fusor|rodillo|revelador|unidad tambor|pcu|pcd|bandeja|gabinete/.test(
    name,
  );
}

function isCatalogConsumableRow(row: Pick<CatalogRow, 'category' | 'name'>): boolean {
  if (productMatchesCatalogFamily(catalogProductStub(row), 'toner-suministros')) {
    return true;
  }
  return isCatalogRepuestoRow(row);
}

function inferTonerColorLabel(name: string): string | undefined {
  const lower = name.toLowerCase();
  if (/\bnegro\b|\bblack\b|\bbk\b/i.test(lower)) return 'Negro';
  if (/\bcian\b|\bcyan\b|\bcy\b/i.test(lower)) return 'Cian';
  if (/\bmagenta\b|\bmg\b/i.test(lower)) return 'Magenta';
  if (/\bamarill[oa]\b|\byellow\b|\byl\b/i.test(lower)) return 'Amarillo';
  return undefined;
}

function inferTonerYieldLabel(name: string): string | undefined {
  const match = name.match(/(\d[\d.,]*)\s*(?:p[aá]g|pag|pages?)/i);
  if (!match?.[1]) return undefined;
  const digits = match[1].replace(/[.,]/g, '');
  if (!digits) return undefined;
  return `${Number(digits).toLocaleString('es-PE')} pág.`;
}

function inferTonerMeta(row: CatalogRow): HaitechShopProduct['toner'] | undefined {
  const name = row.name ?? '';
  const category = row.category ?? '';
  const haystack = `${name} ${category}`.toLowerCase();
  if (!/t[oó]ner|cartucho|print cart|toner/.test(haystack)) return undefined;

  const original =
    /\boriginal(es)?\b/i.test(haystack) &&
    !/\bcompatible(s)?\b/i.test(haystack) &&
    !/\bremanufactur/.test(haystack);
  const compatible = /\bcompatible(s)?\b/i.test(haystack);
  const remanufacturado = /\bremanufactur|recarga(s)?\b/i.test(haystack);

  return {
    original: remanufacturado ? false : compatible ? false : original || !compatible,
    yieldLabel: inferTonerYieldLabel(name) ?? '—',
    colorLabel: inferTonerColorLabel(name) ?? '—',
  };
}

function showcaseCompareAtPen(pricePen: number, compareUsd: number | undefined, exchangeRate: number): number | undefined {
  if (compareUsd != null && compareUsd > 0) {
    const comparePen = usdToPenCharm(compareUsd, exchangeRate);
    if (comparePen > pricePen) return comparePen;
  }
  if (pricePen <= 0) return undefined;
  return Math.round((pricePen / 0.85) * 100) / 100;
}

function catalogRowToShowcaseProduct(row: CatalogRow, exchangeRate: number): HaitechShopProduct | null {
  if (!isCatalogConsumableRow(row)) return null;

  const publicUsd = Number(row.prices?.public ?? 0);
  const pricePen = publicUsd > 0 ? usdToPenCharm(publicUsd, exchangeRate) : 0;
  const comparePen = showcaseCompareAtPen(
    pricePen,
    row.compare_at_price_usd,
    exchangeRate,
  );
  const discountLabel =
    comparePen != null && comparePen > pricePen && pricePen > 0
      ? `${Math.round((1 - pricePen / comparePen) * 100)}% DSCT`
      : undefined;

  const displayName = formatConsumableListDisplayName(row.name ?? '');
  const toner = inferTonerMeta(row);
  const repuesto = isCatalogRepuestoRow(row) && !toner;
  const slug = String(row.slug ?? row.id ?? '').trim();
  const image = resolveProductImageUrl(row);

  const product: HaitechShopProduct = {
    id: row.id,
    name: displayName,
    brand: (row.brand ?? 'RICOH').toUpperCase(),
    stock: Math.max(0, Math.floor(Number(row.stock) || 0)),
    image: image || '/categories/toner-suministros.png',
    price: isPriceOnRequest(publicUsd) ? 0 : pricePen,
    tabIds: repuesto ? ['accesorios', 'toner'] : ['toner'],
  };

  if (row.code) product.code = String(row.code).trim();
  if (comparePen != null && comparePen > pricePen) product.compareAt = comparePen;
  if (discountLabel) product.discountLabel = discountLabel;
  if (toner) product.toner = toner;
  if (slug) product.href = productPath(slug);

  return product;
}

/** Convierte filas del índice de catálogo en cards de vitrina (tóner y repuestos). */
export function buildShowcaseProductsFromCatalog(
  rows: readonly CatalogRow[],
  exchangeRate: number,
): HaitechShopProduct[] {
  if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) return [];

  const products: HaitechShopProduct[] = [];
  const seenIds = new Set<string>();
  const seenCodes = new Set<string>();

  for (const row of rows) {
    if (!isTonerOrRepuestosCategory(row.category) && !isCatalogConsumableRow(row)) continue;

    const product = catalogRowToShowcaseProduct(row, exchangeRate);
    if (!product) continue;

    if (seenIds.has(product.id)) continue;
    const code = String(product.code ?? '').trim().toUpperCase();
    if (code && seenCodes.has(code)) continue;

    seenIds.add(product.id);
    if (code) seenCodes.add(code);
    products.push(product);
  }

  return products;
}

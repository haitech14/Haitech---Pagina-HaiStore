import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import { getCatalogRows, type CatalogRow } from '@/lib/catalog-featured';
import { productPath } from '@/lib/product-path';
import { findProductBySlugOrId } from '@/lib/product-slug';

function normalizeCatalogCode(code: string | null | undefined): string {
  return String(code ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

function isProductDetailHref(href: string | null | undefined): boolean {
  const value = String(href ?? '').trim();
  return value.startsWith('/tienda/') && !value.startsWith('/tienda/categoria');
}

function findCatalogRowForShowcaseProduct(
  product: HaitechShopProduct,
  rows: readonly CatalogRow[],
): CatalogRow | undefined {
  const byId = findProductBySlugOrId(rows, product.id);
  if (byId) return byId;

  const code = normalizeCatalogCode(product.code);
  if (code) {
    const byCode = rows.find((row) => normalizeCatalogCode(row.code) === code);
    if (byCode) return byCode;
  }

  const fromName = findProductBySlugOrId(rows, product.name);
  if (fromName) return fromName;

  return undefined;
}

export function findShowcaseCatalogRow(product: HaitechShopProduct): CatalogRow | undefined {
  const rows = getCatalogRows();
  if (!rows.length) return undefined;
  return findCatalogRowForShowcaseProduct(product, rows);
}

/** Ruta de ficha para cards de vitrina: catálogo → slug generado. */
export function resolveShowcaseProductHref(product: HaitechShopProduct): string {
  if (isProductDetailHref(product.href)) {
    return product.href!.trim();
  }

  const rows = getCatalogRows();
  const catalogRow = rows.length > 0 ? findCatalogRowForShowcaseProduct(product, rows) : undefined;

  if (catalogRow) {
    return productPath({
      id: catalogRow.id,
      name: catalogRow.name,
      slug: catalogRow.slug ?? null,
    });
  }

  return productPath({ id: product.id, name: product.name });
}

import type { HaitechShopProduct } from '@/data/haitech-home-shop';
import { getCatalogRows, type CatalogRow } from '@/lib/catalog-featured';
import { isTonerOrRepuestosCategory } from '@/lib/pen-pricing';
import { productPath } from '@/lib/product-path';
import { findProductBySlugOrId } from '@/lib/product-slug';

/** IDs de vitrina (stubs) → UUID de inventario. */
const SHOWCASE_STUB_TO_CATALOG_ID: Readonly<Record<string, string>> = {
  mc320fw: 'cb1e47b2-d784-4bef-ae18-d4dae08723e4',
  'im-c320f': '481dbc77-436b-464d-b76f-930f7d79f4ff',
  'im-c401f': '5a142c47-521c-47af-92ec-dda8808907c9',
  'mp-305-plus': 'ab878d89-61e0-4e51-a941-03455e1da407',
  'im-600f': 'b32a43a1-09e4-49f6-8950-3639c9534700',
  'im-550f': '328f41ef-d935-4807-85d0-e1db5bdf73fb',
  'im-c4510': 'a9c74a93-3a15-42da-a9cf-33d59e2b1019',
  'im-c2010': '9c65bcbd-3a13-41dd-81b1-95cb3256a7c1',
  'im-c2510': '21e2cbd5-f6e7-4b44-93db-ca736ea8727b',
  'im-c3010': '15ee65ab-6565-44c4-974e-ff5ba68b0c26',
  'im-c6010': 'e1bffdf0-3515-468e-859a-990d1cb12561',
};

/**
 * Stubs de vitrina sin fila propia: reutilizan la imagen viva del producto de tienda
 * (sin heredar stock/precios vía findShowcaseCatalogRow).
 * Remans (`*-reman`) se materializan solos en inventario; no mapear a seminuevos.
 */
const SHOWCASE_STUB_MEDIA_CATALOG_ID: Readonly<Record<string, string>> = {};

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

function slugFromProductHref(href: string | null | undefined): string | null {
  if (!isProductDetailHref(href)) return null;
  const path = String(href)
    .trim()
    .split(/[?#]/, 1)[0]
    ?.replace(/\/+$/, '');
  const segments = path?.split('/').filter(Boolean) ?? [];
  const slug = segments.length > 0 ? segments[segments.length - 1] : undefined;
  return slug ? decodeURIComponent(slug) : null;
}

function normalizeModelKey(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '');
}

function extractShowcaseEquipmentModel(product: HaitechShopProduct): string | null {
  const name = String(product.name ?? '');
  const patterns = [
    /\b(IM\s*C\s*\d{3,4}[A-Z]{0,3})\b/i,
    /\b(M\s*C\s*\d{3,4}[A-Z]{0,3})\b/i,
    /\b(IM\s*\d{3,4}[A-Z]{0,3})\b/i,
    /\b(MP\s*\d{3,4}[A-Z]{0,3})\b/i,
    /\b(P\s*C?\s*\d{3,4}[A-Z]{0,3})\b/i,
  ];
  for (const pattern of patterns) {
    const match = name.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, ' ').trim().toUpperCase();
    }
  }
  return null;
}

function catalogRowMatchesModel(row: CatalogRow, model: string): boolean {
  const modelKey = normalizeModelKey(model);
  if (!modelKey) return false;

  const attrValue = row.attributes?.find((attr) => /modelo\s*de\s*equipo/i.test(attr.name))?.value;
  if (attrValue && normalizeModelKey(attrValue) === modelKey) return true;

  const escaped = model.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*');
  return new RegExp(`(?:^|[^A-Z0-9])${escaped}(?:[^A-Z0-9]|$)`, 'i').test(row.name ?? '');
}

function isNuevoShowcaseProduct(product: HaitechShopProduct): boolean {
  return product.condition !== 'seminuevo' && !/remanufactur/i.test(product.name);
}

function catalogRowLooksNuevo(row: CatalogRow): boolean {
  const haystack = `${row.category ?? ''} ${row.name ?? ''}`.toLowerCase();
  if (/seminueva|remanufactur/.test(haystack)) return false;
  return /nueva/.test(haystack);
}

function catalogRowLooksRemanufacturada(row: CatalogRow): boolean {
  return /remanufactur/i.test(`${row.category ?? ''} ${row.name ?? ''}`);
}

function catalogRowLooksSeminuevo(row: CatalogRow): boolean {
  return /seminuev/i.test(`${row.category ?? ''} ${row.name ?? ''}`);
}

function isRemanufacturadaShowcaseProduct(product: HaitechShopProduct): boolean {
  return /remanufactur/i.test(product.name ?? '');
}

function catalogRowLooksLikeConsumable(row: CatalogRow): boolean {
  if (isTonerOrRepuestosCategory(row.category)) return true;
  const name = (row.name ?? '').toLowerCase();
  if (/multifuncional|impresora|fotocopiadora|escaner|escáner|plotter|laptop/.test(name)) {
    return false;
  }
  return /t[oó]ner|cartucho|repuesto|almohadilla|cilindro|friction pad|unidad de imagen/.test(
    name,
  );
}

function findCatalogRowByModel(
  product: HaitechShopProduct,
  rows: readonly CatalogRow[],
): CatalogRow | undefined {
  const model = extractShowcaseEquipmentModel(product);
  if (!model) return undefined;

  const preferEquipment = !product.toner;
  const matches = rows.filter((row) => {
    if (!catalogRowMatchesModel(row, model)) return false;
    if (preferEquipment && catalogRowLooksLikeConsumable(row)) return false;
    return true;
  });
  if (matches.length === 0) return undefined;

  if (isRemanufacturadaShowcaseProduct(product)) {
    const remans = matches.filter(catalogRowLooksRemanufacturada);
    if (remans.length === 1) return remans[0];
    // Evita enlazar remanufacturada a seminuevo/nuevo (imagen y precio incorrectos).
    return undefined;
  }

  if (matches.length === 1) {
    const only = matches[0]!;
    if (product.condition === 'seminuevo' && catalogRowLooksRemanufacturada(only)) {
      return undefined;
    }
    return only;
  }

  if (isNuevoShowcaseProduct(product)) {
    const nuevas = matches.filter(catalogRowLooksNuevo);
    if (nuevas.length === 1) return nuevas[0];
  }

  if (product.condition === 'seminuevo') {
    const seminuevas = matches.filter(catalogRowLooksSeminuevo);
    if (seminuevas.length === 1) return seminuevas[0];
  }

  return undefined;
}

function findCatalogRowByUniqueCode(
  code: string,
  rows: readonly CatalogRow[],
): CatalogRow | undefined {
  const matches = rows.filter((row) => normalizeCatalogCode(row.code) === code);
  return matches.length === 1 ? matches[0] : undefined;
}

function findCatalogRowForShowcaseProduct(
  product: HaitechShopProduct,
  rows: readonly CatalogRow[],
): CatalogRow | undefined {
  const byId = findProductBySlugOrId(rows, product.id);
  if (byId) return byId;

  const mappedId = SHOWCASE_STUB_TO_CATALOG_ID[product.id];
  if (mappedId) {
    const mapped = findProductBySlugOrId(rows, mappedId);
    if (mapped) return mapped;
  }

  const hrefSlug = slugFromProductHref(product.href);
  if (hrefSlug) {
    const bySlug = findProductBySlugOrId(rows, hrefSlug);
    if (bySlug) return bySlug;
  }

  const byModel = findCatalogRowByModel(product, rows);
  if (byModel) return byModel;

  const code = normalizeCatalogCode(product.code);
  if (code) {
    const byCode = findCatalogRowByUniqueCode(code, rows);
    if (byCode) return byCode;
  }

  return findProductBySlugOrId(rows, product.name);
}

export function findShowcaseCatalogRow(product: HaitechShopProduct): CatalogRow | undefined {
  const rows = getCatalogRows();
  if (!rows.length) return undefined;
  return findCatalogRowForShowcaseProduct(product, rows);
}

/** Id de catálogo solo para imagen viva (stubs reman ↔ producto de tienda). */
export function resolveShowcaseMediaCatalogId(product: HaitechShopProduct): string {
  return (
    SHOWCASE_STUB_MEDIA_CATALOG_ID[product.id] ??
    findShowcaseCatalogRow(product)?.id ??
    product.id
  );
}

function formatShowcaseWarehouseName(warehouseId: string): string {
  const labels: Record<string, string> = {
    lince: 'Lince',
    chiclayo: 'Chiclayo',
    principal: 'Almacén principal',
    'santa-catalina': 'Santa Catalina',
    operativo: 'Operativo',
  };
  if (labels[warehouseId]) return labels[warehouseId];
  return warehouseId
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Copia stock, id y código vivos del catálogo a la card de vitrina. */
export function hydrateShowcaseProductFromCatalog(product: HaitechShopProduct): HaitechShopProduct {
  const row = findShowcaseCatalogRow(product);
  if (!row) return product;

  const stock = Math.max(0, Math.floor(Number(row.stock) || 0));
  const stockLocations = (row.stock_by_warehouse ?? [])
    .filter((entry) => Number(entry.quantity) > 0)
    .map((entry) => ({
      name: formatShowcaseWarehouseName(entry.warehouse_id),
      quantity: Math.max(0, Math.floor(Number(entry.quantity) || 0)),
    }));

  const next: HaitechShopProduct = {
    ...product,
    id: row.id,
    stock,
  };
  if (row.code) next.code = row.code;
  if (row.name?.trim()) next.name = row.name.trim();
  const catalogImage = typeof row.image_url === 'string' ? row.image_url.trim() : '';
  if (catalogImage) next.image = catalogImage;
  if (stockLocations.length > 0) next.stockLocations = stockLocations;
  delete next.compareAt;
  delete next.discountLabel;

  return next;
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

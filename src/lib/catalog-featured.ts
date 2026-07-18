import { productCategoryTags } from '@/lib/inventory-categories';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import {
  readCatalogIndexFromIdb,
  writeCatalogIndexToIdb,
} from '@/lib/catalog-index-idb';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { findProductBySlugOrId } from '@/lib/product-slug';
import type { FeaturedProduct } from '@/data/featured-products';
import type { InventoryProduct, Product } from '@/types/product';
import { isProductVisibleOnStorefront } from '../../shared/product-catalog-status.js';

export const CATALOG_INDEX_UPDATED_EVENT = 'haistore-catalog-index-updated';

export type CatalogRow = InventoryProduct & {
  compare_at_price_usd?: number;
  is_new?: boolean;
};

type CatalogJsonRow = Partial<InventoryProduct> &
  Pick<InventoryProduct, 'id' | 'name' | 'prices'> & {
    compare_at_price_usd?: number;
    is_new?: boolean;
  };

export const INVENTORY_INDEX_URL = '/catalog/inventory-index.json';

let catalogCache: CatalogRow[] | null = null;
let catalogLoadPromise: Promise<CatalogRow[]> | null = null;
let catalogMediaEpoch = 0;
/** Lookup O(1) por id sobre catalogCache (todas las filas, sin filtrar visibilidad). */
let catalogById: Map<string, CatalogRow> | null = null;
/** Lookup O(1) por slug normalizado. */
let catalogBySlug: Map<string, CatalogRow> | null = null;

const CATALOG_MEDIA_UPDATED_EVENT = 'haistore-catalog-media-updated';

function rebuildCatalogLookupMaps(rows: CatalogRow[]): void {
  const byId = new Map<string, CatalogRow>();
  const bySlug = new Map<string, CatalogRow>();
  for (const row of rows) {
    byId.set(row.id, row);
    const slug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';
    if (slug) bySlug.set(slug, row);
  }
  catalogById = byId;
  catalogBySlug = bySlug;
}

function clearCatalogLookupMaps(): void {
  catalogById = null;
  catalogBySlug = null;
}

function bumpCatalogMediaEpoch(): void {
  catalogMediaEpoch += 1;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CATALOG_MEDIA_UPDATED_EVENT, { detail: catalogMediaEpoch }));
  }
}

export function getCatalogMediaEpoch(): number {
  return catalogMediaEpoch;
}

export function subscribeCatalogMediaUpdates(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => listener();
  window.addEventListener(CATALOG_MEDIA_UPDATED_EVENT, handler);
  return () => window.removeEventListener(CATALOG_MEDIA_UPDATED_EVENT, handler);
}

function normalizeCatalogRows(rawProducts: CatalogJsonRow[]): CatalogRow[] {
  return rawProducts.map((raw) => {
    const product = normalizeInventoryProduct(raw);
    const row: CatalogRow = { ...product };
    if (raw.compare_at_price_usd != null) {
      row.compare_at_price_usd = raw.compare_at_price_usd;
    }
    if (raw.is_new != null) {
      row.is_new = raw.is_new;
    }
    return row;
  });
}

async function fetchCatalogIndexFromNetwork(): Promise<CatalogRow[]> {
  const response = await fetch(INVENTORY_INDEX_URL, {
    cache: 'default',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${INVENTORY_INDEX_URL}`);
  }
  const payload = (await response.json()) as { products?: CatalogJsonRow[] };
  return normalizeCatalogRows(payload.products ?? []);
}

function applyCatalogRows(rows: CatalogRow[]): CatalogRow[] {
  catalogCache = rows;
  rebuildCatalogLookupMaps(rows);
  return rows;
}

/** Empuja el índice fresco a React Query (roles en queryKey). */
function publishCatalogIndexToQueryClient(rows: CatalogRow[]): void {
  void import('@/providers').then(async ({ queryClient }) => {
    const { toPublicProduct } = await import('@/lib/pricing');
    const visible = rows.filter((row) => isProductVisibleOnStorefront(row));
    const queries = queryClient.getQueriesData<Product[]>({ queryKey: ['products'] });
    for (const [queryKey] of queries) {
      const role = typeof queryKey[1] === 'string' ? queryKey[1] : 'public';
      queryClient.setQueryData(
        queryKey,
        visible.map((row) => toPublicProduct(row, role)),
      );
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(CATALOG_INDEX_UPDATED_EVENT));
    }
  });
}

async function revalidateCatalogIndexInBackground(): Promise<void> {
  try {
    const rows = await fetchCatalogIndexFromNetwork();
    applyCatalogRows(rows);
    void writeCatalogIndexToIdb(rows);
    publishCatalogIndexToQueryClient(rows);
  } catch {
    /* mantener snapshot IDB / memoria */
  }
}

/** Carga el índice: memoria → IndexedDB (refresh rápido) → red. */
export async function loadCatalogIndex(): Promise<CatalogRow[]> {
  if (catalogCache) return catalogCache;
  if (!catalogLoadPromise) {
    catalogLoadPromise = (async () => {
      const idbRows = await readCatalogIndexFromIdb();
      if (idbRows && idbRows.length > 0) {
        const rows = idbRows as CatalogRow[];
        applyCatalogRows(rows);
        // Red en segundo plano; no bloquear el paint del refresh.
        void revalidateCatalogIndexInBackground();
        return rows;
      }

      const rows = await fetchCatalogIndexFromNetwork();
      applyCatalogRows(rows);
      void writeCatalogIndexToIdb(rows);
      return rows;
    })().catch((error) => {
      catalogLoadPromise = null;
      clearCatalogLookupMaps();
      throw error;
    });
  }
  return catalogLoadPromise;
}

/** Precarga en segundo plano (p. ej. loader de la home). */
export function preloadCatalogIndex(): void {
  void loadCatalogIndex().catch(() => {
    /* fallback vía API */
  });
}

/**
 * Actualiza image_url/gallery en la caché del índice (tarjetas home/tienda)
 * tras aplicar foto desde el álbum u otra mutación de medios.
 */
export function patchCatalogIndexProductMedia(
  product: Pick<InventoryProduct, 'id' | 'image_url' | 'gallery'>,
): void {
  if (!catalogCache) return;
  const index = catalogCache.findIndex((row) => row.id === product.id);
  if (index < 0) return;

  const current = catalogCache[index];
  if (!current) return;

  const nextRow: CatalogRow = {
    ...current,
    image_url: product.image_url ?? current.image_url,
    gallery: Array.isArray(product.gallery) ? product.gallery : current.gallery,
  };

  catalogCache = [
    ...catalogCache.slice(0, index),
    nextRow,
    ...catalogCache.slice(index + 1),
  ];
  catalogById?.set(nextRow.id, nextRow);
  const slug = typeof nextRow.slug === 'string' ? nextRow.slug.trim().toLowerCase() : '';
  if (slug) catalogBySlug?.set(slug, nextRow);
  bumpCatalogMediaEpoch();
}

/** Filas del índice en caché (vacío hasta que termine la precarga). */
export function getCatalogRows(): CatalogRow[] {
  return (catalogCache ?? []).filter((row) => isProductVisibleOnStorefront(row));
}

export function normalizeCategoryName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

export function productMatchesCategories(
  category: string | null | undefined,
  labels: readonly string[],
): boolean {
  const normalizedLabels = labels.map((label) => normalizeCategoryName(label));
  const tags = productCategoryTags({ category: category ?? null });
  if (tags.length === 0) {
    const norm = normalizeCategoryName(category ?? '');
    return normalizedLabels.includes(norm);
  }
  return tags.some((tag) => normalizedLabels.includes(normalizeCategoryName(tag)));
}

function stableReviewCount(id: string): number {
  let hash = 0;
  for (const char of id) {
    hash = (hash + char.charCodeAt(0)) % 200;
  }
  return 24 + hash;
}

export function catalogRowToFeatured(
  row: CatalogRow,
  meta?: Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'>,
): FeaturedProduct {
  const product = normalizeInventoryProduct(row);
  const publicPrice = product.prices.public;
  const compareAt = row.compare_at_price_usd;
  const discount =
    compareAt != null && compareAt > publicPrice
      ? Math.round((1 - publicPrice / compareAt) * 100)
      : undefined;

  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((url): url is string => typeof url === 'string' && url.length > 0)
    : [];

  const featured: FeaturedProduct = {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    code: product.code?.trim() || null,
    price: publicPrice,
    stock: product.stock,
    isNew: meta?.isNew ?? row.is_new ?? false,
    rating: meta?.rating ?? 5,
    reviews: meta?.reviews ?? stableReviewCount(product.id),
    image: resolveProductImageUrl(product),
    ...(gallery.length > 0 ? { gallery } : {}),
    ...('delivery_time' in row && typeof row.delivery_time === 'string' && row.delivery_time.trim()
      ? { delivery_time: row.delivery_time.trim() }
      : {}),
  };

  if (product.attributes?.length) {
    featured.attributes = product.attributes;
  }
  if (compareAt != null && compareAt > publicPrice) {
    featured.oldPrice = compareAt;
    if (discount != null) {
      featured.discount = discount;
    }
  }

  return featured;
}

export function getCatalogFeaturedByCategories(
  categoryLabels: readonly string[],
  limit = 10,
): FeaturedProduct[] {
  return getCatalogRows()
    .filter((row) => productMatchesCategories(row.category, categoryLabels))
    .slice(0, limit)
    .map((row) => catalogRowToFeatured(row));
}

export function getCatalogProductById(id: string): CatalogRow | undefined {
  const key = id.trim();
  if (!key) return undefined;

  if (catalogById || catalogBySlug) {
    const byId = catalogById?.get(key);
    if (byId && isProductVisibleOnStorefront(byId)) return byId;

    const bySlug = catalogBySlug?.get(key.toLowerCase());
    if (bySlug && isProductVisibleOnStorefront(bySlug)) return bySlug;

    // Fallback: findProductBySlugOrId puede resolver códigos / slugs legacy.
  }

  const rows = getCatalogRows();
  const match = findProductBySlugOrId(rows, key);
  return match as CatalogRow | undefined;
}

export async function getCatalogProductByIdAsync(id: string): Promise<CatalogRow | undefined> {
  await loadCatalogIndex();
  return getCatalogProductById(id);
}

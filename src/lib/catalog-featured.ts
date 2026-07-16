import { productCategoryTags } from '@/lib/inventory-categories';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { findProductBySlugOrId } from '@/lib/product-slug';
import type { FeaturedProduct } from '@/data/featured-products';
import type { InventoryProduct } from '@/types/product';
import { isProductVisibleOnStorefront } from '../../shared/product-catalog-status.js';

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

const CATALOG_MEDIA_UPDATED_EVENT = 'haistore-catalog-media-updated';

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

async function fetchCatalogIndex(): Promise<CatalogRow[]> {
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

/** Carga el índice slim desde CDN (con caché en memoria). */
export async function loadCatalogIndex(): Promise<CatalogRow[]> {
  if (catalogCache) return catalogCache;
  if (!catalogLoadPromise) {
    catalogLoadPromise = fetchCatalogIndex()
      .then((rows) => {
        catalogCache = rows;
        return rows;
      })
      .catch((error) => {
        catalogLoadPromise = null;
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

  catalogCache = [
    ...catalogCache.slice(0, index),
    {
      ...current,
      image_url: product.image_url ?? current.image_url,
      gallery: Array.isArray(product.gallery) ? product.gallery : current.gallery,
    },
    ...catalogCache.slice(index + 1),
  ];
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
  const rows = getCatalogRows();
  const match = findProductBySlugOrId(rows, id);
  return match as CatalogRow | undefined;
}

export async function getCatalogProductByIdAsync(id: string): Promise<CatalogRow | undefined> {
  const rows = await loadCatalogIndex();
  const visible = rows.filter((row) => isProductVisibleOnStorefront(row));
  const match = findProductBySlugOrId(visible, id);
  return match as CatalogRow | undefined;
}

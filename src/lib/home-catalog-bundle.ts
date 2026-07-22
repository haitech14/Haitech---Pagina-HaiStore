import type { FeaturedProduct } from '@/data/featured-products';
import type { CatalogFamilySlug, ProductCondition } from '@/lib/product-condition';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/types/product';

export const HOME_CATALOG_BUNDLE_QUERY_KEY = 'home-catalog-bundle';
export const HOME_FEATURED_BUNDLE_LIMIT = 6;
export const HOME_SECTIONS_BUNDLE_LIMIT = 10;
export const HOME_BUNDLE_STATIC_URL = '/catalog/home-bundle.json';

const BUNDLE_STORAGE_KEY = 'haistore_home_bundle_v2';

interface StoredHomeCatalogBundle {
  generatedAt?: string;
  bundle: HomeCatalogBundleResponse;
}

export interface HomeCatalogSectionPayload {
  id: CatalogFamilySlug;
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>;
}

export interface HomeCatalogBundleResponse {
  featured: Product[];
  sections: HomeCatalogSectionPayload[];
}

interface HomeBundleSnapshotFile extends HomeCatalogBundleResponse {
  version?: number;
  generatedAt?: string;
}

function isValidBundlePayload(payload: unknown): payload is HomeCatalogBundleResponse {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as HomeCatalogBundleResponse;
  return Array.isArray(candidate.featured) && Array.isArray(candidate.sections);
}

export function readStoredHomeCatalogBundle(): HomeCatalogBundleResponse | undefined {
  try {
    const raw = sessionStorage.getItem(BUNDLE_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredHomeCatalogBundle | HomeCatalogBundleResponse;
    const bundle =
      parsed && typeof parsed === 'object' && 'bundle' in parsed
        ? parsed.bundle
        : (parsed as HomeCatalogBundleResponse);
    if (!isValidBundlePayload(bundle)) return undefined;
    return bundle;
  } catch {
    return undefined;
  }
}

function readStoredHomeCatalogBundleMeta(): StoredHomeCatalogBundle | undefined {
  try {
    const raw = sessionStorage.getItem(BUNDLE_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredHomeCatalogBundle | HomeCatalogBundleResponse;
    if (parsed && typeof parsed === 'object' && 'bundle' in parsed) {
      return isValidBundlePayload(parsed.bundle) ? parsed : undefined;
    }
    if (isValidBundlePayload(parsed)) {
      return { bundle: parsed };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

export function storeHomeCatalogBundle(
  payload: HomeCatalogBundleResponse,
  generatedAt?: string,
): void {
  try {
    const stored: StoredHomeCatalogBundle = { bundle: payload };
    if (generatedAt) stored.generatedAt = generatedAt;
    sessionStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* quota / privado */
  }
}

function isStaticBundleNewer(
  cached: StoredHomeCatalogBundle | undefined,
  staticGeneratedAt?: string,
): boolean {
  if (!staticGeneratedAt) return false;
  if (!cached?.generatedAt) return true;
  return staticGeneratedAt > cached.generatedAt;
}

function snapshotToBundle(payload: HomeBundleSnapshotFile): HomeCatalogBundleResponse {
  return {
    featured: payload.featured,
    sections: payload.sections,
  };
}

/** Snapshot estático (CDN / public); no requiere API. */
export async function fetchStaticHomeCatalogBundle(): Promise<{
  bundle: HomeCatalogBundleResponse;
  generatedAt?: string;
} | null> {
  try {
    const response = await fetch(HOME_BUNDLE_STATIC_URL, {
      cache: 'default',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as HomeBundleSnapshotFile;
    if (!isValidBundlePayload(payload)) return null;
    return {
      bundle: snapshotToBundle(payload),
      ...(payload.generatedAt ? { generatedAt: payload.generatedAt } : {}),
    };
  } catch {
    return null;
  }
}

async function fetchHomeCatalogBundleFromApi(): Promise<HomeCatalogBundleResponse> {
  const params = new URLSearchParams({
    featuredLimit: String(HOME_FEATURED_BUNDLE_LIMIT),
    sectionsLimit: String(HOME_SECTIONS_BUNDLE_LIMIT),
    category: 'multifuncionales',
  });
  return apiFetch<HomeCatalogBundleResponse>(`/api/products/home-bundle?${params}`);
}

/** Datos para pintar la home: snapshot / sessionStorage primero (sin esperar API). */
export async function fetchHomeCatalogBundleForDisplay(): Promise<HomeCatalogBundleResponse> {
  const cachedMeta = readStoredHomeCatalogBundleMeta();

  // Visita previa en la pestaña: pintar ya; el static/API revalidan en background.
  if (cachedMeta?.bundle) {
    void fetchStaticHomeCatalogBundle()
      .then((staticPayload) => {
        if (
          staticPayload &&
          isStaticBundleNewer(cachedMeta, staticPayload.generatedAt)
        ) {
          storeHomeCatalogBundle(staticPayload.bundle, staticPayload.generatedAt);
        }
      })
      .catch(() => {
        /* revalidateHomeCatalogBundle cubre el fallo */
      });
    return cachedMeta.bundle;
  }

  const staticPayload = await fetchStaticHomeCatalogBundle();

  if (staticPayload) {
    storeHomeCatalogBundle(staticPayload.bundle, staticPayload.generatedAt);
    return staticPayload.bundle;
  }

  return fetchHomeCatalogBundleFromApi();
}

/** Revalidación en segundo plano contra la API. */
export async function revalidateHomeCatalogBundle(): Promise<HomeCatalogBundleResponse> {
  try {
    const apiBundle = await fetchHomeCatalogBundleFromApi();
    storeHomeCatalogBundle(apiBundle);
    return apiBundle;
  } catch (error) {
    const cachedMeta = readStoredHomeCatalogBundleMeta();
    if (cachedMeta?.bundle) return cachedMeta.bundle;
    const staticPayload = await fetchStaticHomeCatalogBundle();
    if (staticPayload) {
      storeHomeCatalogBundle(staticPayload.bundle, staticPayload.generatedAt);
      return staticPayload.bundle;
    }
    throw error;
  }
}

/**
 * Compat: muestra datos locales de inmediato; la revalidación API va en prefetch separado.
 */
export async function fetchHomeCatalogBundle(): Promise<HomeCatalogBundleResponse> {
  return fetchHomeCatalogBundleForDisplay();
}

/** Precarga instantánea desde JSON estático (sin API). */
export async function fetchHomeCatalogBundleInitial(): Promise<HomeCatalogBundleResponse | null> {
  const staticPayload = await fetchStaticHomeCatalogBundle();
  if (staticPayload) {
    storeHomeCatalogBundle(staticPayload.bundle, staticPayload.generatedAt);
    return staticPayload.bundle;
  }
  return readStoredHomeCatalogBundle() ?? null;
}

function featuredToProvisionalProduct(product: FeaturedProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    code: product.code ?? null,
    attributes: product.attributes ?? [],
    price: product.price,
    ...(product.prices !== undefined ? { prices: product.prices } : {}),
    ...(product.price_role !== undefined ? { price_role: product.price_role } : {}),
    image_url: product.image,
    gallery: product.gallery ?? [],
    stock: Math.max(0, Math.floor(Number(product.stock) || 0)),
    currency: 'USD',
    description: null,
    slug: product.id,
    sort_order: 0,
    is_featured: false,
    view_count: 0,
    created_at: '',
  };
}

/**
 * Productos provisionales para pintar /tienda mientras carga inventory-index.
 * Combina `featured` (Product) + secciones (FeaturedProduct), dedupe por id.
 */
export function collectProvisionalStoreProductsFromBundle(
  bundle: HomeCatalogBundleResponse,
): Product[] {
  const byId = new Map<string, Product>();

  for (const product of bundle.featured) {
    if (product?.id) byId.set(product.id, product);
  }

  for (const section of bundle.sections) {
    for (const list of Object.values(section.productsByCondition ?? {})) {
      for (const item of list) {
        if (!item?.id || byId.has(item.id)) continue;
        byId.set(item.id, featuredToProvisionalProduct(item));
      }
    }
  }

  return [...byId.values()];
}

/** Bundle ya en memoria (sessionStorage) para seed síncrono. */
export function getCachedHomeBundleProvisionalProducts(): Product[] {
  const bundle = readStoredHomeCatalogBundle();
  if (!bundle) return [];
  return collectProvisionalStoreProductsFromBundle(bundle);
}

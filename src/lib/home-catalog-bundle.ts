import type { FeaturedProduct } from '@/data/featured-products';
import type { CatalogFamilySlug, ProductCondition } from '@/lib/product-condition';
import { apiFetch } from '@/lib/api';
import type { Product } from '@/types/product';

export const HOME_CATALOG_BUNDLE_QUERY_KEY = 'home-catalog-bundle';
export const HOME_FEATURED_BUNDLE_LIMIT = 5;
export const HOME_SECTIONS_BUNDLE_LIMIT = 10;
export const HOME_BUNDLE_STATIC_URL = '/catalog/home-bundle.json';

const BUNDLE_STORAGE_KEY = 'haistore_home_bundle_v1';

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
    const parsed = JSON.parse(raw) as HomeCatalogBundleResponse;
    if (!isValidBundlePayload(parsed)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function storeHomeCatalogBundle(payload: HomeCatalogBundleResponse): void {
  try {
    sessionStorage.setItem(BUNDLE_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / privado */
  }
}

function snapshotToBundle(payload: HomeBundleSnapshotFile): HomeCatalogBundleResponse {
  return {
    featured: payload.featured,
    sections: payload.sections,
  };
}

/** Snapshot estático (CDN / public); no requiere API. */
export async function fetchStaticHomeCatalogBundle(): Promise<HomeCatalogBundleResponse | null> {
  try {
    const response = await fetch(HOME_BUNDLE_STATIC_URL, {
      cache: 'default',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as HomeBundleSnapshotFile;
    if (!isValidBundlePayload(payload)) return null;
    return snapshotToBundle(payload);
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

/**
 * API con respaldo en snapshot estático y sessionStorage.
 * Prioriza API; no vuelve a pedir el JSON estático si ya hay caché en sesión.
 */
export async function fetchHomeCatalogBundle(): Promise<HomeCatalogBundleResponse> {
  try {
    const apiBundle = await fetchHomeCatalogBundleFromApi();
    storeHomeCatalogBundle(apiBundle);
    return apiBundle;
  } catch (error) {
    const cached = readStoredHomeCatalogBundle();
    if (cached) return cached;
    const staticBundle = await fetchStaticHomeCatalogBundle();
    if (staticBundle) {
      storeHomeCatalogBundle(staticBundle);
      return staticBundle;
    }
    throw error;
  }
}

/** Precarga instantánea desde JSON estático (sin API). */
export async function fetchHomeCatalogBundleInitial(): Promise<HomeCatalogBundleResponse | null> {
  const staticBundle = await fetchStaticHomeCatalogBundle();
  if (staticBundle) {
    storeHomeCatalogBundle(staticBundle);
    return staticBundle;
  }
  return readStoredHomeCatalogBundle() ?? null;
}

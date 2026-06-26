import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { invalidateHomeApiCache } from './home-api-cache.js';
import {
  HOME_BUNDLE_SECTION_IDS,
  listHomeCatalogBundle,
} from './home-catalog-bundle.js';
import { buildHomeCatalogSectionsFromProducts } from './home-catalog-sections.js';
import { buildHomeFeaturedFromProducts } from './home-featured-products.js';
import { slimHomeBundlePayload } from './home-bundle-slim.js';
import { readInventory } from './inventory-store.js';
import { HOME_HIGHLIGHTED_ROW_SIZE } from '../../shared/home-highlighted-products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const HOME_BUNDLE_SNAPSHOT_VERSION = 1;
export const HOME_BUNDLE_SNAPSHOT_PUBLIC_PATH = '/catalog/home-bundle.json';

const DEFAULT_FEATURED_LIMIT = HOME_HIGHLIGHTED_ROW_SIZE;
const DEFAULT_SECTIONS_LIMIT = 10;
const DEFAULT_FEATURED_CATEGORY = 'multifuncionales';

export function getHomeBundleSnapshotPath() {
  if (process.env.HAISTORE_HOME_BUNDLE_SNAPSHOT_PATH) {
    return process.env.HAISTORE_HOME_BUNDLE_SNAPSHOT_PATH;
  }
  return path.join(__dirname, '../../public/catalog/home-bundle.json');
}

function isValidBundlePayload(payload) {
  return (
    payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.featured) &&
    Array.isArray(payload.sections)
  );
}

/**
 * Construye el bundle público por defecto desde productos en memoria/archivo.
 */
export function buildDefaultHomeBundleSnapshotFromProducts(products, role = 'public') {
  const featured = buildHomeFeaturedFromProducts(products, role, {
    categorySlug: DEFAULT_FEATURED_CATEGORY,
    limit: DEFAULT_FEATURED_LIMIT,
  });
  const { sections } = buildHomeCatalogSectionsFromProducts(
    products,
    role,
    HOME_BUNDLE_SECTION_IDS,
    DEFAULT_SECTIONS_LIMIT,
  );
  return { featured, sections };
}

export async function buildDefaultHomeBundleSnapshot(role = 'public') {
  const { products } = await readInventory();
  return buildDefaultHomeBundleSnapshotFromProducts(products, role);
}

export async function readHomeBundleSnapshot() {
  try {
    const raw = await fs.readFile(getHomeBundleSnapshotPath(), 'utf8');
    const parsed = JSON.parse(raw);
    if (!isValidBundlePayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Escribe snapshot estático para la landing (servido por Vite/CDN).
 */
export async function writeHomeBundleSnapshot(bundle, meta = {}) {
  const filePath = getHomeBundleSnapshotPath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  const payload = {
    version: HOME_BUNDLE_SNAPSHOT_VERSION,
    generatedAt: new Date().toISOString(),
    featuredLimit: DEFAULT_FEATURED_LIMIT,
    sectionsLimit: DEFAULT_SECTIONS_LIMIT,
    featuredCategorySlug: DEFAULT_FEATURED_CATEGORY,
    sectionIds: HOME_BUNDLE_SECTION_IDS,
    ...slimHomeBundlePayload(bundle),
    ...meta,
  };

  const tmpPath = `${filePath}.tmp`;
  await fs.writeFile(tmpPath, `${JSON.stringify(payload)}\n`, 'utf8');
  await fs.rename(tmpPath, filePath);
  invalidateHomeApiCache();
  return filePath;
}

export async function regenerateHomeBundleSnapshot(role = 'public') {
  const bundle = await buildDefaultHomeBundleSnapshot(role);
  const filePath = await writeHomeBundleSnapshot(bundle);
  return { filePath, bundle };
}

export async function regenerateHomeBundleSnapshotQuiet() {
  try {
    return await regenerateHomeBundleSnapshot();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[home-bundle-snapshot] no se pudo regenerar:', message);
    return null;
  }
}

export function isDefaultHomeBundleRequest(options = {}) {
  const featuredLimit = Math.min(
    Math.max(Number(options.featuredLimit) || DEFAULT_FEATURED_LIMIT, 1),
    12,
  );
  const sectionsLimit = Math.min(
    Math.max(Number(options.sectionsLimit) || DEFAULT_SECTIONS_LIMIT, 1),
    24,
  );
  const sectionIds = (options.sectionIds ?? HOME_BUNDLE_SECTION_IDS).filter(Boolean);
  const featuredCategorySlug =
    typeof options.featuredCategorySlug === 'string'
      ? options.featuredCategorySlug
      : DEFAULT_FEATURED_CATEGORY;

  return (
    (options.role ?? 'public') === 'public' &&
    featuredLimit === DEFAULT_FEATURED_LIMIT &&
    sectionsLimit === DEFAULT_SECTIONS_LIMIT &&
    featuredCategorySlug === DEFAULT_FEATURED_CATEGORY &&
    sectionIds.length === HOME_BUNDLE_SECTION_IDS.length &&
    HOME_BUNDLE_SECTION_IDS.every((id, index) => sectionIds[index] === id)
  );
}

/**
 * Devuelve snapshot si la petición coincide con el bundle por defecto (rol público).
 */
export async function readDefaultHomeBundleSnapshotIfApplicable(options = {}) {
  if (!isDefaultHomeBundleRequest(options)) return null;
  const snapshot = await readHomeBundleSnapshot();
  if (!snapshot) return null;
  return { featured: snapshot.featured, sections: snapshot.sections };
}

/**
 * Lista bundle desde inventario en vivo; snapshot estático solo si falla el cálculo.
 */
export async function listHomeCatalogBundleWithSnapshot(options = {}) {
  try {
    return await listHomeCatalogBundle(options);
  } catch (error) {
    const snapshot = await readDefaultHomeBundleSnapshotIfApplicable(options);
    if (snapshot) {
      return snapshot;
    }
    throw error;
  }
}

import { ensureFullPrices } from './roles.js';
import {
  migrateInventoryProduct,
  readInventory,
  toPublicProduct,
  toPublicProductList,
  writeInventory,
} from './inventory-store.js';
import { seedProducts } from './seed-products.js';
import { sanitizeStoredProductMedia } from '../../shared/product-media-sanitize.js';
import { shouldPreferSupabaseCatalog } from './catalog-source.js';
import { getSupabaseAdmin } from './supabase-auth.js';
import { normalizeWarehouses } from './inventory-warehouses.js';
import { resolveProductGallery, resolveProductImageUrl } from './product-image-url.js';
import {
  clearProductSearchHaystackCache,
  normalizeCatalogSearchText,
  productMatchesSearchQuery,
  takeTopProductsBySearchRelevance,
} from '../../shared/catalog-search.js';
import { productMatchesCategoryFilter } from '../../shared/home-catalog-filter.js';

export { shouldPreferSupabaseCatalog };

export function withResolvedMedia(product) {
  const stored = sanitizeStoredProductMedia(product);
  const image_url =
    resolveProductImageUrl({ ...product, ...stored }) ?? resolveProductImageUrl(product);
  const gallery = resolveProductGallery({ ...product, ...stored });
  return { ...product, ...stored, image_url, gallery };
}

export function buildSupabaseProductRow(product) {
  const migrated = migrateInventoryProduct(product);
  const attributes = Array.isArray(migrated.attributes) ? migrated.attributes : [];

  return {
    id: migrated.id,
    name: migrated.name,
    description: migrated.description ?? null,
    price: migrated.prices?.public ?? migrated.price ?? 0,
    prices: migrated.prices ?? ensureFullPrices({ public: migrated.price ?? 0 }),
    currency: migrated.currency ?? 'USD',
    image_url: migrated.image_url,
    gallery: migrated.gallery,
    sort_order: Number.isFinite(Number(migrated.sort_order))
      ? Math.max(0, Math.floor(Number(migrated.sort_order)))
      : 0,
    is_featured: migrated.is_featured === true,
    view_count: Number.isFinite(Number(migrated.view_count))
      ? Math.max(0, Math.floor(Number(migrated.view_count)))
      : 0,
    attributes,
    stock: migrated.stock ?? 0,
    category: migrated.category ?? null,
    brand: migrated.brand ?? null,
    inventory_snapshot: migrated,
    updated_at: new Date().toISOString(),
  };
}

function rowToInventoryProduct(row) {
  const snapshot = row.inventory_snapshot;
  let product;

  if (snapshot && typeof snapshot === 'object' && snapshot.id) {
    product = migrateInventoryProduct(snapshot);
  } else {
    const prices = ensureFullPrices(row.prices ?? { public: row.price ?? 0 });
    const gallery = Array.isArray(row.gallery)
      ? row.gallery.filter((url) => typeof url === 'string' && url.length > 0)
      : row.image_url
        ? [row.image_url]
        : [];

    product = migrateInventoryProduct({
      id: row.id,
      name: row.name,
      description: row.description,
      prices,
      currency: row.currency ?? 'USD',
      image_url: row.image_url,
      gallery,
      stock: row.stock ?? 0,
      category: row.category,
      brand: row.brand,
      created_at: row.created_at,
      sort_order: row.sort_order ?? 0,
      is_featured: row.is_featured === true,
      view_count: Number.isFinite(Number(row.view_count))
        ? Math.max(0, Math.floor(Number(row.view_count)))
        : 0,
      attributes: Array.isArray(row.attributes) ? row.attributes : [],
    });
  }

  return withResolvedMedia(product);
}

function rowToPublicProduct(row, role, { listView = false } = {}) {
  const product = rowToInventoryProduct(row);
  return listView ? toPublicProductList(product, role) : toPublicProduct(product, role);
}

let bootstrapPromise = null;

const SUPABASE_PRODUCTS_PAGE_SIZE = 1000;

/** Columnas ligeras para listados/búsqueda (evita cargar inventory_snapshot completo). */
const SUPABASE_CATALOG_LIST_COLUMNS = [
  'id',
  'name',
  'description',
  'price',
  'prices',
  'currency',
  'image_url',
  'gallery',
  'stock',
  'category',
  'brand',
  'attributes',
  'sort_order',
  'is_featured',
  'view_count',
  'created_at',
].join(',');

/** Columnas extra para ficha de producto (adjuntos viven en inventory_snapshot). */
const SUPABASE_CATALOG_DETAIL_COLUMNS = `${SUPABASE_CATALOG_LIST_COLUMNS},inventory_snapshot`;

const PUBLIC_CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const SEARCH_RESULT_CACHE_TTL_MS = 30 * 1000;
const SEARCH_RESULT_CACHE_MAX = 256;

/** @type {Map<string, { products: unknown[]; cachedAt: number }>} */
const publicCatalogCache = new Map();
/** @type {Map<string, Promise<unknown[]>>} */
const publicCatalogInFlight = new Map();
/** @type {Map<string, { result: { products: unknown[]; total: number }; cachedAt: number }>} */
const searchResultCache = new Map();

/** @type {Map<string, Map<string, unknown>>} */
const publicCatalogById = new Map();

export function invalidatePublicCatalogCache() {
  publicCatalogCache.clear();
  publicCatalogInFlight.clear();
  searchResultCache.clear();
  publicCatalogById.clear();
  clearProductSearchHaystackCache();
}

function indexPublicCatalogById(role, products) {
  publicCatalogById.set(role, new Map(products.map((product) => [product.id, product])));
}

function isSupabaseProductsTableMissing(error) {
  const message = String(error?.message ?? error ?? '');
  return /Could not find the table ['"]?public\.products['"]?/i.test(message);
}

/** Solo reintenta sin sort_order cuando faltan columnas de orden (migración 005), no si falta la tabla. */
function isSupabaseSchemaColumnError(error) {
  const message = String(error?.message ?? error ?? '');
  if (isSupabaseProductsTableMissing(error)) return false;
  return /sort_order|created_at/i.test(message) && /column|schema cache/i.test(message);
}

function formatSupabaseCatalogError(error) {
  if (isSupabaseProductsTableMissing(error)) {
    return (
      'Tabla products no encontrada en Supabase. Aplica supabase/migrations/002_products.sql ' +
      'y 005_products_catalog_fields.sql, luego ejecuta npm run sync:supabase.'
    );
  }
  const message = String(error?.message ?? error ?? 'Error de catálogo Supabase');
  return message;
}

async function fetchProductPageFromSupabase(supabase, offset, { ordered, columns = '*' }) {
  let query = supabase.from('products').select(columns);
  if (ordered) {
    query = query.order('sort_order', { ascending: true }).order('created_at', { ascending: true });
  } else {
    query = query.order('id', { ascending: true });
  }
  return query.range(offset, offset + SUPABASE_PRODUCTS_PAGE_SIZE - 1);
}

async function fetchAllProductRowsFromSupabase(supabase, { columns = '*' } = {}) {
  /** @type {Record<string, unknown>[]} */
  const rows = [];
  let offset = 0;
  let ordered = true;

  while (true) {
    let result = await fetchProductPageFromSupabase(supabase, offset, { ordered, columns });

    if (result.error && ordered && isSupabaseSchemaColumnError(result.error)) {
      console.warn(
        '[catalog] columnas de orden faltantes; reintento sin sort_order (aplica migración 005).',
      );
      ordered = false;
      offset = 0;
      rows.length = 0;
      result = await fetchProductPageFromSupabase(supabase, offset, { ordered, columns });
    }

    if (result.error) {
      throw new Error(formatSupabaseCatalogError(result.error));
    }

    const page = result.data ?? [];
    rows.push(...page);

    if (page.length < SUPABASE_PRODUCTS_PAGE_SIZE) {
      break;
    }

    offset += SUPABASE_PRODUCTS_PAGE_SIZE;
  }

  return rows;
}

export async function ensureSupabaseCatalogSeeded() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

  if (process.env.HAISTORE_AUTO_SEED_CATALOG !== 'true') {
    return false;
  }

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const { count, error: countError } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      if (countError) {
        console.warn('[catalog] no se pudo comprobar catálogo Supabase:', countError.message);
        return false;
      }

      if ((count ?? 0) > 0) return true;

      const warehouses = normalizeWarehouses();
      const rows = seedProducts.map((seed) =>
        buildSupabaseProductRow(migrateInventoryProduct(seed, warehouses)),
      );

      await upsertProductRows(supabase, rows);

      console.log(`[catalog] sembrados ${rows.length} productos en Supabase`);
      return true;
    })();
  }

  return bootstrapPromise;
}

async function listFromSupabase(role, adminView) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureSupabaseCatalogSeeded();

  let rows;
  try {
    try {
      rows = await fetchAllProductRowsFromSupabase(supabase, {
        columns: SUPABASE_CATALOG_LIST_COLUMNS,
      });
    } catch (lightError) {
      const lightMessage = lightError instanceof Error ? lightError.message : String(lightError);
      if (/column|schema cache/i.test(lightMessage)) {
        console.warn('[catalog] consulta ligera falló; reintento con select *:', lightMessage);
        rows = await fetchAllProductRowsFromSupabase(supabase);
      } else {
        throw lightError;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[catalog] list Supabase:', message);
    if (/tabla products no encontrada/i.test(message)) {
      throw error instanceof Error ? error : new Error(message);
    }
    if (isSupabaseProductsTableMissing(error)) {
      throw new Error(formatSupabaseCatalogError(error));
    }
    return null;
  }

  if (adminView) {
    return rows.map((row) => rowToInventoryProduct(row));
  }

  return rows.map((row) => rowToPublicProduct(row, role, { listView: true }));
}

async function listFromInventory(role, adminView) {
  const { products } = await readInventory();
  if (adminView) {
    return products.map((product) => migrateInventoryProduct(product));
  }
  return products.map((product) =>
    toPublicProductList(withResolvedMedia(product), role),
  );
}

/**
 * Lista productos desde inventario unificado (JSON local + Supabase cuando aplica).
 * No usar solo Supabase: importaciones CLI (repuestos, tóner) viven en inventory.json.
 */
async function listProductsUncached({ role = 'public', adminView = false } = {}) {
  if (shouldPreferSupabaseCatalog()) {
    const fromDb = await listFromSupabase(role, adminView);
    if (fromDb != null) return fromDb;
  }
  return listFromInventory(role, adminView);
}

export async function listProducts({ role = 'public', adminView = false } = {}) {
  if (adminView) {
    return listProductsUncached({ role, adminView: true });
  }

  const cacheKey = role;
  const now = Date.now();
  const cached = publicCatalogCache.get(cacheKey);
  if (cached && now - cached.cachedAt < PUBLIC_CATALOG_CACHE_TTL_MS) {
    return cached.products;
  }

  const inFlight = publicCatalogInFlight.get(cacheKey);
  if (inFlight) {
    return inFlight;
  }

  const promise = listProductsUncached({ role, adminView: false })
    .then((products) => {
      publicCatalogCache.set(cacheKey, { products, cachedAt: Date.now() });
      indexPublicCatalogById(role, products);
      publicCatalogInFlight.delete(cacheKey);
      return products;
    })
    .catch((error) => {
      publicCatalogInFlight.delete(cacheKey);
      throw error;
    });

  publicCatalogInFlight.set(cacheKey, promise);
  return promise;
}

async function getFromSupabase(id, role) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureSupabaseCatalogSeeded();

  const { data, error } = await supabase
    .from('products')
    .select(SUPABASE_CATALOG_DETAIL_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('[catalog] get Supabase:', id, error.message);
    return null;
  }

  if (!data) return undefined;
  return rowToPublicProduct(data, role);
}

export async function getPublicProductById(id, role = 'public') {
  const normalizedId = String(id ?? '').trim();
  if (!normalizedId) return undefined;

  // El detalle siempre usa DTO completo (adjuntos, galería, descripción); no el listado en caché.
  if (shouldPreferSupabaseCatalog()) {
    const fromDb = await getFromSupabase(normalizedId, role);
    if (fromDb !== null) {
      if (fromDb === undefined) return undefined;
      return fromDb;
    }
  }

  const { products } = await readInventory();
  const product = products.find((entry) => entry.id === normalizedId);
  if (!product) return undefined;
  return toPublicProduct(withResolvedMedia(product), role);
}

function normalizeSearchText(value) {
  return normalizeCatalogSearchText(value);
}

/**
 * Búsqueda ligera en servidor (sin descargar todo el catálogo al cliente).
 */
export async function searchPublicProducts({
  query,
  role = 'public',
  limit = 8,
  categoryFilter = 'all',
} = {}) {
  const trimmed = String(query ?? '').trim();
  if (trimmed.length < 3) {
    return { products: [], total: 0 };
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 100);
  const normalizedCategory = categoryFilter && categoryFilter !== 'all' ? categoryFilter : 'all';
  const cacheKey = `${role}|${trimmed.toLowerCase()}|${normalizedCategory}|${safeLimit}`;
  const now = Date.now();
  const cachedSearch = searchResultCache.get(cacheKey);
  if (cachedSearch && now - cachedSearch.cachedAt < SEARCH_RESULT_CACHE_TTL_MS) {
    return cachedSearch.result;
  }

  const allProducts = await listProducts({ role });

  let matched = allProducts.filter((product) => productMatchesSearchQuery(product, trimmed));

  if (normalizedCategory !== 'all') {
    matched = matched.filter((product) => productMatchesCategoryFilter(product, normalizedCategory));
  }

  const total = matched.length;
  const products = takeTopProductsBySearchRelevance(matched, trimmed, safeLimit);
  const result = { products, total };

  if (searchResultCache.size >= SEARCH_RESULT_CACHE_MAX) {
    const oldestKey = searchResultCache.keys().next().value;
    if (oldestKey) searchResultCache.delete(oldestKey);
  }
  searchResultCache.set(cacheKey, { result, cachedAt: now });

  return result;
}

function toMinimalSupabaseRow(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? null,
    price: row.price ?? row.prices?.public ?? 0,
    prices: row.prices ?? ensureFullPrices({ public: row.price ?? 0 }),
    currency: row.currency ?? 'USD',
    image_url: row.image_url ?? null,
    stock: row.stock ?? 0,
    category: row.category ?? null,
    brand: row.brand ?? null,
  };
}

function toLegacySupabaseRow(row) {
  return toMinimalSupabaseRow(row);
}

function isMissingColumnError(message) {
  return /column|schema cache|Could not find/i.test(message);
}

async function upsertProductRows(supabase, rows) {
  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
  if (!error) return;

  if (!isMissingColumnError(error.message)) {
    console.error('[catalog] supabase upsert:', error.message);
    return;
  }

  console.warn(
    '[catalog] migraciones 005/006 pendientes; upsert con columnas base (sin snapshot de inventario).',
  );
  const legacyRows = rows.map(toLegacySupabaseRow);
  const { error: legacyError } = await supabase
    .from('products')
    .upsert(legacyRows, { onConflict: 'id' });
  if (legacyError) {
    console.error('[catalog] supabase upsert (legacy):', legacyError.message);
  }
}

/** Lista inventario admin desde Supabase sin pasar por readInventory (evita ciclos). */
export async function fetchInventoryProductsFromSupabase() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return [];

  await ensureSupabaseCatalogSeeded();

  try {
    const rows = await fetchAllProductRowsFromSupabase(supabase);
    return rows.map((row) => rowToInventoryProduct(row));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[catalog] fetch inventario Supabase:', message);
    if (isSupabaseProductsTableMissing(error)) {
      throw new Error(formatSupabaseCatalogError(error));
    }
    if (shouldPreferSupabaseCatalog() && process.env.VERCEL) {
      throw error instanceof Error ? error : new Error(message);
    }
    return [];
  }
}

export async function syncProductsToSupabase(products) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !Array.isArray(products) || products.length === 0) return;

  const byId = new Map();
  for (const product of products) {
    byId.set(product.id, buildSupabaseProductRow(product));
  }
  const rows = [...byId.values()];
  const BATCH = 200;
  for (let offset = 0; offset < rows.length; offset += BATCH) {
    await upsertProductRows(supabase, rows.slice(offset, offset + BATCH));
  }
}

export async function incrementProductViewCount(productId) {
  if (!productId?.trim()) return false;

  if (shouldPreferSupabaseCatalog()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('products')
        .select('view_count')
        .eq('id', productId)
        .maybeSingle();

      if (!error && data) {
        const next = Math.max(0, Math.floor(Number(data.view_count ?? 0))) + 1;
        const { error: updateError } = await supabase
          .from('products')
          .update({ view_count: next })
          .eq('id', productId);
        if (!updateError) return true;
        if (!/column|schema cache|Could not find/i.test(updateError.message)) {
          console.warn('[catalog] increment view Supabase:', updateError.message);
        }
      }
    }
  }

  const inventory = await readInventory();
  const index = inventory.products.findIndex((entry) => entry.id === productId);
  if (index === -1) return false;

  const current = inventory.products[index];
  const view_count = Math.max(0, Math.floor(Number(current.view_count ?? 0))) + 1;
  inventory.products[index] = { ...current, view_count };
  await writeInventory(
    {
      products: inventory.products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    },
    { syncProductIds: [productId] },
  );

  return true;
}

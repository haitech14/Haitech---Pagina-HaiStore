import { ensureFullPrices } from './roles.js';
import {
  migrateInventoryProduct,
  readInventory,
  toPublicProduct,
  writeInventory,
} from './inventory-store.js';
import { seedProducts } from './seed-products.js';
import { shouldPreferSupabaseCatalog } from './catalog-source.js';
import { getSupabaseAdmin } from './supabase-auth.js';
import { normalizeWarehouses } from './inventory-warehouses.js';
import { resolveProductGallery, resolveProductImageUrl } from './product-image-url.js';

export { shouldPreferSupabaseCatalog };

export function withResolvedMedia(product) {
  const image_url = resolveProductImageUrl(product);
  const gallery = resolveProductGallery(product);
  return { ...product, image_url, gallery };
}

export function buildSupabaseProductRow(product) {
  const migrated = migrateInventoryProduct(product);
  const withMedia = withResolvedMedia(migrated);
  const attributes = Array.isArray(withMedia.attributes) ? withMedia.attributes : [];

  return {
    id: withMedia.id,
    name: withMedia.name,
    description: withMedia.description ?? null,
    price: withMedia.prices?.public ?? withMedia.price ?? 0,
    prices: withMedia.prices ?? ensureFullPrices({ public: withMedia.price ?? 0 }),
    currency: withMedia.currency ?? 'USD',
    image_url: withMedia.image_url,
    gallery: withMedia.gallery,
    sort_order: Number.isFinite(Number(withMedia.sort_order))
      ? Math.max(0, Math.floor(Number(withMedia.sort_order)))
      : 0,
    is_featured: withMedia.is_featured === true,
    view_count: Number.isFinite(Number(withMedia.view_count))
      ? Math.max(0, Math.floor(Number(withMedia.view_count)))
      : 0,
    attributes,
    stock: withMedia.stock ?? 0,
    category: withMedia.category ?? null,
    brand: withMedia.brand ?? null,
    inventory_snapshot: withMedia,
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

function rowToPublicProduct(row, role) {
  return toPublicProduct(rowToInventoryProduct(row), role);
}

let bootstrapPromise = null;

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

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[catalog] list Supabase:', error.message);
    return null;
  }

  const rows = data ?? [];
  if (adminView) {
    return rows.map((row) => rowToInventoryProduct(row));
  }

  return rows.map((row) => rowToPublicProduct(row, role));
}

async function listFromInventory(role, adminView) {
  const { products } = await readInventory();
  if (adminView) {
    return products.map((product) => withResolvedMedia(product));
  }
  return products.map((product) => toPublicProduct(withResolvedMedia(product), role));
}

/**
 * Lista productos desde inventario unificado (JSON local + Supabase cuando aplica).
 * No usar solo Supabase: importaciones CLI (repuestos, tóner) viven en inventory.json.
 */
export async function listProducts({ role = 'public', adminView = false } = {}) {
  return listFromInventory(role, adminView);
}

async function getFromSupabase(id, role) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  await ensureSupabaseCatalogSeeded();

  const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();

  if (error) {
    console.error('[catalog] get Supabase:', id, error.message);
    return null;
  }

  if (!data) return undefined;
  return rowToPublicProduct(data, role);
}

export async function getPublicProductById(id, role = 'public') {
  if (shouldPreferSupabaseCatalog()) {
    const fromDb = await getFromSupabase(id, role);
    if (fromDb !== null) {
      if (fromDb === undefined) return undefined;
      return fromDb;
    }
  }

  const { products } = await readInventory();
  const product = products.find((entry) => entry.id === id);
  if (!product) return undefined;
  return toPublicProduct(withResolvedMedia(product), role);
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

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[catalog] fetch inventario Supabase:', error.message);
    return [];
  }

  return (data ?? []).map((row) => rowToInventoryProduct(row));
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

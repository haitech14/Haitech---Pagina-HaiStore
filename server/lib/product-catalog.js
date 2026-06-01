import { ensureFullPrices } from './roles.js';
import {
  migrateInventoryProduct,
  readInventory,
  toPublicProduct,
} from './inventory-store.js';
import { seedProducts } from './seed-products.js';
import { getSupabaseAdmin, isSupabaseAuthEnabled } from './supabase-auth.js';
import { normalizeWarehouses } from './inventory-warehouses.js';

/** En Vercel el disco es efímero; Supabase es la fuente de verdad del catálogo. */
export function shouldPreferSupabaseCatalog() {
  if (!isSupabaseAuthEnabled()) return false;
  if (process.env.HAISTORE_CATALOG_SOURCE === 'file') return false;
  if (process.env.HAISTORE_CATALOG_SOURCE === 'supabase') return true;
  return Boolean(process.env.VERCEL);
}

export function buildSupabaseProductRow(product) {
  const image_url =
    typeof product.image_url === 'string' && product.image_url.startsWith('data:')
      ? null
      : product.image_url;

  const gallery = Array.isArray(product.gallery)
    ? product.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : image_url
      ? [image_url]
      : [];

  const attributes = Array.isArray(product.attributes) ? product.attributes : [];

  return {
    id: product.id,
    name: product.name,
    description: product.description ?? null,
    price: product.prices?.public ?? product.price ?? 0,
    prices: product.prices ?? ensureFullPrices({ public: product.price ?? 0 }),
    currency: product.currency ?? 'USD',
    image_url,
    gallery,
    sort_order: Number.isFinite(Number(product.sort_order))
      ? Math.max(0, Math.floor(Number(product.sort_order)))
      : 0,
    attributes,
    stock: product.stock ?? 0,
    category: product.category ?? null,
    brand: product.brand ?? null,
    inventory_snapshot: product,
    updated_at: new Date().toISOString(),
  };
}

function rowToInventoryProduct(row) {
  const snapshot = row.inventory_snapshot;
  if (snapshot && typeof snapshot === 'object' && snapshot.id) {
    return migrateInventoryProduct(snapshot);
  }

  const prices = ensureFullPrices(row.prices ?? { public: row.price ?? 0 });
  const gallery = Array.isArray(row.gallery)
    ? row.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : row.image_url
      ? [row.image_url]
      : [];

  return migrateInventoryProduct({
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
    attributes: Array.isArray(row.attributes) ? row.attributes : [],
  });
}

function rowToPublicProduct(row, role) {
  return toPublicProduct(rowToInventoryProduct(row), role);
}

let bootstrapPromise = null;

export async function ensureSupabaseCatalogSeeded() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return false;

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
  if (adminView) return products;
  return products.map((product) => toPublicProduct(product, role));
}

export async function listProducts({ role = 'public', adminView = false } = {}) {
  if (shouldPreferSupabaseCatalog()) {
    const fromDb = await listFromSupabase(role, adminView);
    if (fromDb) return fromDb;
  }
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
  return toPublicProduct(product, role);
}

function toLegacySupabaseRow(row) {
  const {
    gallery: _g,
    sort_order: _s,
    attributes: _a,
    inventory_snapshot: _i,
    updated_at: _u,
    ...legacy
  } = row;
  return legacy;
}

async function upsertProductRows(supabase, rows) {
  const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
  if (!error) return;

  const missingColumn =
    /column|schema cache|Could not find/i.test(error.message) &&
    rows.some((row) => row.gallery !== undefined || row.inventory_snapshot !== undefined);

  if (!missingColumn) {
    console.error('[catalog] supabase upsert:', error.message);
    return;
  }

  console.warn('[catalog] migración 005 pendiente; upsert sin gallery/snapshot');
  const legacyRows = rows.map(toLegacySupabaseRow);
  const { error: legacyError } = await supabase
    .from('products')
    .upsert(legacyRows, { onConflict: 'id' });
  if (legacyError) {
    console.error('[catalog] supabase upsert (legacy):', legacyError.message);
  }
}

export async function syncProductsToSupabase(products) {
  const supabase = getSupabaseAdmin();
  if (!supabase || !Array.isArray(products) || products.length === 0) return;

  const rows = products.map((product) => buildSupabaseProductRow(product));
  await upsertProductRows(supabase, rows);
}

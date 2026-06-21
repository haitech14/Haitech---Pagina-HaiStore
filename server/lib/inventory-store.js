import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

import { normalizeAttributes } from './inventory-attributes.js';
import { optimizeProductMedia } from './optimize-image.js';
import { persistProductMedia } from './persist-product-media.js';
import {
  normalizeProductStock,
  normalizeWarehouses,
  stockFromTotal,
} from './inventory-warehouses.js';
import { seedProducts } from './seed-products.js';
import { ensureProductSortOrders, sortProductsByOrder } from './inventory-product-order.js';
import { resolveProductGallery, resolveProductImageUrl } from './product-image-url.js';
import { sanitizeStoredProductMedia } from '../../shared/product-media-sanitize.js';
import { normalizeCompatibleTonerProductFields } from '../../shared/compatible-toner.js';
import { isBundleProduct, normalizeBundleComponents, syncInventoryBundleProducts } from './product-bundle.js';
import { ensureFullPrices, resolvePriceRole } from './roles.js';
import { shouldPreferSupabaseCatalog } from './catalog-source.js';
import { getInventoryPath } from './server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INVENTORY_CACHE_TTL_MS = 45_000;
let inventoryReadCache = null;
let inventoryReadCacheAt = 0;

function invalidateInventoryReadCache() {
  inventoryReadCache = null;
  inventoryReadCacheAt = 0;
}

function inventoryPath() {
  return getInventoryPath();
}

async function ensureInventoryFile() {
  const filePath = inventoryPath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const emptyInventory = {
      products: [],
      warehouses: normalizeWarehouses(),
      deletedProductIds: [],
    };
    // En Vercel el disco es efímero; no sembrar el catálogo demo si Supabase es la fuente.
    if (shouldPreferSupabaseCatalog() && process.env.VERCEL) {
      await fs.writeFile(filePath, JSON.stringify(emptyInventory, null, 2));
      return;
    }
    await fs.writeFile(filePath, JSON.stringify({ products: seedProducts }, null, 2));
  }
}

function normalizeSuppliers(value, legacyPurchaseUsd) {
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const name = typeof entry.name === 'string' ? entry.name.trim() : '';
        const purchase_price_usd = Math.max(0, Number(entry.purchase_price_usd) || 0);
        const id =
          typeof entry.id === 'string' && entry.id.trim().length > 0
            ? entry.id.trim()
            : randomUUID();
        if (!name && purchase_price_usd <= 0) return null;
        return { id, name, purchase_price_usd };
      })
      .filter(Boolean);
  }

  const legacy = Math.max(0, Number(legacyPurchaseUsd) || 0);
  if (legacy > 0) {
    return [{ id: randomUUID(), name: '', purchase_price_usd: legacy }];
  }

  return [];
}

const PRODUCT_ATTACHMENT_KINDS = ['technical_sheet', 'manual', 'brochure', 'other'];
const PRODUCT_ATTACHMENT_LABELS = {
  technical_sheet: 'Ficha técnica',
  manual: 'Manual',
  brochure: 'Brochure',
  other: 'Otro',
};

function normalizeAttachments(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null;
      const url = typeof entry.url === 'string' ? entry.url.trim() : '';
      if (!url) return null;
      const kind = PRODUCT_ATTACHMENT_KINDS.includes(entry.kind) ? entry.kind : 'other';
      const label =
        typeof entry.label === 'string' && entry.label.trim()
          ? entry.label.trim()
          : PRODUCT_ATTACHMENT_LABELS[kind];
      return {
        id:
          typeof entry.id === 'string' && entry.id.trim().length > 0
            ? entry.id.trim()
            : randomUUID(),
        kind,
        label,
        url,
        file_name: typeof entry.file_name === 'string' ? entry.file_name : undefined,
        mime_type: typeof entry.mime_type === 'string' ? entry.mime_type : undefined,
      };
    })
    .filter(Boolean);
}

function resolvePurchasePriceUsd(suppliers, fallbackUsd = 0) {
  const priced = suppliers
    .map((supplier) => Number(supplier.purchase_price_usd) || 0)
    .filter((price) => price > 0);

  if (priced.length > 0) {
    return Math.round(Math.min(...priced) * 100) / 100;
  }

  return Math.max(0, Number(fallbackUsd) || 0);
}

export function migrateInventoryProduct(product, warehouses = normalizeWarehouses()) {
  const normalizedToner = normalizeCompatibleTonerProductFields(product) ?? product;
  const prices = ensureFullPrices(normalizedToner.prices ?? { public: normalizedToner.price ?? 0 });
  const publicPrice = prices.public ?? 0;
  const gallery = Array.isArray(normalizedToner.gallery)
    ? normalizedToner.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : normalizedToner.image_url
      ? [normalizedToner.image_url]
      : [];
  const image_url = normalizedToner.image_url ?? gallery[0] ?? null;
  const fallbackPurchase = Number(
    normalizedToner.purchase_price_usd ?? Math.round(publicPrice * 0.72 * 100) / 100,
  );
  const suppliers = normalizeSuppliers(normalizedToner.suppliers, fallbackPurchase);
  const attachments = normalizeAttachments(normalizedToner.attachments);
  const attributes = normalizeAttributes(normalizedToner.attributes);
  const { stock_by_warehouse, stock } = normalizeProductStock(
    normalizedToner.stock_by_warehouse,
    normalizedToner.stock,
    warehouses,
  );

  const sort_order = Number.isFinite(Number(normalizedToner.sort_order))
    ? Math.max(0, Math.floor(Number(normalizedToner.sort_order)))
    : undefined;

  const merged = {
    ...normalizedToner,
    ...(sort_order !== undefined ? { sort_order } : {}),
    bundle_components: normalizeBundleComponents(
      normalizedToner.bundle_components ?? product.bundle_components,
    ),
    prices,
    code: normalizedToner.code?.trim() || String(normalizedToner.id ?? '').toUpperCase().replace(/-/g, ''),
    suppliers,
    attachments,
    attributes,
    purchase_price_usd: resolvePurchasePriceUsd(suppliers, fallbackPurchase),
    image_url,
    gallery: gallery.length > 0 ? gallery : image_url ? [image_url] : [],
    stock_by_warehouse,
    stock,
  };

  const media = sanitizeStoredProductMedia(merged);
  return { ...merged, image_url: media.image_url, gallery: media.gallery };
}

function normalizeDeletedIds(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && id.length > 0))];
}

export function getDeletedProductIds(data) {
  return normalizeDeletedIds(data?.deletedProductIds);
}

/**
 * Fusiona un producto del catálogo maestro con el existente en inventario.
 * Conserva stock, proveedores, adjuntos y atributos; actualiza precios e imágenes del catálogo.
 */
export function mergeCatalogProduct(seed, existing, warehouses) {
  if (!existing) {
    return migrateInventoryProduct(seed, warehouses);
  }

  const seedGallery = Array.isArray(seed.gallery)
    ? seed.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];
  const existingGallery = Array.isArray(existing.gallery)
    ? existing.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];

  return migrateInventoryProduct(
    {
      ...seed,
      sort_order: existing.sort_order,
      code: existing.code?.trim() || seed.code,
      name: existing.name?.trim() || seed.name,
      category: existing.category ?? seed.category,
      brand: existing.brand ?? seed.brand,
      stock: existing.stock,
      stock_by_warehouse: existing.stock_by_warehouse,
      suppliers: existing.suppliers,
      attachments: existing.attachments,
      attributes: existing.attributes,
      purchase_price_usd: existing.purchase_price_usd,
      prices: seed.prices ?? existing.prices,
      description: seed.description ?? existing.description,
      image_url: seed.image_url ?? existing.image_url,
      gallery: seedGallery.length > 0 ? seedGallery : existingGallery,
      compare_at_price_usd: seed.compare_at_price_usd ?? existing.compare_at_price_usd,
    },
    warehouses,
  );
}

/**
 * Alinea el inventario con el catálogo maestro (`inventory-catalog.json`).
 * Por defecto solo fusiona productos del catálogo que ya están en inventario (no crea filas nuevas).
 * @param {{ resetDeleted?: boolean; importMissing?: boolean }} options
 */
export async function syncInventoryFromCatalog(options = {}) {
  const { resetDeleted = false, importMissing = false } = options;
  await ensureInventoryFile();
  const raw = await fs.readFile(inventoryPath(), 'utf-8');
  const data = JSON.parse(raw);
  let deletedProductIds = normalizeDeletedIds(data.deletedProductIds);

  if (resetDeleted) {
    deletedProductIds = [];
  }

  const deleted = new Set(deletedProductIds);
  const catalogIds = new Set(seedProducts.map((seed) => seed.id));
  const warehouses = normalizeWarehouses(data.warehouses);

  const existingById = new Map(
    (data.products ?? []).map((product) => [product.id, product]),
  );

  const catalogProducts = seedProducts
    .filter((seed) => !deleted.has(seed.id))
    .filter((seed) => importMissing || existingById.has(seed.id))
    .map((seed) => mergeCatalogProduct(seed, existingById.get(seed.id), warehouses));

  const customProducts = (data.products ?? [])
    .filter((product) => !catalogIds.has(product.id) && !deleted.has(product.id))
    .map((product) => migrateInventoryProduct(product));

  const merged = [...catalogProducts, ...customProducts].map((product) =>
    migrateInventoryProduct(product, warehouses),
  );
  const { products } = ensureProductSortOrders(merged);

  await writeInventory({ products, deletedProductIds, warehouses });

  return {
    products,
    deletedProductIds,
    warehouses,
    catalogCount: catalogProducts.length,
    customCount: customProducts.length,
  };
}

async function readInventoryFromLocalFile() {
  await ensureInventoryFile();
  const raw = await fs.readFile(inventoryPath(), 'utf-8');
  const data = JSON.parse(raw);
  const deletedProductIds = getDeletedProductIds(data);
  const deleted = new Set(deletedProductIds);
  const warehouses = normalizeWarehouses(data.warehouses);
  const products = (data.products ?? [])
    .filter((product) => !deleted.has(product.id))
    .map((product) => migrateInventoryProduct(product, warehouses));

  return { products, deletedProductIds, warehouses };
}

function mergeInventoryProductLists(supabaseProducts, fileProducts, warehouses) {
  const byId = new Map();

  for (const product of fileProducts) {
    byId.set(product.id, migrateInventoryProduct(product, warehouses));
  }

  for (const product of supabaseProducts) {
    byId.set(product.id, migrateInventoryProduct(product, warehouses));
  }

  return [...byId.values()];
}

async function readInventoryFromSupabase() {
  const { fetchInventoryProductsFromSupabase } = await import('./product-catalog.js');
  const supabaseProducts = await fetchInventoryProductsFromSupabase();

  let warehouses = normalizeWarehouses();
  let deletedProductIds = [];
  let fileProducts = [];

  const skipEphemeralLocalMerge =
    Boolean(process.env.VERCEL) &&
    !process.env.HAISTORE_DATA_DIR &&
    supabaseProducts.length > 0;

  if (!skipEphemeralLocalMerge) {
    try {
      const local = await readInventoryFromLocalFile();
      warehouses = local.warehouses;
      deletedProductIds = local.deletedProductIds;
      const seedIds = new Set(seedProducts.map((seed) => seed.id));
      fileProducts = local.products.filter((product) => !seedIds.has(product.id));
    } catch {
      // En Vercel no hay archivo persistente; solo Supabase.
    }
  }

  const deleted = new Set(deletedProductIds);
  const merged = mergeInventoryProductLists(supabaseProducts, fileProducts, warehouses).filter(
    (product) => !deleted.has(product.id),
  );

  const { products, changed: sortChanged } = ensureProductSortOrders(merged);
  const bundleSync = syncInventoryBundleProducts(products, warehouses);

  return {
    products: bundleSync.products,
    deletedProductIds,
    warehouses,
    ...(sortChanged || bundleSync.changed ? { _needsPersist: true } : {}),
  };
}

export async function readInventory() {
  const now = Date.now();
  if (inventoryReadCache && now - inventoryReadCacheAt < INVENTORY_CACHE_TTL_MS) {
    return inventoryReadCache;
  }

  let result;
  if (shouldPreferSupabaseCatalog()) {
    const loaded = await readInventoryFromSupabase();
    let products = loaded.products;
    if (loaded._needsPersist) {
      await writeInventory({
        products,
        deletedProductIds: loaded.deletedProductIds,
        warehouses: loaded.warehouses,
      });
    }
    result = {
      products,
      deletedProductIds: loaded.deletedProductIds,
      warehouses: loaded.warehouses,
    };
  } else {
    await ensureInventoryFile();
    const raw = await fs.readFile(inventoryPath(), 'utf-8');
    const data = JSON.parse(raw);
    const deletedProductIds = getDeletedProductIds(data);
    const deleted = new Set(deletedProductIds);
    const warehouses = normalizeWarehouses(data.warehouses);

    const migrated = (data.products ?? [])
      .filter((product) => !deleted.has(product.id))
      .map((product) => migrateInventoryProduct(product, warehouses));

    const { products, changed: sortChanged } = ensureProductSortOrders(migrated);
    const bundleSync = syncInventoryBundleProducts(products, warehouses);
    const hadStaleDeleted = (data.products ?? []).some((product) => deleted.has(product.id));

    if (hadStaleDeleted || sortChanged || bundleSync.changed) {
      await writeInventory({
        products: bundleSync.products,
        deletedProductIds,
        warehouses,
      });
    }

    result = { products: bundleSync.products, deletedProductIds, warehouses };
  }

  const preferSupabase = shouldPreferSupabaseCatalog();
  const shouldCacheResult =
    result.products.length > 0 || !preferSupabase || !process.env.VERCEL;

  if (preferSupabase && process.env.VERCEL && result.products.length === 0) {
    console.warn(
      '[inventory] catálogo vacío en Vercel con Supabase; devuelve lista vacía (ejecuta npm run sync:supabase).',
    );
  }

  if (shouldCacheResult) {
    inventoryReadCache = result;
    inventoryReadCacheAt = now;
  }
  return result;
}

/**
 * @param {object} data
 * @param {{ syncProductIds?: string[] }} [options] IDs a sincronizar en Supabase (por defecto todos).
 */
export async function writeInventory(data, options = {}) {
  invalidateInventoryReadCache();
  const preferSupabase = shouldPreferSupabaseCatalog();
  const syncProductIds = Array.isArray(options.syncProductIds)
    ? [...new Set(options.syncProductIds.filter((id) => typeof id === 'string' && id.length > 0))]
    : null;

  let warehouses = data.warehouses;
  if (!warehouses) {
    try {
      const raw = await fs.readFile(inventoryPath(), 'utf-8');
      warehouses = normalizeWarehouses(JSON.parse(raw).warehouses);
    } catch {
      warehouses = normalizeWarehouses();
    }
  } else {
    warehouses = normalizeWarehouses(warehouses);
  }

  const migrated = (data.products ?? []).map((product) =>
    migrateInventoryProduct(product, warehouses),
  );
  const bundleSync = syncInventoryBundleProducts(migrated, warehouses);
  const withPublicMedia = await Promise.all(
    bundleSync.products.map((product) => persistProductMedia(product)),
  );
  const products = await Promise.all(withPublicMedia.map((product) => optimizeProductMedia(product)));
  const normalized = {
    products,
    deletedProductIds: normalizeDeletedIds(data.deletedProductIds),
    warehouses,
  };

  if (preferSupabase) {
    const { syncProductsToSupabase } = await import('./product-catalog.js');
    const productsToSync =
      syncProductIds?.length > 0
        ? products.filter((product) => syncProductIds.includes(product.id))
        : products;
    if (productsToSync.length > 0) {
      await syncProductsToSupabase(productsToSync);
    }
    if (!process.env.VERCEL) {
      await fs.mkdir(path.dirname(inventoryPath()), { recursive: true });
      await fs.writeFile(inventoryPath(), JSON.stringify(normalized, null, 2));
    }
    return normalized;
  }

  await fs.mkdir(path.dirname(inventoryPath()), { recursive: true });
  await fs.writeFile(inventoryPath(), JSON.stringify(normalized, null, 2));
  return normalized;
}

export { resolvePriceRole };

export function getEffectivePrice(product, role) {
  const priceRole = resolvePriceRole(role);
  const prices = ensureFullPrices(product.prices ?? { public: product.price ?? 0 });
  return prices[priceRole] ?? prices.public ?? 0;
}

export function toPublicProduct(product, role) {
  const priceRole = resolvePriceRole(role);
  const prices = ensureFullPrices(product.prices ?? { public: product.price ?? 0 });
  const image_url = resolveProductImageUrl(product);
  const gallery = resolveProductGallery(product);

  return {
    id: product.id,
    code: product.code ?? null,
    name: product.name,
    description: product.description ?? null,
    price: prices[priceRole] ?? prices.public ?? 0,
    prices,
    currency: product.currency ?? 'USD',
    image_url,
    gallery,
    stock: product.stock ?? 0,
    category: product.category ?? null,
    brand: product.brand ?? null,
    created_at: product.created_at,
    price_role: priceRole,
    sort_order: Number.isFinite(Number(product.sort_order)) ? Number(product.sort_order) : 0,
    is_featured: product.is_featured === true,
    view_count: Number.isFinite(Number(product.view_count))
      ? Math.max(0, Math.floor(Number(product.view_count)))
      : 0,
    attributes: product.attributes ?? [],
    attachments: normalizeAttachments(product.attachments).filter((attachment) =>
      ['technical_sheet', 'manual', 'brochure'].includes(attachment.kind),
    ),
  };
}

/** DTO mínimo para tarjetas de catálogo (sin attributes ni prices completos). */
export function toPublicProductCard(product, role) {
  const full = toPublicProduct(product, role);
  return {
    id: full.id,
    code: full.code,
    name: full.name,
    price: full.price,
    currency: full.currency,
    image_url: full.image_url,
    stock: full.stock,
    category: full.category,
    brand: full.brand,
    sort_order: full.sort_order,
    price_role: full.price_role,
  };
}

/** DTO ligero para listados (sin description, gallery ni attachments). */
export function toPublicProductList(product, role) {
  const full = toPublicProduct(product, role);
  return {
    id: full.id,
    code: full.code,
    name: full.name,
    price: full.price,
    prices: full.prices,
    currency: full.currency,
    image_url: full.image_url,
    stock: full.stock,
    category: full.category,
    brand: full.brand,
    sort_order: full.sort_order,
    is_featured: full.is_featured,
    view_count: full.view_count,
    attributes: full.attributes,
    price_role: full.price_role,
  };
}

export { applyOrderedIds, ensureProductSortOrders, sortProductsByOrder } from './inventory-product-order.js';

export function normalizeProductInput(body, existing, warehouses) {
  const basePublic = Number(
    body.prices?.public ?? body.price ?? existing?.prices?.public ?? 0,
  );
  const prices = ensureFullPrices({
    ...(existing?.prices ?? {}),
    ...(body.prices ?? {}),
    public: basePublic,
  });

  const gallery = Array.isArray(body.gallery)
    ? body.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : existing?.gallery ?? [];
  const image_url = body.image_url ?? existing?.image_url ?? gallery[0] ?? null;

  const rawId = existing?.id ?? body.id;
  const id =
    typeof rawId === 'string' && rawId.trim().length > 0 ? rawId.trim() : randomUUID();

  const warehouseList = normalizeWarehouses(warehouses);
  const hasStockByWarehouse = Array.isArray(body.stock_by_warehouse);
  const stockPatch = hasStockByWarehouse
    ? normalizeProductStock(body.stock_by_warehouse, existing?.stock ?? 0, warehouseList)
    : body.stock !== undefined && body.stock !== null
      ? stockFromTotal(body.stock, warehouseList)
      : normalizeProductStock(
          existing?.stock_by_warehouse,
          existing?.stock ?? 0,
          warehouseList,
        );

  return migrateInventoryProduct(
    {
      id,
      code: body.code ?? existing?.code,
      name: String(body.name ?? existing?.name ?? '').trim(),
      description: body.description ?? existing?.description ?? null,
      currency: body.currency ?? existing?.currency ?? 'USD',
      stock: stockPatch.stock,
      stock_by_warehouse: stockPatch.stock_by_warehouse,
      category: body.category ?? existing?.category ?? null,
      brand: body.brand ?? existing?.brand ?? null,
      image_url,
      gallery,
      purchase_price_usd: body.purchase_price_usd ?? existing?.purchase_price_usd,
      suppliers: body.suppliers ?? existing?.suppliers,
      attachments: body.attachments ?? existing?.attachments,
      attributes: body.attributes ?? existing?.attributes,
      bundle_components: body.bundle_components ?? existing?.bundle_components,
      created_at: existing?.created_at ?? new Date().toISOString(),
      sort_order:
        body.sort_order !== undefined && body.sort_order !== null
          ? body.sort_order
          : existing?.sort_order,
      prices,
    },
    warehouseList,
  );
}

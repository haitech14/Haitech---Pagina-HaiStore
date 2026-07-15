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
import { normalizeProductGalleryFields } from '../../shared/product-gallery.js';
import {
  normalizeStorefrontFeatureBar,
  normalizeStorefrontHeroBullets,
} from '../../shared/product-storefront-detail.js';
import { normalizeVolumeRolePrices } from '../../shared/product-volume-role-prices.js';
import { normalizeCompatibleTonerProductFields } from '../../shared/compatible-toner.js';
import {
  isCompatibleTonerProduct,
  normalizeCompatibleTonerProductCode,
} from '../../shared/compatible-toner-product-code.js';
import { normalizeProductCode } from '../../shared/product-code-prefix.js';
import { deriveProductSlug } from '../../shared/product-slug.js';
import { normalizeProductCatalogStatus } from '../../shared/product-catalog-status.js';
import { formatNuevaProductName } from '../../shared/inventory-product-name.js';
import { normalizeMerchandisingOptionalProducts } from '../../shared/merchandising-optional-product.js';
import { isBundleProduct, normalizeBundleComponents, syncInventoryBundleProducts } from './product-bundle.js';
import { ensureFullPrices, resolvePriceRole } from './roles.js';
import { shouldPreferSupabaseCatalog } from './catalog-source.js';
import { getInventoryPath } from './server-paths.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INVENTORY_CACHE_TTL_MS = 5 * 60 * 1000;
let inventoryReadCache = null;
let inventoryReadCacheAt = 0;
/** @type {Promise<{ products: unknown[]; deletedProductIds: string[]; warehouses: unknown }> | null} */
let inventoryReadInFlight = null;
/**
 * Sube en cada invalidate/write. Evita que un loadInventoryUncached arrancado
 * *antes* de un duplicate/create/patch repueble inventoryReadCache con el
 * snapshot viejo (síntoma: toast «Copia creada» pero la fila no aparece).
 */
let inventoryReadEpoch = 0;

function invalidateInventoryReadCache() {
  inventoryReadCache = null;
  inventoryReadCacheAt = 0;
  inventoryReadEpoch += 1;
  // No reutilizar el in-flight: los nuevos lectores deben abrir un load nuevo.
  // El promise viejo sigue vivo pero su .then no debe pisar un caché más fresco.
  inventoryReadInFlight = null;
}

export { invalidateInventoryReadCache };

function isUnreadableInventoryRaw(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return true;
  // OneDrive / sync a veces deja el archivo lleno de NUL manteniendo el tamaño.
  if (raw.charCodeAt(0) === 0) return true;
  try {
    const data = JSON.parse(raw);
    return !data || !Array.isArray(data.products);
  } catch {
    return true;
  }
}

async function verifyJsonFileReadable(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  if (isUnreadableInventoryRaw(raw)) {
    throw new Error(`Archivo JSON ilegible tras escritura: ${filePath}`);
  }
}

async function writeJsonFileAtomic(filePath, data) {
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmpPath, payload, 'utf8');
  try {
    await fs.rename(tmpPath, filePath);
  } catch (error) {
    // Windows/OneDrive: rename sobre destino existente suele fallar con EPERM.
    if (error && (error.code === 'EPERM' || error.code === 'EEXIST')) {
      try {
        await fs.copyFile(tmpPath, filePath);
        await fs.unlink(tmpPath).catch(() => {});
      } catch {
        await fs.unlink(tmpPath).catch(() => {});
        await fs.writeFile(filePath, payload, 'utf8');
      }
    } else {
      await fs.unlink(tmpPath).catch(() => {});
      await fs.writeFile(filePath, payload, 'utf8');
    }
  }
  try {
    await verifyJsonFileReadable(filePath);
  } catch {
    // Reintento directo: copyFile/rename en OneDrive a veces deja el destino en ceros.
    await fs.writeFile(filePath, payload, 'utf8');
    await verifyJsonFileReadable(filePath);
  }
}

function inventoryPath() {
  return getInventoryPath();
}

function defaultInventorySeedPayload() {
  if (shouldPreferSupabaseCatalog() && process.env.VERCEL) {
    return {
      products: [],
      warehouses: normalizeWarehouses(),
      deletedProductIds: [],
    };
  }
  return {
    products: seedProducts,
    warehouses: normalizeWarehouses(),
    deletedProductIds: [],
  };
}

async function ensureInventoryFile() {
  const filePath = inventoryPath();
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!isUnreadableInventoryRaw(raw)) return;
    console.warn('[inventory] inventory.json corrupto o vacío; se reescribe desde respaldo.');
  } catch {
    // ausente → sembrar abajo
  }

  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const recovered = await tryRecoverInventoryPayload();
  await writeJsonFileAtomic(filePath, recovered ?? defaultInventorySeedPayload());
}

/**
 * Intenta reconstruir inventario desde Supabase o el snapshot público slim.
 * @returns {Promise<{ products: unknown[]; deletedProductIds: string[]; warehouses: unknown } | null>}
 */
async function tryRecoverInventoryPayload() {
  const warehouses = normalizeWarehouses();

  try {
    const { fetchInventoryProductsFromSupabase } = await import('./product-catalog.js');
    const supabaseProducts = await fetchInventoryProductsFromSupabase();
    if (Array.isArray(supabaseProducts) && supabaseProducts.length > 0) {
      const indexPath = path.join(__dirname, '../../public/catalog/inventory-index.json');
      let indexIds = null;
      try {
        const indexRaw = await fs.readFile(indexPath, 'utf8');
        const indexData = JSON.parse(indexRaw);
        if (Array.isArray(indexData.products) && indexData.products.length > 0) {
          indexIds = new Set(indexData.products.map((product) => product.id));
        }
      } catch {
        // sin índice: usar todo Supabase
      }

      const products = (
        indexIds
          ? supabaseProducts.filter((product) => indexIds.has(product.id))
          : supabaseProducts
      ).map((product) => migrateInventoryProduct(product, warehouses));

      // Si el índice es más reciente/completo que el cruce con Supabase, completar con slim.
      if (indexIds && products.length < indexIds.size * 0.5) {
        const byId = new Map(supabaseProducts.map((product) => [product.id, product]));
        const indexData = JSON.parse(await fs.readFile(indexPath, 'utf8'));
        return {
          products: indexData.products.map((slim) =>
            migrateInventoryProduct(byId.get(slim.id) ? { ...byId.get(slim.id), ...slim } : slim, warehouses),
          ),
          deletedProductIds: [],
          warehouses,
        };
      }

      if (products.length > 0) {
        return { products, deletedProductIds: [], warehouses };
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[inventory] recuperación desde Supabase falló:', message);
  }

  try {
    const indexPath = path.join(__dirname, '../../public/catalog/inventory-index.json');
    const indexRaw = await fs.readFile(indexPath, 'utf8');
    const indexData = JSON.parse(indexRaw);
    if (Array.isArray(indexData.products) && indexData.products.length > 0) {
      return {
        products: indexData.products.map((product) => migrateInventoryProduct(product, warehouses)),
        deletedProductIds: [],
        warehouses,
      };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[inventory] recuperación desde inventory-index falló:', message);
  }

  return null;
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

const PRODUCT_ATTACHMENT_KINDS = [
  'technical_sheet',
  'manual',
  'printer_driver',
  'firmware',
  'brochure',
  'other',
];
const PRODUCT_ATTACHMENT_LABELS = {
  technical_sheet: 'Ficha técnica',
  manual: 'Manual de usuario',
  printer_driver: 'Driver impresora',
  firmware: 'Firmware',
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
  const galleryFields = normalizeProductGalleryFields(normalizedToner.image_url, normalizedToner.gallery);
  const image_url = galleryFields.image_url;
  const gallery = galleryFields.gallery;
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

  const name = formatNuevaProductName(String(normalizedToner.name ?? '').trim());

  const merged = {
    ...normalizedToner,
    ...(name ? { name } : {}),
    ...(sort_order !== undefined ? { sort_order } : {}),
    status: normalizeProductCatalogStatus(normalizedToner.status),
    bundle_components: normalizeBundleComponents(
      normalizedToner.bundle_components ?? product.bundle_components,
    ),
    prices,
    volume_role_prices: normalizeVolumeRolePrices(
      normalizedToner.volume_role_prices ?? product.volume_role_prices,
    ),
    code: isCompatibleTonerProduct(normalizedToner)
      ? normalizeCompatibleTonerProductCode(normalizedToner)
      : normalizeProductCode(normalizedToner.code) ||
        String(normalizedToner.id ?? '').toUpperCase().replace(/-/g, ''),
    slug: String(normalizedToner.slug ?? '').trim() || undefined,
    suppliers,
    attachments,
    attributes,
    purchase_price_usd: resolvePurchasePriceUsd(suppliers, fallbackPurchase),
    image_url,
    gallery,
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
  const isPlaceholderProduct = (product) => {
    const id = String(product?.id ?? '').trim().toLowerCase();
    const code = String(product?.code ?? '').trim().toUpperCase();
    const name = String(product?.name ?? '');
    return id === 'codigo' || code === 'CODIGO' || /\bDESCRIPCION\b/i.test(name);
  };
  const products = (data.products ?? [])
    .filter((product) => !deleted.has(product.id))
    .filter((product) => !isPlaceholderProduct(product))
    .map((product) => migrateInventoryProduct(product, warehouses));

  return { products, deletedProductIds, warehouses };
}

function mergeInventoryProductLists(supabaseProducts, fileProducts, warehouses) {
  const byId = new Map();

  const isPlaceholderProduct = (product) => {
    const id = String(product?.id ?? '').trim().toLowerCase();
    const code = String(product?.code ?? '').trim().toUpperCase();
    const name = String(product?.name ?? '');
    return id === 'codigo' || code === 'CODIGO' || /\bDESCRIPCION\b/i.test(name);
  };

  for (const product of fileProducts) {
    if (isPlaceholderProduct(product)) continue;
    byId.set(product.id, migrateInventoryProduct(product, warehouses));
  }

  for (const product of supabaseProducts) {
    if (isPlaceholderProduct(product)) continue;
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

async function loadInventoryUncached(options = {}) {
  const allowDeferredPersist = options.allowDeferredPersist !== false;
  let result;
  let needsPersist = false;

  if (shouldPreferSupabaseCatalog()) {
    const loaded = await readInventoryFromSupabase();
    let products = loaded.products;
    needsPersist = Boolean(loaded._needsPersist);
    if (allowDeferredPersist && needsPersist) {
      scheduleDeferredInventoryPersist('supabase');
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
    const isPlaceholderProduct = (product) => {
      const id = String(product?.id ?? '').trim().toLowerCase();
      const code = String(product?.code ?? '').trim().toUpperCase();
      const name = String(product?.name ?? '');
      return id === 'codigo' || code === 'CODIGO' || /\bDESCRIPCION\b/i.test(name);
    };

    const migrated = (data.products ?? [])
      .filter((product) => !deleted.has(product.id))
      .filter((product) => !isPlaceholderProduct(product))
      .map((product) => migrateInventoryProduct(product, warehouses));

    const { products, changed: sortChanged } = ensureProductSortOrders(migrated);
    const bundleSync = syncInventoryBundleProducts(products, warehouses);
    const hadStaleDeleted = (data.products ?? []).some((product) => deleted.has(product.id));

    needsPersist = hadStaleDeleted || sortChanged || bundleSync.changed;
    if (allowDeferredPersist && needsPersist) {
      scheduleDeferredInventoryPersist('file');
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

  return { result, shouldCacheResult, needsPersist };
}

export async function readInventory() {
  const now = Date.now();
  if (inventoryReadCache && now - inventoryReadCacheAt < INVENTORY_CACHE_TTL_MS) {
    return inventoryReadCache;
  }

  if (!inventoryReadInFlight) {
    const epochAtStart = inventoryReadEpoch;
    const loadPromise = loadInventoryUncached()
      .then(({ result, shouldCacheResult }) => {
        if (epochAtStart !== inventoryReadEpoch) {
          // Hubo invalidate/write durante el load: no pisar caché fresco con snapshot viejo.
          if (inventoryReadCache) return inventoryReadCache;
          return result;
        }
        if (shouldCacheResult) {
          inventoryReadCache = result;
          inventoryReadCacheAt = Date.now();
        }
        return result;
      })
      .finally(() => {
        if (inventoryReadInFlight === loadPromise) {
          inventoryReadInFlight = null;
        }
      });
    inventoryReadInFlight = loadPromise;
  }

  return inventoryReadInFlight;
}

let inventoryWriteChain = Promise.resolve();
/** Sube en cada escritura exitosa; evita que un persist-on-read obsoleto pise un PATCH recién guardado. */
let inventoryWriteEpoch = 0;

function enqueueInventoryWrite(task) {
  const run = inventoryWriteChain.then(task);
  inventoryWriteChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/**
 * Persiste normalizaciones detectadas al leer, pero solo si nadie escribió después.
 * Si se encola con un snapshot viejo (p. ej. justo antes de un PATCH de imagen), se omite.
 */
function scheduleDeferredInventoryPersist(reason) {
  const epochAtSchedule = inventoryWriteEpoch;
  void enqueueInventoryWrite(async () => {
    if (inventoryWriteEpoch !== epochAtSchedule) {
      console.warn(
        `[inventory] omitido persist-on-read obsoleto (${reason}): hay una escritura más reciente`,
      );
      return;
    }

    invalidateInventoryReadCache();
    const { result, needsPersist } = await loadInventoryUncached({
      allowDeferredPersist: false,
    });
    if (!needsPersist) return;
    if (inventoryWriteEpoch !== epochAtSchedule) {
      console.warn(
        `[inventory] omitido persist-on-read obsoleto (${reason}) tras re-lectura`,
      );
      return;
    }

    return writeInventoryUnlocked({
      products: result.products,
      deletedProductIds: result.deletedProductIds,
      warehouses: result.warehouses,
    });
  }).catch((err) => {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[inventory] persist on read deferred failed (${reason}):`, message);
  });
}

/**
 * Serializa escrituras para evitar lost updates cuando hay PATCHes rápidos en serie.
 * @param {object} data
 * @param {{ syncProductIds?: string[] }} [options]
 */
export async function writeInventory(data, options = {}) {
  return enqueueInventoryWrite(() => writeInventoryUnlocked(data, options));
}

/**
 * Read-modify-write atómico: el mutator corre con inventario fresco dentro de la cola.
 * @param {(inventory: object) => object | Promise<object>} mutator
 * @param {{ syncProductIds?: string[] }} [options]
 */
export async function mutateInventory(mutator, options = {}) {
  return enqueueInventoryWrite(async () => {
    invalidateInventoryReadCache();
    // No programar persist-on-read aquí: usaría el snapshot pre-mutación y pisaría la imagen.
    const { result } = await loadInventoryUncached({ allowDeferredPersist: false });
    const next = await mutator(result);
    return writeInventoryUnlocked(next, options);
  });
}

async function writeInventoryUnlocked(data, options = {}) {
  invalidateInventoryReadCache();
  void import('./media-album-store.js')
    .then(({ invalidateInventoryMediaAlbumCache }) => invalidateInventoryMediaAlbumCache())
    .catch(() => {});
  void import('./home-catalog-bundle-snapshot.js')
    .then(({ regenerateHomeBundleSnapshotQuiet }) => regenerateHomeBundleSnapshotQuiet())
    .catch(() => {});
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
  const mediaTargetIds =
    syncProductIds?.length > 0
      ? new Set(syncProductIds)
      : null;

  const withPublicMedia = await Promise.all(
    bundleSync.products.map(async (product) => {
      if (mediaTargetIds && !mediaTargetIds.has(product.id)) {
        return product;
      }
      return persistProductMedia(product);
    }),
  );
  const products = await Promise.all(
    withPublicMedia.map(async (product) => {
      if (mediaTargetIds && !mediaTargetIds.has(product.id)) {
        return product;
      }
      return optimizeProductMedia(product);
    }),
  );
  const normalized = {
    products,
    deletedProductIds: normalizeDeletedIds(data.deletedProductIds),
    warehouses,
  };

  if (preferSupabase) {
    const { syncProductsToSupabase, invalidatePublicCatalogCache } = await import(
      './product-catalog.js'
    );
    const productsToSync =
      syncProductIds?.length > 0
        ? products.filter((product) => syncProductIds.includes(product.id))
        : products;
    if (productsToSync.length > 0) {
      await syncProductsToSupabase(productsToSync);
    }
    if (!process.env.VERCEL) {
      await fs.mkdir(path.dirname(inventoryPath()), { recursive: true });
      await writeJsonFileAtomic(inventoryPath(), normalized);
    }
    inventoryWriteEpoch += 1;
    // Bump read epoch al publicar el snapshot: un load arrancado a mitad del write
    // (epoch post-invalidate) no debe sobrescribir este caché fresco.
    inventoryReadEpoch += 1;
    inventoryReadInFlight = null;
    inventoryReadCache = normalized;
    inventoryReadCacheAt = Date.now();
    // Tras persistir: vaciar admin/public cache para que el siguiente GET vea altas/duplicados.
    invalidatePublicCatalogCache();
    return normalized;
  }

  await fs.mkdir(path.dirname(inventoryPath()), { recursive: true });
  await writeJsonFileAtomic(inventoryPath(), normalized);
  inventoryWriteEpoch += 1;
  inventoryReadEpoch += 1;
  inventoryReadInFlight = null;
  inventoryReadCache = normalized;
  inventoryReadCacheAt = Date.now();
  try {
    const { invalidatePublicCatalogCache } = await import('./product-catalog.js');
    invalidatePublicCatalogCache();
  } catch {
    // ignore
  }
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
    slug: product.slug ?? deriveProductSlug(product),
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
    storefront_feature_bar: normalizeStorefrontFeatureBar(product.storefront_feature_bar),
    storefront_hero_bullets: normalizeStorefrontHeroBullets(product.storefront_hero_bullets),
    attachments: normalizeAttachments(product.attachments).filter((attachment) =>
      ['technical_sheet', 'manual', 'printer_driver', 'firmware', 'brochure'].includes(
        attachment.kind,
      ),
    ),
    cross_sell_product_ids: Array.isArray(product.cross_sell_product_ids)
      ? product.cross_sell_product_ids.filter((id) => typeof id === 'string' && id.trim())
      : [],
    upsell_product_ids: Array.isArray(product.upsell_product_ids)
      ? product.upsell_product_ids.filter((id) => typeof id === 'string' && id.trim())
      : [],
    cross_sell_optional_products: normalizeMerchandisingOptionalProducts(
      product.cross_sell_optional_products,
    ),
    upsell_optional_products: normalizeMerchandisingOptionalProducts(
      product.upsell_optional_products,
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

/** DTO ligero para listados (sin description ni attachments; sí gallery para hover en cards). */
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
    gallery: full.gallery,
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
      storefront_feature_bar:
        body.storefront_feature_bar !== undefined
          ? normalizeStorefrontFeatureBar(body.storefront_feature_bar)
          : existing?.storefront_feature_bar,
      storefront_hero_bullets:
        body.storefront_hero_bullets !== undefined
          ? normalizeStorefrontHeroBullets(body.storefront_hero_bullets)
          : existing?.storefront_hero_bullets,
      bundle_components: body.bundle_components ?? existing?.bundle_components,
      cross_sell_product_ids: body.cross_sell_product_ids ?? existing?.cross_sell_product_ids,
      upsell_product_ids: body.upsell_product_ids ?? existing?.upsell_product_ids,
      variant_product_ids: body.variant_product_ids ?? existing?.variant_product_ids,
      cross_sell_optional_products:
        body.cross_sell_optional_products !== undefined
          ? normalizeMerchandisingOptionalProducts(body.cross_sell_optional_products)
          : existing?.cross_sell_optional_products,
      upsell_optional_products:
        body.upsell_optional_products !== undefined
          ? normalizeMerchandisingOptionalProducts(body.upsell_optional_products)
          : existing?.upsell_optional_products,
      volume_role_prices: body.volume_role_prices ?? existing?.volume_role_prices,
      created_at: existing?.created_at ?? new Date().toISOString(),
      sort_order:
        body.sort_order !== undefined && body.sort_order !== null
          ? body.sort_order
          : existing?.sort_order,
      slug: body.slug !== undefined ? body.slug : existing?.slug,
      status: body.status !== undefined ? body.status : existing?.status,
      is_featured:
        body.is_featured !== undefined ? body.is_featured : existing?.is_featured,
      prices,
    },
    warehouseList,
  );
}

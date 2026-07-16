import { Router } from 'express';
import { randomUUID } from 'crypto';

import { deriveProductSlug, buildProductPath } from '../../shared/product-slug.js';
import { resolveSiteOrigin, buildAbsoluteUrl } from '../../shared/site-origin.js';

import { requireAdmin, resolveRequestRole } from '../lib/auth-store.js';
import { notifyHaiSupportChange } from '../lib/haisupport-sync.js';
import {
  applyOrderedIds,
  assignProductSortOrders,
  sortProductsByOrder,
} from '../lib/inventory-product-order.js';
import {
  mutateInventory,
  normalizeProductInput,
  readInventory,
  syncInventoryFromCatalog,
  writeInventory,
} from '../lib/inventory-store.js';
import { applyBulkPatch } from '../lib/inventory-bulk-patch.js';
import {
  getPublicProductById,
  incrementProductViewCount,
  getAdminInventoryProductById,
  listProducts,
  searchPublicProducts,
  syncProductsToSupabase,
  toAdminListProduct,
} from '../lib/product-catalog.js';
import { regenerateHomeBundleSnapshotQuiet } from '../lib/home-catalog-bundle-snapshot.js';
import { regenerateInventoryIndexSnapshotQuiet } from '../lib/inventory-index-snapshot.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';
import {
  queryEquipmentConsumables,
  queryProductsByCategory,
  queryProductsByIds,
  queryRelatedProducts,
} from '../lib/catalog-query.js';
import { listHomeFeaturedProducts } from '../lib/home-featured-products.js';
import { listHomeCatalogSections } from '../lib/home-catalog-sections.js';
import { listHomeCatalogBundleWithSnapshot } from '../lib/home-catalog-bundle-snapshot.js';
import { shouldPreferSupabaseCatalog } from '../lib/catalog-source.js';

export const productsRouter = Router();

const HOME_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=600';
const LIST_CACHE_CONTROL = 'public, s-maxage=60, stale-while-revalidate=120';

function parseSectionIds(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return [...new Set(raw.split(',').map((id) => id.trim()).filter(Boolean))];
}

productsRouter.get('/', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const products = await listProducts({ role, adminView: false });
    res.set('Cache-Control', LIST_CACHE_CONTROL);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/home-bundle', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const featuredLimit = req.query.featuredLimit;
    const sectionsLimit = req.query.sectionsLimit;
    const category =
      typeof req.query.category === 'string' ? req.query.category : 'multifuncionales';
    const payload = await listHomeCatalogBundleWithSnapshot({
      role,
      featuredLimit,
      sectionsLimit,
      featuredCategorySlug: category,
    });
    res.set('Cache-Control', HOME_CACHE_CONTROL);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/home-featured', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const limit = req.query.limit;
    const category = typeof req.query.category === 'string' ? req.query.category : 'multifuncionales';
    const products = await listHomeFeaturedProducts({ role, categorySlug: category, limit });
    res.set('Cache-Control', HOME_CACHE_CONTROL);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/home-sections', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const sectionIds = parseSectionIds(req.query.sections);
    const limit = req.query.limit;
    const payload = await listHomeCatalogSections({ role, sectionIds, limit });
    res.set('Cache-Control', HOME_CACHE_CONTROL);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const products = await listProducts({ role: 'public', adminView: true });
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/admin/:id', requireAdmin, async (req, res, next) => {
  try {
    const product = await getAdminInventoryProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

function parseBulkIds(body) {
  if (!Array.isArray(body?.ids) || body.ids.length === 0) {
    return null;
  }
  return [...new Set(body.ids.filter((id) => typeof id === 'string' && id.length > 0))];
}

/** Marca URLs de /products|/album como medio real para que sobrevivan a sanitize al duplicar. */
function stampAuthenticMediaUrl(url) {
  if (typeof url !== 'string' || url.length === 0) return url;
  if (url.startsWith('data:') || url.includes('?v=') || url.startsWith('/album/')) return url;
  if (url.startsWith('/products/')) {
    const bare = url.split('?')[0].split('#')[0];
    return `${bare}?v=${Date.now()}`;
  }
  return url;
}

function buildDuplicateProductCode(sourceCode, sourceId, suffix) {
  const raw = String(sourceCode ?? sourceId ?? '').trim();
  // Quitar -CP… previos: si no, cada copia alarga el código y se muestra igual (123421412-CP…).
  const withoutCopySuffixes = raw.replace(/(?:-CP[A-Z0-9]*)+$/i, '');
  const base = (withoutCopySuffixes || raw || 'PROD').slice(0, 20);
  return `${base}-CP${suffix}`;
}

function duplicateProduct(source, warehouses) {
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  const id = randomUUID();
  const name = `${source.name} (copia)`;
  const sourceGallery = Array.isArray(source.gallery)
    ? source.gallery.filter((url) => typeof url === 'string' && url.length > 0)
    : [];
  return normalizeProductInput(
    {
      ...source,
      id,
      code: buildDuplicateProductCode(source.code, source.id, suffix),
      name,
      // Identidad propia: no heredar slug del origen (colisión = misma URL / claves UI).
      slug: deriveProductSlug({ id, name, slug: null }),
      created_at: new Date().toISOString(),
      // Conservar categoría e imagen del origen (sanitize no debe vaciarlas).
      category: source.category ?? null,
      image_url:
        typeof source.image_url === 'string' && source.image_url.length > 0
          ? stampAuthenticMediaUrl(source.image_url)
          : source.image_url ?? null,
      gallery: sourceGallery.map(stampAuthenticMediaUrl),
    },
    undefined,
    warehouses,
  );
}

productsRouter.post('/sync-catalog', requireAdmin, async (req, res, next) => {
  try {
    const resetDeleted = req.body?.resetDeleted === true;
    const importMissing = req.body?.importMissing === true;
    const result = await syncInventoryFromCatalog({ resetDeleted, importMissing });
    const supabase = getSupabaseAdmin();
    let supabaseSynced = false;
    if (supabase && result.products.length > 0) {
      await syncProductsToSupabase(result.products);
      supabaseSynced = true;
    }

    const [homeBundleSnapshot, inventoryIndexSnapshot] = await Promise.all([
      regenerateHomeBundleSnapshotQuiet(),
      regenerateInventoryIndexSnapshotQuiet(result.products),
    ]);

    res.json({
      ok: true,
      total: result.products.length,
      fromCatalog: result.catalogCount,
      custom: result.customCount,
      resetDeleted,
      supabaseSynced,
      snapshotsUpdated: {
        homeBundle: Boolean(homeBundleSnapshot),
        inventoryIndex: Boolean(inventoryIndexSnapshot),
      },
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/bulk/delete', requireAdmin, async (req, res, next) => {
  try {
    const ids = parseBulkIds(req.body);
    if (!ids) return res.status(400).json({ error: 'Se requiere al menos un id' });

    const inventory = await readInventory();
    const idSet = new Set(ids);
    const removed = inventory.products.filter((product) => idSet.has(product.id));
    inventory.products = inventory.products.filter((product) => !idSet.has(product.id));
    const deletedProductIds = [
      ...new Set([...(inventory.deletedProductIds ?? []), ...removed.map((p) => p.id)]),
    ];

    await writeInventory(
      {
        products: inventory.products,
        deletedProductIds,
        warehouses: inventory.warehouses,
      },
      { syncProductIds: removed.map((p) => p.id) },
    );

    const supabase = getSupabaseAdmin();
    if (supabase && removed.length > 0) {
      await supabase.from('products').delete().in('id', removed.map((p) => p.id));
    }

    res.json({ ok: true, deleted: removed.length, ids: removed.map((p) => p.id) });
  } catch (error) {
    next(error);
  }
});

productsRouter.patch('/bulk', requireAdmin, async (req, res, next) => {
  try {
    const ids = parseBulkIds(req.body);
    const patch = req.body?.patch ?? {};
    if (!ids) return res.status(400).json({ error: 'Se requiere al menos un id' });

    const idSet = new Set(ids);
    let updatedCount = 0;
    const updatedProducts = [];

    const normalized = await mutateInventory(
      (inventory) => {
        updatedCount = 0;
        updatedProducts.length = 0;
        inventory.products = inventory.products.map((product) => {
          if (!idSet.has(product.id)) return product;
          const updated = applyBulkPatch(product, patch, inventory.warehouses);
          updatedCount += 1;
          updatedProducts.push(updated);
          return updated;
        });

        if (updatedCount === 0) {
          const err = new Error('No se encontraron productos seleccionados');
          err.status = 404;
          throw err;
        }

        return {
          products: inventory.products,
          deletedProductIds: inventory.deletedProductIds ?? [],
          warehouses: inventory.warehouses,
        };
      },
      { syncProductIds: ids },
    );

    const saved = normalized.products.filter((product) => idSet.has(product.id));
    res.json({ ok: true, updated: updatedCount, products: saved });
  } catch (error) {
    if (error?.status === 404) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

productsRouter.post('/bulk/duplicate', requireAdmin, async (req, res, next) => {
  try {
    const ids = parseBulkIds(req.body);
    if (!ids) return res.status(400).json({ error: 'Se requiere al menos un id' });

    const inventory = await readInventory();
    const idSet = new Set(ids);
    const created = [];

    const sorted = sortProductsByOrder(inventory.products);
    let next = [...sorted];

    for (const product of sorted) {
      if (!idSet.has(product.id)) continue;
      const copy = duplicateProduct(product, inventory.warehouses);
      created.push(copy);
      const sourceIndex = next.findIndex((entry) => entry.id === product.id);
      if (sourceIndex !== -1) {
        next.splice(sourceIndex + 1, 0, copy);
      } else {
        next.push(copy);
      }
    }

    if (created.length === 0) {
      return res.status(404).json({ error: 'No se encontraron productos seleccionados' });
    }

    inventory.products = assignProductSortOrders(next);
    const createdIds = new Set(created.map((product) => product.id));
    const written = await writeInventory(
      {
        products: inventory.products,
        deletedProductIds: inventory.deletedProductIds ?? [],
        warehouses: inventory.warehouses,
      },
      { syncProductIds: [...createdIds] },
    );

    // Devolver filas ya persistidas (tras migrate/media) para el upsert del cliente.
    const saved = written.products.filter((product) => createdIds.has(product.id));
    res.status(201).json({
      ok: true,
      created: saved.length,
      products: saved.map((product) => toAdminListProduct(product)),
    });
  } catch (error) {
    next(error);
  }
});

productsRouter.put('/reorder', requireAdmin, async (req, res, next) => {
  try {
    const orderedIds = req.body?.orderedIds;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere orderedIds (array de ids)' });
    }

    const inventory = await readInventory();
    const uniqueIds = [
      ...new Set(orderedIds.filter((id) => typeof id === 'string' && id.length > 0)),
    ];

    inventory.products = applyOrderedIds(inventory.products, uniqueIds);

    await writeInventory({
      products: inventory.products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    });
    await syncProductsToSupabase(inventory.products);

    res.json({ ok: true, total: inventory.products.length, products: inventory.products });
  } catch (error) {
    next(error);
  }
});

function parseIdList(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return [...new Set(raw.split(',').map((id) => id.trim()).filter(Boolean))];
}

productsRouter.get('/by-category', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const labels = parseCategoryLabels(req.query.labels);
    const attributeKeys = parsePipeList(req.query.attrs);
    const result = await queryProductsByCategory({
      role,
      slug: typeof req.query.slug === 'string' ? req.query.slug : '',
      subSlug: typeof req.query.sub === 'string' ? req.query.sub : null,
      labels,
      condition: typeof req.query.condition === 'string' ? req.query.condition : null,
      inStockOnly: req.query.inStock === '1' || req.query.inStock === 'true',
      priceMin: req.query.priceMin != null ? Number(req.query.priceMin) : null,
      priceMax: req.query.priceMax != null ? Number(req.query.priceMax) : null,
      brandKeys: parsePipeList(req.query.brands),
      attributeKeys,
      productionKey: typeof req.query.production === 'string' ? req.query.production : null,
      speedKeys: parsePipeList(req.query.speed),
      search: typeof req.query.q === 'string' ? req.query.q : '',
      sortBy: typeof req.query.sort === 'string' ? req.query.sort : 'price-asc',
      page: req.query.page,
      limit: req.query.limit,
    });
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=180');
    res.json(result);
  } catch (error) {
    next(error);
  }
});

function parsePipeList(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw.split('|').map((entry) => entry.trim()).filter(Boolean);
}

/** Etiquetas de inventario (p. ej. «Toner, Toner Original») usan `|` para no partir por comas internas. */
function parseCategoryLabels(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  if (raw.includes('|')) {
    return [...new Set(parsePipeList(raw))];
  }
  return parseSectionIds(raw);
}

productsRouter.get('/by-ids', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const ids = parseIdList(req.query.ids);
    const result = await queryProductsByIds({ role, ids });
    res.set('Cache-Control', LIST_CACHE_CONTROL);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/search', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const categoryFilter = typeof req.query.cat === 'string' ? req.query.cat : 'all';
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 8;
    const result = await searchPublicProducts({ query, role, limit, categoryFilter });
    res.set('Cache-Control', HOME_CACHE_CONTROL);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id/related', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 8;
    const result = await queryRelatedProducts({ id: req.params.id, role, limit });
    res.set('Cache-Control', HOME_CACHE_CONTROL);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id/consumables', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const result = await queryEquipmentConsumables({ id: req.params.id, role });
    res.set('Cache-Control', HOME_CACHE_CONTROL);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/:id/view', async (req, res, next) => {
  try {
    const productId = req.params.id?.trim();
    if (!productId) return res.status(400).json({ error: 'Id inválido' });

    const role = await resolveRequestRole(req);
    const product = await getPublicProductById(productId, role);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    await incrementProductViewCount(productId);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const product = await getPublicProductById(req.params.id, role);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    const canonicalSlug = deriveProductSlug(product);
    const canonicalPath = buildProductPath(product);
    const siteOrigin = resolveSiteOrigin(process.env);
    res.set('Link', `<${buildAbsoluteUrl(canonicalPath, siteOrigin)}>; rel="canonical"`);
    if (req.params.id !== canonicalSlug) {
      res.set('X-Product-Canonical-Slug', canonicalSlug);
    }

    // Role-aware payload: never share via public/shared caches (admin edits must show immediately).
    res.set('Cache-Control', 'private, no-cache');
    res.json(product);
  } catch (error) {
    next(error);
  }
});

productsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const inventory = await readInventory();
    const product = normalizeProductInput(req.body, undefined, inventory.warehouses);
    if (!product.name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (Number.isNaN(product.prices.public) || product.prices.public < 0) {
      return res.status(400).json({ error: 'Precio público inválido' });
    }

    const deletedProductIds = (inventory.deletedProductIds ?? []).filter(
      (id) => id !== product.id,
    );
    const sorted = sortProductsByOrder(inventory.products);
    const next = assignProductSortOrders([...sorted, { ...product, sort_order: sorted.length }]);
    inventory.products = next;
    const normalized = await writeInventory(
      {
        products: inventory.products,
        deletedProductIds,
        warehouses: inventory.warehouses,
      },
      { syncProductIds: [product.id] },
    );
    const saved =
      normalized.products.find((entry) => entry.id === product.id) ?? product;

    if (!shouldPreferSupabaseCatalog()) {
      await syncProductsToSupabase([saved]);
    }

    notifyHaiSupportChange('products', 'create', saved);
    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

productsRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const productId = req.params.id;
    let saved = null;

    const normalized = await mutateInventory(
      (inventory) => {
        const index = inventory.products.findIndex((entry) => entry.id === productId);
        if (index === -1) {
          const err = new Error('Producto no encontrado');
          err.status = 404;
          throw err;
        }

        const updated = normalizeProductInput(
          req.body,
          inventory.products[index],
          inventory.warehouses,
        );
        if (!updated.name) {
          const err = new Error('El nombre es obligatorio');
          err.status = 400;
          throw err;
        }

        inventory.products[index] = updated;
        return {
          products: inventory.products,
          deletedProductIds: inventory.deletedProductIds ?? [],
          warehouses: inventory.warehouses,
        };
      },
      { syncProductIds: [productId] },
    );

    saved =
      normalized.products.find((entry) => entry.id === productId) ?? null;
    if (!saved) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    if (!shouldPreferSupabaseCatalog()) {
      await syncProductsToSupabase([saved]);
    }

    notifyHaiSupportChange('products', 'update', saved);
    res.json(saved);
  } catch (error) {
    if (error?.status === 404 || error?.status === 400) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

productsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const inventory = await readInventory();
    const index = inventory.products.findIndex((entry) => entry.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const [removed] = inventory.products.splice(index, 1);
    const deletedProductIds = [...new Set([...(inventory.deletedProductIds ?? []), removed.id])];
    await writeInventory(
      {
        products: inventory.products,
        deletedProductIds,
        warehouses: inventory.warehouses,
      },
      { syncProductIds: [removed.id] },
    );

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from('products').delete().eq('id', removed.id);
    }

    notifyHaiSupportChange('products', 'delete', { id: removed.id });
    res.json({ ok: true, id: removed.id });
  } catch (error) {
    next(error);
  }
});

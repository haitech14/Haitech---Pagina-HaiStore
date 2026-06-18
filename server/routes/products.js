import { Router } from 'express';
import { randomUUID } from 'crypto';

import { requireAdmin, resolveRequestRole } from '../lib/auth-store.js';
import { notifyHaiSupportChange } from '../lib/haisupport-sync.js';
import {
  applyOrderedIds,
  assignProductSortOrders,
  sortProductsByOrder,
} from '../lib/inventory-product-order.js';
import {
  normalizeProductInput,
  readInventory,
  syncInventoryFromCatalog,
  writeInventory,
} from '../lib/inventory-store.js';
import { applyBulkPatch } from '../lib/inventory-bulk-patch.js';
import {
  getPublicProductById,
  incrementProductViewCount,
  listProducts,
  searchPublicProducts,
  syncProductsToSupabase,
} from '../lib/product-catalog.js';
import { listHomeFeaturedProducts } from '../lib/home-featured-products.js';
import { shouldPreferSupabaseCatalog } from '../lib/catalog-source.js';
import { getSupabaseAdmin } from '../lib/supabase-auth.js';

export const productsRouter = Router();

productsRouter.get('/', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const products = await listProducts({ role, adminView: false });
    res.json(products);
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
    res.json(products);
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

function parseBulkIds(body) {
  if (!Array.isArray(body?.ids) || body.ids.length === 0) {
    return null;
  }
  return [...new Set(body.ids.filter((id) => typeof id === 'string' && id.length > 0))];
}

function duplicateProduct(source, warehouses) {
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return normalizeProductInput(
    {
      ...source,
      id: randomUUID(),
      code: `${String(source.code ?? source.id).slice(0, 24)}-CP${suffix}`,
      name: `${source.name} (copia)`,
      created_at: new Date().toISOString(),
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
    await syncProductsToSupabase(result.products);
    res.json({
      ok: true,
      total: result.products.length,
      fromCatalog: result.catalogCount,
      custom: result.customCount,
      resetDeleted,
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

    const inventory = await readInventory();
    const idSet = new Set(ids);
    let updatedCount = 0;
    const updatedProducts = [];

    inventory.products = inventory.products.map((product) => {
      if (!idSet.has(product.id)) return product;
      const updated = applyBulkPatch(product, patch, inventory.warehouses);
      updatedCount += 1;
      updatedProducts.push(updated);
      return updated;
    });

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'No se encontraron productos seleccionados' });
    }

    await writeInventory(
      {
        products: inventory.products,
        deletedProductIds: inventory.deletedProductIds ?? [],
        warehouses: inventory.warehouses,
      },
      { syncProductIds: updatedProducts.map((product) => product.id) },
    );

    res.json({ ok: true, updated: updatedCount, products: updatedProducts });
  } catch (error) {
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
    await writeInventory(
      {
        products: inventory.products,
        deletedProductIds: inventory.deletedProductIds ?? [],
        warehouses: inventory.warehouses,
      },
      { syncProductIds: created.map((product) => product.id) },
    );

    res.status(201).json({ ok: true, created: created.length, products: created });
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

productsRouter.get('/search', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const query = typeof req.query.q === 'string' ? req.query.q : '';
    const categoryFilter = typeof req.query.cat === 'string' ? req.query.cat : 'all';
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 8;
    const result = await searchPublicProducts({ query, role, limit, categoryFilter });
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
    const inventory = await readInventory();
    const index = inventory.products.findIndex((entry) => entry.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Producto no encontrado' });

    const updated = normalizeProductInput(
      req.body,
      inventory.products[index],
      inventory.warehouses,
    );
    if (!updated.name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    inventory.products[index] = updated;
    const normalized = await writeInventory(
      {
        products: inventory.products,
        deletedProductIds: inventory.deletedProductIds ?? [],
        warehouses: inventory.warehouses,
      },
      { syncProductIds: [req.params.id] },
    );
    const saved =
      normalized.products.find((entry) => entry.id === req.params.id) ?? updated;

    if (!shouldPreferSupabaseCatalog()) {
      await syncProductsToSupabase([saved]);
    }

    notifyHaiSupportChange('products', 'update', saved);
    res.json(saved);
  } catch (error) {
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

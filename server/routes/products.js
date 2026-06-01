import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

import { requireAdmin, resolveRequestRole } from '../lib/auth-store.js';
import {
  applyOrderedIds,
  assignProductSortOrders,
  ensureProductSortOrders,
  sortProductsByOrder,
} from '../lib/inventory-product-order.js';
import {
  migrateInventoryProduct,
  normalizeProductInput,
  readInventory,
  syncInventoryFromCatalog,
  toPublicProduct,
  writeInventory,
} from '../lib/inventory-store.js';
import { applyBulkPatch } from '../lib/inventory-bulk-patch.js';

export const productsRouter = Router();

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

async function listFromInventory(role, adminView = false) {
  const { products } = await readInventory();
  if (adminView) return products;
  return products.map((product) => toPublicProduct(product, role));
}

productsRouter.get('/', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const products = await listFromInventory(role);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    const products = await listFromInventory('public', true);
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

function supabaseProductRow(product) {
  const image_url =
    typeof product.image_url === 'string' && product.image_url.startsWith('data:')
      ? null
      : product.image_url;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.prices.public,
    prices: product.prices,
    currency: product.currency,
    image_url,
    stock: product.stock,
    category: product.category,
    brand: product.brand ?? null,
  };
}

async function syncSupabaseProducts(supabase, products) {
  if (!supabase) return;
  for (const product of products) {
    const { error } = await supabase.from('products').upsert(supabaseProductRow(product));
    if (error) {
      console.error('[products] supabase upsert:', product.id, error.message);
    }
  }
}

productsRouter.post('/sync-catalog', requireAdmin, async (req, res, next) => {
  try {
    const resetDeleted = req.body?.resetDeleted === true;
    const result = await syncInventoryFromCatalog({ resetDeleted });
    await syncSupabaseProducts(getAdminClient(), result.products);
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

    await writeInventory({
      products: inventory.products,
      deletedProductIds,
      warehouses: inventory.warehouses,
    });

    const supabase = getAdminClient();
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

    await writeInventory({
      products: inventory.products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    });
    await syncSupabaseProducts(getAdminClient(), updatedProducts);

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
    await writeInventory({
      products: inventory.products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    });
    await syncSupabaseProducts(getAdminClient(), created);

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

    res.json({ ok: true, total: inventory.products.length, products: inventory.products });
  } catch (error) {
    next(error);
  }
});

productsRouter.get('/:id', async (req, res, next) => {
  try {
    const role = await resolveRequestRole(req);
    const { products } = await readInventory();
    const product = products.find((entry) => entry.id === req.params.id);
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(toPublicProduct(product, role));
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
    await writeInventory({
      products: inventory.products,
      deletedProductIds,
      warehouses: inventory.warehouses,
    });

    const supabase = getAdminClient();
    if (supabase) {
      const { error } = await supabase.from('products').insert(supabaseProductRow(product));
      if (error) {
        console.error('[products] supabase insert:', product.id, error.message);
      }
    }

    res.status(201).json(product);
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
    await writeInventory({
      products: inventory.products,
      deletedProductIds: inventory.deletedProductIds ?? [],
      warehouses: inventory.warehouses,
    });

    const supabase = getAdminClient();
    if (supabase) {
      const { error } = await supabase
        .from('products')
        .update(supabaseProductRow(updated))
        .eq('id', updated.id);
      if (error) {
        console.error('[products] supabase update:', updated.id, error.message);
      }
    }

    res.json(updated);
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
    await writeInventory({
      products: inventory.products,
      deletedProductIds,
      warehouses: inventory.warehouses,
    });

    const supabase = getAdminClient();
    if (supabase) {
      await supabase.from('products').delete().eq('id', removed.id);
    }

    res.json({ ok: true, id: removed.id });
  } catch (error) {
    next(error);
  }
});

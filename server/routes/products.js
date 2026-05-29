import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

import { requireAdmin, resolveRequestRole } from '../lib/auth-store.js';
import {
  normalizeProductInput,
  readInventory,
  toPublicProduct,
  writeInventory,
} from '../lib/inventory-store.js';

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
    const product = normalizeProductInput(req.body);
    if (!product.name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }
    if (Number.isNaN(product.prices.public) || product.prices.public < 0) {
      return res.status(400).json({ error: 'Precio público inválido' });
    }

    const inventory = await readInventory();
    inventory.products.unshift(product);
    await writeInventory(inventory);

    const supabase = getAdminClient();
    if (supabase) {
      await supabase.from('products').insert({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.prices.public,
        prices: product.prices,
        currency: product.currency,
        image_url: product.image_url,
        stock: product.stock,
        category: product.category,
        brand: product.brand ?? null,
      });
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

    const updated = normalizeProductInput(req.body, inventory.products[index]);
    if (!updated.name) {
      return res.status(400).json({ error: 'El nombre es obligatorio' });
    }

    inventory.products[index] = updated;
    await writeInventory(inventory);

    const supabase = getAdminClient();
    if (supabase) {
      await supabase
        .from('products')
        .update({
          name: updated.name,
          description: updated.description,
          price: updated.prices.public,
          prices: updated.prices,
          currency: updated.currency,
          image_url: updated.image_url,
          stock: updated.stock,
          category: updated.category,
          brand: updated.brand ?? null,
        })
        .eq('id', updated.id);
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
    await writeInventory(inventory);

    const supabase = getAdminClient();
    if (supabase) {
      await supabase.from('products').delete().eq('id', removed.id);
    }

    res.json({ ok: true, id: removed.id });
  } catch (error) {
    next(error);
  }
});

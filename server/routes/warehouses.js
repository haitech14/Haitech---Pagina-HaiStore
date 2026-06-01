import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { readInventory, writeInventory } from '../lib/inventory-store.js';
import { normalizeWarehouses } from '../lib/inventory-warehouses.js';

export const warehousesRouter = Router();

warehousesRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { warehouses } = await readInventory();
    res.json(warehouses);
  } catch (error) {
    next(error);
  }
});

warehousesRouter.put('/', requireAdmin, async (req, res, next) => {
  try {
    const warehouses = normalizeWarehouses(req.body?.warehouses ?? req.body);
    const inventory = await readInventory();
    await writeInventory({
      products: inventory.products,
      deletedProductIds: inventory.deletedProductIds,
      warehouses,
    });
    res.json(warehouses);
  } catch (error) {
    next(error);
  }
});

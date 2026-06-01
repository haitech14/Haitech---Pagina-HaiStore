import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  createStoreCategory,
  deleteStoreCategory,
  readStoreCategoriesTree,
  reorderStoreCategories,
  syncCategoriesFromInventory,
  updateStoreCategory,
} from '../lib/store-categories-store.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (_req, res, next) => {
  try {
    const tree = await readStoreCategoriesTree();
    res.json(tree);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.post('/sync-inventory', requireAdmin, async (_req, res, next) => {
  try {
    const tree = await syncCategoriesFromInventory();
    res.json({ ok: true, tree });
  } catch (error) {
    next(error);
  }
});

categoriesRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const category = await createStoreCategory(req.body ?? {});
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const category = await updateStoreCategory(req.params.id, req.body ?? {});
    res.json(category);
  } catch (error) {
    next(error);
  }
});

categoriesRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await deleteStoreCategory(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

categoriesRouter.put('/reorder', requireAdmin, async (req, res, next) => {
  try {
    const items = req.body?.items;
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Se requiere items[]' });
    }
    await reorderStoreCategories(items);
    const tree = await readStoreCategoriesTree();
    res.json({ ok: true, tree });
  } catch (error) {
    next(error);
  }
});

import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  createStoreBrand,
  deleteStoreBrand,
  readStoreBrandsCatalog,
  syncBrandsFromInventory,
  updateStoreBrand,
} from '../lib/store-brands-store.js';

export const brandsRouter = Router();

brandsRouter.get('/', async (_req, res, next) => {
  try {
    const catalog = await readStoreBrandsCatalog();
    res.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    res.json(catalog);
  } catch (error) {
    next(error);
  }
});

brandsRouter.post('/sync-inventory', requireAdmin, async (_req, res, next) => {
  try {
    const catalog = await syncBrandsFromInventory();
    res.json({ ok: true, ...catalog });
  } catch (error) {
    next(error);
  }
});

brandsRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const brand = await createStoreBrand(req.body ?? {});
    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
});

brandsRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const brand = await updateStoreBrand(req.params.id, req.body ?? {});
    res.json(brand);
  } catch (error) {
    next(error);
  }
});

brandsRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await deleteStoreBrand(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

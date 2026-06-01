import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  createProformaFromBody,
  patchProforma,
  readProformas,
  writeProformas,
} from '../lib/proformas-store.js';

export const proformasRouter = Router();

proformasRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const { proformas } = await readProformas();
    res.json({ proformas });
  } catch (error) {
    next(error);
  }
});

proformasRouter.post('/', requireAdmin, async (req, res, next) => {
  try {
    const created = createProformaFromBody(req.body ?? {}, req);
    const { proformas } = await readProformas();
    const nextList = [created, ...proformas.filter((entry) => entry.id !== created.id)];
    await writeProformas(nextList);
    res.status(201).json({ proforma: created });
  } catch (error) {
    if (error instanceof Error && error.message.includes('requiere')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

proformasRouter.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { proformas } = await readProformas();
    const index = proformas.findIndex((entry) => entry.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Proforma no encontrada' });

    const updated = patchProforma(proformas[index], req.body ?? {});
    proformas[index] = updated;
    await writeProformas(proformas);
    res.json({ proforma: updated });
  } catch (error) {
    next(error);
  }
});

proformasRouter.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { proformas } = await readProformas();
    const filtered = proformas.filter((entry) => entry.id !== req.params.id);
    if (filtered.length === proformas.length) {
      return res.status(404).json({ error: 'Proforma no encontrada' });
    }
    await writeProformas(filtered);
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});

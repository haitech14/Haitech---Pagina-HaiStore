import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import {
  deleteCrmPipelineLeadFile,
  listCrmPipelineLeadsFile,
  updateCrmPipelineLeadFile,
  upsertCrmPipelineLeadFile,
} from '../lib/crm-pipeline-file-store.js';

export const crmPipelineRouter = Router();

crmPipelineRouter.get('/pipeline-leads', requireAdmin, async (_req, res, next) => {
  try {
    const leads = await listCrmPipelineLeadsFile();
    res.json({ leads });
  } catch (error) {
    next(error);
  }
});

crmPipelineRouter.post('/pipeline-leads', requireAdmin, async (req, res, next) => {
  try {
    const lead = req.body ?? {};
    if (!lead.id || typeof lead.id !== 'string') {
      return res.status(400).json({ error: 'El lead requiere un id.' });
    }
    await upsertCrmPipelineLeadFile(lead);
    res.status(201).json({ ok: true, id: lead.id });
  } catch (error) {
    next(error);
  }
});

crmPipelineRouter.patch('/pipeline-leads/:id', requireAdmin, async (req, res, next) => {
  try {
    const updated = await updateCrmPipelineLeadFile(req.params.id, req.body ?? {});
    if (!updated) {
      return res.status(404).json({ error: 'Lead no encontrado.' });
    }
    res.json({ lead: updated });
  } catch (error) {
    next(error);
  }
});

crmPipelineRouter.delete('/pipeline-leads/:id', requireAdmin, async (req, res, next) => {
  try {
    const deleted = await deleteCrmPipelineLeadFile(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Lead no encontrado.' });
    }
    res.json({ ok: true, id: req.params.id });
  } catch (error) {
    next(error);
  }
});

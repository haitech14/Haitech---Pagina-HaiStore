import { Router } from 'express';

import { createHaiSupportVisitRequest, lookupHaiSupportVisitClient } from '../lib/haisupport-visit.js';
import { getClientIp, isSupportRateLimited } from '../lib/support-rate-limit.js';

export const haisupportVisitRouter = Router();

haisupportVisitRouter.get('/client', async (req, res, next) => {
  try {
    const ruc = String(req.query.ruc ?? '').replace(/\D/g, '');
    if (!/^\d{8,11}$/.test(ruc)) {
      return res.status(400).json({ error: 'Indica un RUC o DNI válido.' });
    }

    const result = await lookupHaiSupportVisitClient(ruc);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

haisupportVisitRouter.post('/visits', async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    if (isSupportRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Demasiados envíos. Espera un minuto e intenta de nuevo.',
      });
    }

    const body = req.body ?? {};
    const ruc = String(body.ruc ?? '').replace(/\D/g, '');
    if (!/^\d{8,11}$/.test(ruc)) {
      return res.status(400).json({ error: 'Indica un RUC válido.' });
    }
    if (!String(body.razonSocial ?? '').trim()) {
      return res.status(400).json({ error: 'Indica la razón social.' });
    }
    if (!String(body.atencion ?? '').trim()) {
      return res.status(400).json({ error: 'Indica la persona de atención.' });
    }
    if (!String(body.celular ?? '').trim()) {
      return res.status(400).json({ error: 'Indica un celular de contacto.' });
    }
    if (!String(body.visitDate ?? '').trim() || body.visitHour == null) {
      return res.status(400).json({ error: 'Selecciona fecha y horario.' });
    }

    const created = await createHaiSupportVisitRequest({ ...body, ruc });
    res.status(201).json(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo registrar la visita.';
    if (/HaiSupport|registrar la visita/i.test(message)) {
      return res.status(500).json({ error: message });
    }
    next(error);
  }
});

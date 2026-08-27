import { Router } from 'express';

import { captureFromRequest, registerWebLead } from '../lib/register-web-lead.js';
import { getClientIp, isSupportRateLimited } from '../lib/support-rate-limit.js';

export const leadsRouter = Router();

leadsRouter.post('/web', async (req, res, next) => {
  const clientIp = getClientIp(req);
  if (isSupportRateLimited(`web-lead:${clientIp}`)) {
    return res.status(429).json({
      error: 'Demasiados envíos. Espera un minuto e intenta de nuevo.',
    });
  }

  try {
    const body = req.body ?? {};
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (name.length < 2) {
      return res.status(400).json({ error: 'El nombre debe tener al menos 2 caracteres.' });
    }

    const capture = {
      ...captureFromRequest(req),
      path: typeof body.path === 'string' ? body.path.trim().slice(0, 200) : '',
    };

    const result = await registerWebLead({
      name,
      email: typeof body.email === 'string' ? body.email : null,
      phone: typeof body.phone === 'string' ? body.phone : null,
      companyOrRuc: typeof body.companyOrRuc === 'string' ? body.companyOrRuc : null,
      city: typeof body.city === 'string' ? body.city : null,
      direccion: typeof body.direccion === 'string' ? body.direccion : null,
      channel: typeof body.channel === 'string' ? body.channel : 'whatsapp-floating',
      message: typeof body.message === 'string' ? body.message : null,
      productName: typeof body.productName === 'string' ? body.productName : null,
      productId: typeof body.productId === 'string' ? body.productId : null,
      createProforma: body.createProforma !== false,
      capture,
    });

    res.status(201).json({
      ok: true,
      customerId: result.customerId,
      proformaId: result.proforma?.id ?? null,
      documentNumber: result.proforma?.documentNumber ?? null,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('nombre')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

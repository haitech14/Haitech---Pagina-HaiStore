import { Router } from 'express';

import { createSupportTicket } from '../lib/haisupport.js';
import { getClientIp, isSupportRateLimited } from '../lib/support-rate-limit.js';

export const supportRouter = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 120;
const MAX_MESSAGE = 4000;
const MAX_PHONE = 32;
const ALLOWED_TYPES = new Set(['contact', 'subscription_ruleta']);

function validateTicketBody(body) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.trim() : '';

  if (name.length < 2) {
    return { error: 'El nombre debe tener al menos 2 caracteres.' };
  }
  if (name.length > MAX_NAME) {
    return { error: 'El nombre es demasiado largo.' };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: 'Introduce un correo válido.' };
  }
  if (message.length < 10) {
    return { error: 'El mensaje debe tener al menos 10 caracteres.' };
  }
  if (message.length > MAX_MESSAGE) {
    return { error: 'El mensaje es demasiado largo.' };
  }

  const phoneRaw = typeof body.phone === 'string' ? body.phone.trim() : '';
  const phone = phoneRaw.length > 0 ? phoneRaw.slice(0, MAX_PHONE) : undefined;

  const countryRaw = typeof body.country === 'string' ? body.country.trim().toUpperCase() : '';
  const country = countryRaw.length > 0 ? countryRaw.slice(0, 8) : undefined;

  const typeRaw = typeof body.type === 'string' ? body.type.trim() : 'contact';
  const type = ALLOWED_TYPES.has(typeRaw) ? typeRaw : 'contact';

  const metadata =
    body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata)
      ? body.metadata
      : {};

  return { name, email, message, phone, country, type, metadata };
}

supportRouter.post('/tickets', async (req, res, next) => {
  try {
    const clientIp = getClientIp(req);
    if (isSupportRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Demasiados envíos. Espera un minuto e intenta de nuevo.',
      });
    }

    const parsed = validateTicketBody(req.body ?? {});
    if ('error' in parsed) {
      return res.status(400).json({ error: parsed.error });
    }

    const ticket = await createSupportTicket(parsed);
    const isLocal = ticket.local === true;
    res.status(201).json({
      ...ticket,
      ...(isLocal ? { demo: true } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';
    if (
      message.includes('HaiSupport') ||
      message.includes('ticket') ||
      message.includes('tiempo')
    ) {
      return res.status(502).json({ error: message });
    }
    next(error);
  }
});

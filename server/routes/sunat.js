import { Router } from 'express';

import { lookupSunatRuc, SunatRucError } from '../lib/sunat-ruc.js';

export const sunatRouter = Router();

sunatRouter.get('/ruc', async (req, res, next) => {
  try {
    const numero = typeof req.query.numero === 'string' ? req.query.numero : '';
    const data = await lookupSunatRuc(numero);
    if (!data) {
      return res.status(404).json({ error: 'No se encontró el RUC en SUNAT.' });
    }
    res.json(data);
  } catch (error) {
    if (error instanceof SunatRucError) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

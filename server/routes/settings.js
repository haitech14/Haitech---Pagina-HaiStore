import { Router } from 'express';

import { requireAdmin } from '../lib/auth-store.js';
import { readCompanySettings, writeCompanySettings } from '../lib/company-settings-store.js';
import { fetchSbsUsdToPenRates } from '../lib/sbs-exchange-rate.js';

export const settingsRouter = Router();

settingsRouter.get('/company', async (_req, res, next) => {
  try {
    const settings = await readCompanySettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

settingsRouter.put('/company', requireAdmin, async (req, res, next) => {
  try {
    const settings = await writeCompanySettings(req.body ?? {});
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

/** Consulta compra/venta oficiales (SBS vía SUNAT) sin guardar. */
settingsRouter.get('/company/exchange-rate/sbs', requireAdmin, async (_req, res, next) => {
  try {
    const rates = await fetchSbsUsdToPenRates();
    res.json(rates);
  } catch (error) {
    next(error);
  }
});

/** Aplica compra/venta oficiales SBS/SUNAT a la configuración de la empresa. */
settingsRouter.post('/company/exchange-rate/sync-sbs', requireAdmin, async (_req, res, next) => {
  try {
    const rates = await fetchSbsUsdToPenRates();
    const current = await readCompanySettings();
    const settings = await writeCompanySettings({
      ...current,
      usdToPenPurchaseExchangeRate: rates.compra,
      usdToPenExchangeRate: rates.venta,
    });
    res.json({
      settings,
      sbs: rates,
    });
  } catch (error) {
    next(error);
  }
});

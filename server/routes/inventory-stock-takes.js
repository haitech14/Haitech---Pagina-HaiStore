import { Router } from 'express';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { requireAdmin } from '../lib/auth-store.js';
import { getServerDataDir } from '../lib/server-paths.js';

export const inventoryStockTakesRouter = Router();

function readStockTakes() {
  const filePath = path.join(getServerDataDir(), 'inventory-stock-takes.json');
  if (!existsSync(filePath)) {
    return { version: 1, takes: [] };
  }
  try {
    const payload = JSON.parse(readFileSync(filePath, 'utf8'));
    const takes = Array.isArray(payload.takes) ? payload.takes : [];
    return { version: payload.version ?? 1, takes };
  } catch {
    return { version: 1, takes: [] };
  }
}

inventoryStockTakesRouter.get('/', requireAdmin, (_req, res) => {
  const payload = readStockTakes();
  res.json(payload);
});

inventoryStockTakesRouter.get('/latest', requireAdmin, (_req, res) => {
  const payload = readStockTakes();
  res.json(payload.takes[0] ?? null);
});

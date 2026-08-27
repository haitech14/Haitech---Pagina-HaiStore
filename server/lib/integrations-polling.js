/**
 * Polling de sincronización HaiSales + HaiSupport (casi tiempo real).
 * Intervalos: HAISALES_SYNC_INTERVAL_MS / HAISUPPORT_SYNC_INTERVAL_MS (default 5 min).
 */

import { syncHaiSalesFromDatabase, mirrorRemoteHaiSalesToStore } from './haisales-db-sync.js';
import { syncHaiSupportFromDatabase } from './haisupport-integration.js';
import { isHaiSalesRemoteDatabase } from './haisales-supabase.js';
import { resolveHaiSalesCredentials, resolveHaiSupportCredentials } from './haitech-integrations-config.js';

const DEFAULT_INTERVAL_MS = 300_000;
const MIN_INTERVAL_MS = 60_000;

function readIntervalMs(envKey) {
  const raw = Number(process.env[envKey] ?? DEFAULT_INTERVAL_MS);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return Math.max(MIN_INTERVAL_MS, Math.floor(raw));
}

async function runHaiSalesTick() {
  if (process.env.HAISALES_SYNC_ENABLED === 'false') return;
  const { url, key } = resolveHaiSalesCredentials();
  if (!url || !key) return;

  try {
    if (isHaiSalesRemoteDatabase()) {
      await mirrorRemoteHaiSalesToStore();
    }
    const result = await syncHaiSalesFromDatabase();
    console.log(
      '[integrations-poll] HaiSales OK',
      `persona=${result.mirrorCounts?.persona ?? 0}`,
      `ventas=${result.mirrorCounts?.ventas ?? 0}`,
    );
  } catch (error) {
    console.warn(
      '[integrations-poll] HaiSales:',
      error instanceof Error ? error.message : error,
    );
  }
}

async function runHaiSupportTick() {
  if (process.env.HAISUPPORT_SYNC_ENABLED !== 'true') return;
  const { url, key } = resolveHaiSupportCredentials();
  if (!url || !key) return;

  try {
    const result = await syncHaiSupportFromDatabase();
    console.log(
      '[integrations-poll] HaiSupport OK',
      `pulled=${result?.pulled ?? result?.customers?.pulled ?? '?'}`,
      `pushed=${result?.pushed ?? result?.customers?.pushed ?? '?'}`,
    );
  } catch (error) {
    console.warn(
      '[integrations-poll] HaiSupport:',
      error instanceof Error ? error.message : error,
    );
  }
}

/**
 * Arranca pollers en background. No bloquea el boot del API.
 */
export function startIntegrationsPolling() {
  const salesMs = readIntervalMs('HAISALES_SYNC_INTERVAL_MS');
  const supportMs = readIntervalMs('HAISUPPORT_SYNC_INTERVAL_MS');

  if (salesMs > 0) {
    console.log(`[integrations-poll] HaiSales cada ${Math.round(salesMs / 1000)}s`);
    void runHaiSalesTick();
    setInterval(() => {
      void runHaiSalesTick();
    }, salesMs);
  }

  if (supportMs > 0 && process.env.HAISUPPORT_SYNC_ENABLED === 'true') {
    console.log(`[integrations-poll] HaiSupport cada ${Math.round(supportMs / 1000)}s`);
    void runHaiSupportTick();
    setInterval(() => {
      void runHaiSupportTick();
    }, supportMs);
  }
}

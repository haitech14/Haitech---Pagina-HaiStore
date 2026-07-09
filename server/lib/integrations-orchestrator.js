import { syncHaiSalesFromDatabase, mirrorRemoteHaiSalesToStore } from './haisales-import.js';
import { isHaiSalesRemoteDatabase } from './haisales-supabase.js';
import { syncHaiSupportFromDatabase } from './haisupport-integration.js';
import { getSupabaseAdmin } from './supabase-auth.js';

/**
 * Orquesta la sincronización HaiSales + HaiSupport hacia HaiStore.
 * @param {{ haisales?: boolean; haisupport?: boolean; mirrorRemote?: boolean }} options
 */
export async function syncAllIntegrations(options = {}) {
  const runHaiSales = options.haisales !== false;
  const runHaiSupport = options.haisupport !== false;

  if (!getSupabaseAdmin()) {
    throw new Error('Supabase HaiStore no configurado');
  }

  /** @type {Record<string, unknown>} */
  const result = { ok: true, syncedAt: new Date().toISOString() };

  if (runHaiSales) {
    let remoteMirror = null;
    if (options.mirrorRemote === true && isHaiSalesRemoteDatabase()) {
      remoteMirror = await mirrorRemoteHaiSalesToStore();
    }
    result.haisales = {
      remoteMirror,
      database: await syncHaiSalesFromDatabase(),
    };
  }

  if (runHaiSupport) {
    result.haisupport = await syncHaiSupportFromDatabase();
  }

  return result;
}

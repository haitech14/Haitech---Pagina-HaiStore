/**
 * Configuración unificada HaiSupport + HaiSales.
 * Por defecto reutiliza SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (auth compartido).
 */

const PROBE_TIMEOUT_MS = 8_000;

function normalizeOrigin(url) {
  if (!url?.trim()) return null;
  return url
    .trim()
    .replace(/\/rest\/v1\/?$/i, '')
    .replace(/\/+$/, '');
}

function resolveCredentials(dedicatedUrlEnv, dedicatedKeyEnv) {
  const url = normalizeOrigin(process.env[dedicatedUrlEnv]?.trim() || process.env.SUPABASE_URL?.trim());
  const key =
    process.env[dedicatedKeyEnv]?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
  return { url: url || null, key };
}

export function resolveHaiSupportCredentials() {
  return resolveCredentials('HAISUPPORT_API_URL', 'HAISUPPORT_API_KEY');
}

export function resolveHaiSalesCredentials() {
  return resolveCredentials('HAISALES_API_URL', 'HAISALES_API_KEY');
}

export function isSupabaseProjectUrl(url) {
  return Boolean(url?.includes('supabase.co'));
}

export function isDedicatedRestApi(url) {
  return Boolean(url) && !isSupabaseProjectUrl(url);
}

export function isHaiSupportConfigured() {
  const { url, key } = resolveHaiSupportCredentials();
  return Boolean(url && key);
}

export function isHaiSalesConfigured() {
  const { url, key } = resolveHaiSalesCredentials();
  return Boolean(url && key);
}

export function isHaiSalesRemoteProject() {
  const { url: salesUrl } = resolveHaiSalesCredentials();
  const storeUrl = normalizeOrigin(process.env.SUPABASE_URL?.trim());
  if (!salesUrl || !storeUrl) return false;
  return salesUrl !== storeUrl;
}

async function probeSupabaseTable(supabase, table) {
  const { error } = await supabase.from(table).select('id', { count: 'exact', head: true });
  if (!error) return { ok: true, table };
  if (error.code === 'PGRST205') return { ok: false, table, missing: true };
  return { ok: false, table, error: error.message };
}

async function probeRestHealth(baseUrl, apiKey) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (response.ok) return { ok: true, endpoint: '/health' };

    const statusResponse = await fetch(`${baseUrl}/status`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    if (statusResponse.ok) return { ok: true, endpoint: '/status' };

    return { ok: false, status: response.status };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: message };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Comprueba conectividad con HaiSupport (REST dedicada o tablas Supabase).
 * @param {import('@supabase/supabase-js').SupabaseClient | null} haisupportSupabase
 * @param {import('@supabase/supabase-js').SupabaseClient | null} [storeSupabase]
 */
export async function probeHaiSupportConnection(haisupportSupabase, storeSupabase = null) {
  const { url, key } = resolveHaiSupportCredentials();
  if (!url || !key) {
    return { configured: false, connected: false, mode: 'none' };
  }

  if (isDedicatedRestApi(url)) {
    const rest = await probeRestHealth(url, key);
    return {
      configured: true,
      connected: rest.ok,
      mode: 'rest-api',
      url,
      ...rest,
    };
  }

  if (!haisupportSupabase) {
    return { configured: true, connected: false, mode: 'supabase', url, error: 'client-unavailable' };
  }

  const clients = await probeSupabaseTable(haisupportSupabase, 'clients');
  if (clients.ok) {
    return { configured: true, connected: true, mode: 'supabase-bridge', url, table: 'clients' };
  }

  const serviceRequests = await probeSupabaseTable(haisupportSupabase, 'service_requests');
  if (serviceRequests.ok) {
    return {
      configured: true,
      connected: true,
      mode: 'supabase-bridge',
      url,
      table: 'service_requests',
    };
  }

  if (storeSupabase) {
    const storeRequests = await probeSupabaseTable(storeSupabase, 'store_service_requests');
    if (storeRequests.ok) {
      return {
        configured: true,
        connected: true,
        mode: 'shared-supabase',
        url,
        table: 'store_service_requests',
      };
    }
  }

  return {
    configured: true,
    connected: false,
    mode: 'supabase',
    url,
    error: clients.error ?? serviceRequests.error ?? 'tables-unavailable',
  };
}

/**
 * Comprueba conectividad con HaiSales (tablas espejo en Supabase).
 * @param {import('@supabase/supabase-js').SupabaseClient | null} haisalesSupabase
 */
export async function probeHaiSalesConnection(haisalesSupabase) {
  const { url, key } = resolveHaiSalesCredentials();
  if (!url || !key) {
    return { configured: false, connected: false, mode: 'none' };
  }

  if (isDedicatedRestApi(url)) {
    const rest = await probeRestHealth(url, key);
    return {
      configured: true,
      connected: rest.ok,
      mode: 'rest-api',
      url,
      remote: isHaiSalesRemoteProject(),
      ...rest,
    };
  }

  if (!haisalesSupabase) {
    return { configured: true, connected: false, mode: 'supabase', url, error: 'client-unavailable' };
  }

  const personaTable = process.env.HAISALES_TABLE_PERSONA?.trim() || 'haisales_persona';
  const ventasTable = process.env.HAISALES_TABLE_VENTAS?.trim() || 'haisales_ventas';

  const persona = await probeSupabaseTable(haisalesSupabase, personaTable);
  const ventas = await probeSupabaseTable(haisalesSupabase, ventasTable);

  const connected = persona.ok || ventas.ok;

  return {
    configured: true,
    connected,
    mode: 'supabase-mirror',
    url,
    remote: isHaiSalesRemoteProject(),
    tables: {
      persona: persona.ok ? personaTable : persona.missing ? 'missing' : 'error',
      ventas: ventas.ok ? ventasTable : ventas.missing ? 'missing' : 'error',
    },
    ...(connected ? {} : { error: persona.error ?? ventas.error ?? 'tables-unavailable' }),
  };
}

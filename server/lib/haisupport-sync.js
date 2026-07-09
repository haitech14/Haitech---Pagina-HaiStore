/**
 * Sincronización HaiStore → HaiSupport (API) e ingesta HaiSupport → HaiStore (webhook).
 *
 * Contrato outbound API dedicada: POST {HAISUPPORT_API_URL}/sync/{entity}
 * Contrato outbound Supabase compartido: bridge directo (haisupport-bridge-outbound.js)
 * Contrato inbound: POST /api/integrations/haisupport/webhook
 */

import { bridgeOutboundSync } from './haisupport-bridge-outbound.js';
import { isHaiSupportSupabaseConfigured } from './haisupport-supabase.js';

const TIMEOUT_MS = 12_000;

function getApiBaseUrl() {
  const raw = process.env.HAISUPPORT_API_URL?.trim();
  if (!raw) return '';
  return raw.replace(/\/+$/, '');
}

function isDedicatedHaiSupportApi() {
  const url = getApiBaseUrl();
  return Boolean(url) && !url.includes('supabase.co');
}

function isOutboundSyncEnabled() {
  return (
    process.env.HAISUPPORT_SYNC_ENABLED === 'true' &&
    Boolean(getApiBaseUrl()) &&
    Boolean(process.env.HAISUPPORT_API_KEY?.trim())
  );
}

async function postToHaiSupport(path, body) {
  const API_URL = getApiBaseUrl();
  const API_KEY = process.env.HAISUPPORT_API_KEY?.trim();
  if (!API_URL || !API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn('[haisupport-sync] HTTP', response.status, text.slice(0, 200));
      return null;
    }

    return response.json().catch(() => ({}));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn('[haisupport-sync]', message);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Notifica a HaiSupport tras cambios en HaiStore (no bloquea la petición).
 * @param {'products'|'customers'|'proformas'|'rental_plans'|'service_requests'|'rental_requests'|'orders'} entity
 * @param {'create'|'update'|'delete'|'upsert'} action
 * @param {unknown} payload
 */
export function notifyHaiSupportChange(entity, action, payload) {
  if (!isOutboundSyncEnabled()) return;

  if (isHaiSupportSupabaseConfigured() && !isDedicatedHaiSupportApi()) {
    void bridgeOutboundSync(entity, action, payload).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.warn('[haisupport-sync] bridge:', entity, message);
    });
    return;
  }

  void postToHaiSupport(`/sync/${entity}`, {
    action,
    payload,
    source: 'haistore',
    sentAt: new Date().toISOString(),
  });
}

export function verifyHaiSupportWebhookSecret(headerValue) {
  const expected = process.env.HAISUPPORT_WEBHOOK_SECRET?.trim();
  if (!expected) return false;
  return typeof headerValue === 'string' && headerValue === expected;
}

export { isOutboundSyncEnabled };

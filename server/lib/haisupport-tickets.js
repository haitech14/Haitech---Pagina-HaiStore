/**
 * Tickets de contacto/ruleta → HaiSupport vía REST, Supabase bridge o respaldo local.
 */

import { randomUUID } from 'crypto';

import { shouldUseSharedSupabaseData } from './data-source.js';
import { upsertHaiSupportServiceRequest } from './haisupport-bridge.js';
import { getHaiSupportSupabaseAdmin, isHaiSupportSupabaseConfigured } from './haisupport-supabase.js';
import { notifyHaiSupportChange } from './haisupport-sync.js';
import {
  isDedicatedRestApi,
  isHaiSupportConfigured,
  isSupabaseProjectUrl,
  resolveHaiSupportCredentials,
} from './haitech-integrations-config.js';
import { createLocalSupportTicket } from './support-tickets-store.js';
import { getSupabaseAdmin } from './supabase-auth.js';

const TIMEOUT_MS = 10_000;

function dedicatedTicketsUrl() {
  const dedicated = process.env.HAISUPPORT_TICKETS_URL?.trim();
  if (dedicated) return dedicated.replace(/\/+$/, '');

  const { url } = resolveHaiSupportCredentials();
  if (!url || isSupabaseProjectUrl(url)) return '';
  return url;
}

function generateTicketCode(prefix = 'TK') {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9000) + 1000);
  return `${prefix}-${year}-${seq}`;
}

function categoryForType(type) {
  if (type === 'subscription_ruleta') {
    return { id: 'cat-remoto', label: 'Ruleta / promoción' };
  }
  return { id: 'cat-remoto', label: 'Contacto web' };
}

/**
 * @param {Record<string, unknown>} payload
 */
async function createRestSupportTicket(payload) {
  const ticketsApiUrl = dedicatedTicketsUrl();
  const { key: API_KEY } = resolveHaiSupportCredentials();
  if (!ticketsApiUrl || !API_KEY) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${ticketsApiUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        name: payload.name,
        email: payload.email,
        message: payload.message,
        phone: payload.phone ?? null,
        country: payload.country ?? null,
        type: payload.type ?? 'contact',
        metadata: payload.metadata ?? {},
        source: 'haistore-web',
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error('[haisupport-tickets] REST HTTP', response.status, body.slice(0, 300));
      return null;
    }

    const data = await response.json().catch(() => ({}));
    return {
      id: data.id ?? randomUUID(),
      status: data.status ?? 'queued',
      connected: true,
      mode: 'rest-api',
    };
  } catch (error) {
    console.warn(
      '[haisupport-tickets] REST falló:',
      error instanceof Error ? error.message : error,
    );
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Inserta en tablas HaiSupport (`tickets` o `support_tickets`) cuando el bridge está activo.
 * @param {Record<string, unknown>} payload
 */
async function createHaiSupportSupabaseTicket(payload) {
  const hsDb = getHaiSupportSupabaseAdmin();
  if (!hsDb) return null;

  const row = {
    id: randomUUID(),
    name: payload.name,
    email: payload.email,
    message: payload.message,
    phone: payload.phone ?? null,
    country: payload.country ?? null,
    type: payload.type ?? 'contact',
    metadata: payload.metadata ?? {},
    status: 'open',
    source: 'haistore-web',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  for (const table of ['tickets', 'support_tickets']) {
    const { data, error } = await hsDb.from(table).insert(row).select('id').maybeSingle();
    if (!error && data?.id) {
      return { id: data.id, status: 'queued', connected: true, mode: 'supabase-tickets', table };
    }
    if (error?.code !== 'PGRST205' && !String(error?.message ?? '').includes('does not exist')) {
      console.warn(`[haisupport-tickets] ${table}:`, error.message);
    }
  }

  return null;
}

/**
 * Persiste como solicitud de servicio en store_service_requests y replica a HaiSupport.
 * @param {Record<string, unknown>} payload
 */
async function createStoreServiceRequestTicket(payload) {
  const supabase = getSupabaseAdmin();
  if (!shouldUseSharedSupabaseData() || !supabase) return null;

  const id = randomUUID();
  const code = generateTicketCode('SV');
  const now = new Date();
  const scheduledAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
  const category = categoryForType(payload.type ?? 'contact');
  const metadata =
    payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
      ? payload.metadata
      : {};

  const record = {
    id,
    code,
    clientId: null,
    haisupportRequestId: null,
    customerSnapshot: {
      nombre: payload.name,
      nombreContacto: payload.name,
      email: payload.email,
      telefono: payload.phone ?? null,
      ciudad: payload.country ?? metadata.city ?? null,
    },
    categoryId: category.id,
    categoryLabel: category.label,
    description: String(payload.message ?? ''),
    status: 'pending',
    scheduledAt,
    technician: null,
    address: null,
    city: payload.country ?? metadata.city ?? null,
    source: 'haistore',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const row = {
    id: record.id,
    code: record.code,
    client_id: null,
    haisupport_request_id: null,
    customer_snapshot: record.customerSnapshot,
    category_id: record.categoryId,
    category_label: record.categoryLabel,
    description: record.description,
    status: record.status,
    scheduled_at: record.scheduledAt,
    technician: null,
    address: null,
    city: record.city,
    source: 'haistore',
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  };

  const { error } = await supabase.from('store_service_requests').insert(row);
  if (error) {
    if (/relation|schema cache|Could not find/i.test(error.message)) {
      return null;
    }
    console.warn('[haisupport-tickets] store_service_requests:', error.message);
    return null;
  }

  let haisupportRequestId = null;
  if (isHaiSupportSupabaseConfigured()) {
    haisupportRequestId = await upsertHaiSupportServiceRequest(record);
    if (haisupportRequestId) {
      await supabase
        .from('store_service_requests')
        .update({ haisupport_request_id: haisupportRequestId, updated_at: new Date().toISOString() })
        .eq('id', id);
    }
  }

  notifyHaiSupportChange('service_requests', 'create', {
    ...record,
    haisupportRequestId,
  });

  return {
    id,
    code,
    status: 'queued',
    connected: true,
    mode: haisupportRequestId ? 'supabase-bridge' : 'shared-supabase',
    haisupportRequestId,
  };
}

/**
 * @param {{
 *   name: string;
 *   email: string;
 *   message: string;
 *   phone?: string;
 *   country?: string;
 *   type?: string;
 *   metadata?: Record<string, unknown>;
 * }} payload
 */
export async function createSupportTicket(payload) {
  if (!isHaiSupportConfigured()) {
    return createLocalSupportTicket(payload);
  }

  const { url } = resolveHaiSupportCredentials();

  if (isDedicatedRestApi(url)) {
    const rest = await createRestSupportTicket(payload);
    if (rest) return rest;
    return createLocalSupportTicket(payload);
  }

  const hsTicket = await createHaiSupportSupabaseTicket(payload);
  if (hsTicket) return hsTicket;

  const storeTicket = await createStoreServiceRequestTicket(payload);
  if (storeTicket) return storeTicket;

  const rest = await createRestSupportTicket(payload);
  if (rest) return rest;

  console.warn('[haisupport-tickets] sin canal remoto; usando respaldo local');
  return createLocalSupportTicket(payload);
}

export { isHaiSupportConfigured };

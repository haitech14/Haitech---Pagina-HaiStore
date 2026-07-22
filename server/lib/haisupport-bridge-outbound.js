/**
 * Sincronización outbound HaiStore → HaiSupport vía bridge Supabase.
 * Usado cuando HAISUPPORT_API_URL apunta al mismo proyecto (sin API REST /sync).
 */

import {
  haitechClientToStoreCustomerRow,
  inboundPayloadToHaitechClient,
  storeCustomerRowToHaitechClient,
} from './haitech-mappers.js';
import {
  deleteHaiSupportRentalRequest,
  deleteHaiSupportServiceRequest,
  upsertHaiSupportClient,
  upsertHaiSupportRentalRequest,
  upsertHaiSupportServiceRequest,
} from './haisupport-bridge.js';
import { getHaiSupportSupabaseAdmin, isHaiSupportSupabaseConfigured } from './haisupport-supabase.js';
import { getSupabaseAdmin } from './supabase-auth.js';

async function clientsTableAvailable() {
  const supabase = getHaiSupportSupabaseAdmin();
  if (!supabase) return false;

  const { error } = await supabase.from('clients').select('id').limit(1);
  if (!error) return true;
  if (error.code === 'PGRST205') return false;
  const message = String(error.message ?? '').toLowerCase();
  return !message.includes('schema cache') && !message.includes('does not exist');
}

async function syncCustomerOutbound(action, payload) {
  if (!payload) return { ok: false, reason: 'empty-payload' };

  if (action === 'delete') {
    const supabase = getHaiSupportSupabaseAdmin();
    const hsId = payload.haisupportClientId ?? payload.haisupport_client_id;
    if (supabase && hsId) {
      await supabase.from('clients').delete().eq('id', hsId);
    }
    return { ok: true, mode: 'delete' };
  }

  const client = inboundPayloadToHaitechClient(payload);
  const hsId = await upsertHaiSupportClient(client);

  const storeDb = getSupabaseAdmin();
  const storeId = client.storeCustomerId ?? client.id ?? payload.id;
  if (hsId && storeDb && storeId) {
    await storeDb
      .from('store_customers')
      .update({ haisupport_client_id: hsId, updated_at: new Date().toISOString() })
      .eq('id', storeId);
  }

  return { ok: Boolean(hsId), mode: 'upsert', haisupportClientId: hsId };
}

async function syncServiceRequestOutbound(action, payload) {
  if (action === 'delete') {
    const hsId = payload?.haisupportRequestId ?? payload?.haisupport_request_id;
    if (hsId) await deleteHaiSupportServiceRequest(hsId);
    return { ok: true, mode: 'delete' };
  }
  const hsId = await upsertHaiSupportServiceRequest(payload);
  return { ok: Boolean(hsId), mode: 'upsert', haisupportRequestId: hsId };
}

async function syncRentalRequestOutbound(action, payload) {
  if (action === 'delete') {
    const hsId = payload?.haisupportRentalId ?? payload?.haisupport_rental_id;
    if (hsId) await deleteHaiSupportRentalRequest(hsId);
    return { ok: true, mode: 'delete' };
  }
  const hsId = await upsertHaiSupportRentalRequest(payload);
  return { ok: Boolean(hsId), mode: 'upsert', haisupportRentalId: hsId };
}

/**
 * @param {'products'|'customers'|'proformas'|'rental_plans'|'service_requests'|'rental_requests'|'orders'} entity
 * @param {'create'|'update'|'delete'|'upsert'} action
 * @param {unknown} payload
 */
export async function bridgeOutboundSync(entity, action, payload) {
  if (!isHaiSupportSupabaseConfigured()) {
    return { ok: false, reason: 'not-configured' };
  }

  switch (entity) {
    case 'customers': {
      if (!(await clientsTableAvailable())) {
        return { ok: true, mode: 'shared-db-skip', reason: 'clients-table-missing' };
      }
      return syncCustomerOutbound(action, payload);
    }
    case 'service_requests':
      return syncServiceRequestOutbound(action, payload);
    case 'rental_requests':
      return syncRentalRequestOutbound(action, payload);
    case 'products':
    case 'proformas':
    case 'rental_plans':
    case 'orders':
      // Mismo proyecto Supabase: tablas store_* / products compartidas vía Realtime.
      return { ok: true, mode: 'shared-db-skip' };
    default:
      return { ok: false, reason: `unsupported-entity:${entity}` };
  }
}

/** Empuja clientes HaiStore hacia la tabla `clients` de HaiSupport. */
export async function pushStoreCustomersToHaiSupport() {
  const storeDb = getSupabaseAdmin();
  if (!storeDb || !isHaiSupportSupabaseConfigured()) {
    return { pushed: 0, linked: 0, errors: [] };
  }
  if (!(await clientsTableAvailable())) {
    return { pushed: 0, linked: 0, errors: [{ message: 'Tabla clients no disponible en HaiSupport' }] };
  }

  const { data: rows, error } = await storeDb.from('store_customers').select('*');
  if (error) throw new Error(error.message);

  let pushed = 0;
  let linked = 0;
  /** @type {Array<{ id?: string; message: string }>} */
  const errors = [];

  for (const row of rows ?? []) {
    try {
      const client = storeCustomerRowToHaitechClient(row);
      const hsId = await upsertHaiSupportClient(client);
      if (hsId && row.haisupport_client_id !== hsId) {
        await storeDb
          .from('store_customers')
          .update({ haisupport_client_id: hsId, updated_at: new Date().toISOString() })
          .eq('id', row.id);
        linked += 1;
      }
      if (hsId) pushed += 1;
    } catch (err) {
      errors.push({
        id: row.id,
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { pushed, linked, errors };
}

/** Trae clientes de HaiSupport `clients` hacia store_customers. */
export async function pullHaiSupportClientsToStore() {
  const storeDb = getSupabaseAdmin();
  const hsDb = getHaiSupportSupabaseAdmin();
  if (!storeDb || !hsDb) {
    return { pulled: 0, updated: 0, errors: [] };
  }
  if (!(await clientsTableAvailable())) {
    return { pulled: 0, updated: 0, errors: [{ message: 'Tabla clients no disponible' }] };
  }

  const pageSize = 500;
  let from = 0;
  let pulled = 0;
  let updated = 0;
  /** @type {Array<{ id?: string; message: string }>} */
  const errors = [];

  while (true) {
    const { data, error } = await hsDb
      .from('clients')
      .select('*')
      .order('created_at', { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) throw new Error(error.message);
    const batch = data ?? [];
    if (batch.length === 0) break;

    for (const hsRow of batch) {
      try {
        const hsId = String(hsRow.id);
        let storeRow = null;

        const { data: byHsId } = await storeDb
          .from('store_customers')
          .select('*')
          .eq('haisupport_client_id', hsId)
          .maybeSingle();
        if (byHsId) storeRow = byHsId;

        const ruc = hsRow.ruc_dni?.trim();
        if (!storeRow && ruc) {
          const { data: byTax } = await storeDb
            .from('store_customers')
            .select('*')
            .eq('tax_id', ruc)
            .maybeSingle();
          if (byTax) storeRow = byTax;
        }

        const email = hsRow.email?.trim();
        if (!storeRow && email) {
          const { data: byEmail } = await storeDb
            .from('store_customers')
            .select('*')
            .eq('email', email)
            .maybeSingle();
          if (byEmail) storeRow = byEmail;
        }

        const client = {
          id: storeRow?.id ?? hsId,
          storeCustomerId: storeRow?.id ?? null,
          haisupportClientId: hsId,
          nombre: String(hsRow.nombre ?? '').trim(),
          nombreContacto: String(hsRow.nombre_contacto ?? hsRow.nombre ?? '').trim(),
          rucDni: String(hsRow.ruc_dni ?? '').trim(),
          telefono: String(hsRow.telefono ?? '').trim(),
          direccion: String(hsRow.direccion ?? '').trim(),
          ciudad: String(hsRow.ciudad ?? '').trim(),
          tipoCliente: hsRow.tipo_cliente,
          email: email ?? null,
          notas: hsRow.notas?.trim() ?? null,
          source: 'haisupport',
        };

        const row = haitechClientToStoreCustomerRow(client, storeRow?.id);
        row.haisupport_client_id = hsId;
        row.source = storeRow?.source === 'haistore' ? 'haistore' : 'haisupport';

        if (storeRow?.id) {
          const { error: updateError } = await storeDb
            .from('store_customers')
            .update(row)
            .eq('id', storeRow.id);
          if (updateError) throw new Error(updateError.message);
          updated += 1;
        } else {
          row.id = hsId;
          row.created_at = hsRow.created_at ?? new Date().toISOString();
          const { error: insertError } = await storeDb.from('store_customers').insert(row);
          if (insertError) throw new Error(insertError.message);
          pulled += 1;
        }
      } catch (err) {
        errors.push({
          id: hsRow.id,
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }

    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return { pulled, updated, errors };
}

export { clientsTableAvailable };

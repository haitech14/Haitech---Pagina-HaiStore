import { randomUUID } from 'crypto';

import {
  haitechClientToHaiSupportClientRow,
  haitechClientToStoreCustomerRow,
  inboundPayloadToHaitechClient,
  storeCustomerRowToHaitechClient,
} from './haitech-mappers.js';
import { getHaiSupportSupabaseAdmin, isHaiSupportSupabaseConfigured } from './haisupport-supabase.js';
import { getSupabaseAdmin } from './supabase-auth.js';

function hs() {
  return getHaiSupportSupabaseAdmin();
}

export async function upsertHaiSupportClient(client) {
  const supabase = hs();
  if (!supabase) return null;

  const row = haitechClientToHaiSupportClientRow(client);
  if (!row.nombre?.trim()) return null;

  const { data, error } = await supabase
    .from('clients')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[haisupport-bridge] upsert client:', error.message);
    return null;
  }

  return data?.id ?? row.id ?? null;
}

export async function upsertHaiSupportServiceRequest(record) {
  const supabase = hs();
  if (!supabase) return null;

  const customer = record.customerSnapshot ?? record.customer_snapshot ?? {};
  const row = {
    id: record.haisupportRequestId ?? record.haisupport_request_id ?? undefined,
    code: record.code,
    client_id: record.clientId ?? record.client_id ?? customer.haisupportClientId ?? null,
    customer_snapshot: customer,
    category_id: record.categoryId ?? record.category_id,
    category_label: record.categoryLabel ?? record.category_label,
    description: record.description,
    status: record.status,
    scheduled_at: record.scheduledAt ?? record.scheduled_at,
    technician: record.technician ?? null,
    address: record.address ?? null,
    city: record.city ?? null,
    source: 'haistore',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('service_requests')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[haisupport-bridge] upsert service_request:', error.message);
    return null;
  }

  return data?.id ?? null;
}

export async function deleteHaiSupportServiceRequest(id) {
  const supabase = hs();
  if (!supabase || !id) return null;
  const { error } = await supabase.from('service_requests').delete().eq('id', id);
  if (error) console.warn('[haisupport-bridge] delete service_request:', error.message);
  return !error;
}

export async function upsertHaiSupportRentalRequest(record) {
  const supabase = hs();
  if (!supabase) return null;

  const customer = record.customerSnapshot ?? record.customer_snapshot ?? {};
  const row = {
    id: record.haisupportRentalId ?? record.haisupport_rental_id ?? undefined,
    code: record.code,
    client_id: record.clientId ?? record.client_id ?? null,
    plan_id: record.planId ?? record.plan_id,
    plan_label: record.planLabel ?? record.plan_label,
    product_id: record.productId ?? record.product_id ?? null,
    product_name: record.productName ?? record.product_name ?? null,
    customer_snapshot: customer,
    pages_per_month: record.pagesPerMonth ?? record.pages_per_month,
    monthly_price_pen: record.monthlyPricePen ?? record.monthly_price_pen,
    start_date: record.startDate ?? record.start_date,
    status: record.status,
    notes: record.notes ?? null,
    source: 'haistore',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('rental_requests')
    .upsert(row, { onConflict: 'id' })
    .select('id')
    .maybeSingle();

  if (error) {
    console.warn('[haisupport-bridge] upsert rental_request:', error.message);
    return null;
  }

  return data?.id ?? null;
}

export async function deleteHaiSupportRentalRequest(id) {
  const supabase = hs();
  if (!supabase || !id) return null;
  const { error } = await supabase.from('rental_requests').delete().eq('id', id);
  if (error) console.warn('[haisupport-bridge] delete rental_request:', error.message);
  return !error;
}

/** Persiste o vincula cliente en store_customers y opcionalmente en HaiSupport. */
export async function ensureStoreCustomerFromHaitechClient(clientInput) {
  const supabase = getSupabaseAdmin();
  const client = inboundPayloadToHaitechClient(clientInput);

  if (!client.nombre?.trim()) {
    throw new Error('La razón social del cliente es obligatoria');
  }

  let storeRow = null;

  if (supabase) {
    const existingId = client.storeCustomerId ?? client.id;
    if (existingId) {
      const { data } = await supabase
        .from('store_customers')
        .select('*')
        .eq('id', existingId)
        .maybeSingle();
      if (data) storeRow = data;
    }

    if (!storeRow && client.rucDni) {
      const { data } = await supabase
        .from('store_customers')
        .select('*')
        .eq('tax_id', client.rucDni)
        .maybeSingle();
      if (data) storeRow = data;
    }

    const row = haitechClientToStoreCustomerRow(
      { ...client, storeCustomerId: storeRow?.id ?? client.storeCustomerId },
      storeRow?.id,
    );

    if (storeRow?.id) {
      const { data, error } = await supabase
        .from('store_customers')
        .update(row)
        .eq('id', storeRow.id)
        .select('*')
        .single();
      if (error) throw new Error(`No se pudo actualizar el cliente: ${error.message}`);
      storeRow = data;
    } else {
      if (!row.id) row.id = randomUUID();
      row.created_at = new Date().toISOString();
      const { data, error } = await supabase.from('store_customers').insert(row).select('*').single();
      if (error) throw new Error(`No se pudo crear el cliente: ${error.message}`);
      storeRow = data;
    }
  } else {
    throw new Error('Supabase no configurado (SUPABASE_SERVICE_ROLE_KEY)');
  }

  let hsClientId = client.haisupportClientId ?? storeRow?.haisupport_client_id ?? null;
  if (isHaiSupportSupabaseConfigured()) {
    const hsId = await upsertHaiSupportClient({
      ...storeCustomerRowToHaitechClient(storeRow ?? client),
      haisupportClientId: hsClientId,
    });
    if (hsId && supabase && storeRow?.id) {
      hsClientId = hsId;
      await supabase
        .from('store_customers')
        .update({ haisupport_client_id: hsId, updated_at: new Date().toISOString() })
        .eq('id', storeRow.id);
    }
  }

  return {
    clientId: storeRow?.id ?? null,
    haisupportClientId: hsClientId,
    snapshot: storeCustomerRowToHaitechClient(storeRow ?? { ...client, id: storeRow?.id }),
  };
}

export { isHaiSupportSupabaseConfigured };

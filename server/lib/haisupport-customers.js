import { getHaiSupportSupabaseAdmin, isHaiSupportSupabaseConfigured } from './haisupport-supabase.js';

const CLIENT_SELECT =
  'id, nombre, nombre_contacto, ruc_dni, email, email_secundario, telefono, direccion, ciudad, tipo_cliente, notas, created_at, updated_at, user_id';

/** @param {string | null | undefined} tipo */
export function mapHaiSupportTipoClienteToRole(tipo) {
  const norm = String(tipo ?? '')
    .trim()
    .toLowerCase();
  if (norm === 'tecnico') return 'tecnico';
  if (norm === 'distribuidor_no_tecnico' || norm === 'distribuidor') return 'distribuidor';
  if (norm === 'mayorista') return 'mayorista';
  if (norm === 'corporativo2') return 'corporativo2';
  if (norm === 'corporativo') return 'corporativo';
  if (norm === 'vip') return 'vip';
  return 'public';
}

function resolveEmail(row) {
  const primary = row.email?.trim();
  if (primary) return primary;
  const secondary = row.email_secundario?.trim();
  if (secondary) return secondary;
  return `${String(row.id).slice(0, 8)}@haisupport.local`;
}

/** @param {Record<string, unknown>} row */
export function mapHaiSupportClientRow(row) {
  const companyName = row.nombre?.trim() || null;
  const contactName = row.nombre_contacto?.trim() || companyName;
  const city = row.ciudad?.trim() || null;

  return {
    id: String(row.id),
    profile_id: row.user_id ?? null,
    email: resolveEmail(row),
    full_name: contactName,
    phone: row.telefono?.trim() || null,
    company_name: companyName,
    tax_id: row.ruc_dni?.trim() || null,
    notes: row.notas?.trim() || null,
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    profile_role: mapHaiSupportTipoClienteToRole(row.tipo_cliente),
    default_billing: city ? { city, ciudad: city } : null,
    source: 'haisupport',
  };
}

function normalizeDedupeKey(customer) {
  const email = customer.email?.trim().toLowerCase();
  if (email && !email.endsWith('@haisupport.local')) return `email:${email}`;
  const taxId = customer.tax_id?.trim();
  if (taxId) return `tax:${taxId}`;
  return `id:${customer.source}:${customer.id}`;
}

/**
 * Combina clientes HaiStore + HaiSupport sin duplicar por correo o RUC.
 * @param {Array<Record<string, unknown>>} storeCustomers
 * @param {Array<Record<string, unknown>>} haisupportCustomers
 */
export function mergeStoreAndHaiSupportCustomers(storeCustomers, haisupportCustomers) {
  const merged = [];
  const seen = new Set();

  for (const customer of storeCustomers) {
    const row = { ...customer, source: customer.source ?? 'haistore' };
    seen.add(normalizeDedupeKey(row));
    merged.push(row);
  }

  for (const customer of haisupportCustomers) {
    const key = normalizeDedupeKey(customer);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(customer);
  }

  merged.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return merged;
}

export async function listHaiSupportClients() {
  if (!isHaiSupportSupabaseConfigured()) return [];

  const supabase = getHaiSupportSupabaseAdmin();
  const pageSize = 1000;
  /** @type {Record<string, unknown>[]} */
  const all = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from('clients')
      .select(CLIENT_SELECT)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);

    if (error) {
      console.error('[haisupport-customers] list:', error.message);
      break;
    }

    const batch = data ?? [];
    all.push(...batch);
    if (batch.length < pageSize) break;
    from += pageSize;
  }

  return all.map(mapHaiSupportClientRow);
}

export async function searchHaiSupportClients(query, limit = 12) {
  if (!isHaiSupportSupabaseConfigured()) return [];

  const q = String(query ?? '').trim();
  if (q.length < 2) return [];

  const supabase = getHaiSupportSupabaseAdmin();
  const pattern = `%${q.replace(/,/g, ' ')}%`;

  const { data, error } = await supabase
    .from('clients')
    .select(CLIENT_SELECT)
    .or(
      `nombre.ilike.${pattern},nombre_contacto.ilike.${pattern},ruc_dni.ilike.${pattern},email.ilike.${pattern},email_secundario.ilike.${pattern},telefono.ilike.${pattern}`,
    )
    .order('nombre', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('[haisupport-customers] search:', error.message);
    return [];
  }

  return (data ?? []).map(mapHaiSupportClientRow);
}

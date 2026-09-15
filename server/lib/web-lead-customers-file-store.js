/**
 * Respaldo local de clientes que llegan por WhatsApp / web cuando Supabase
 * no está disponible, para que figuren en el panel (Clientes + seguimiento).
 */

import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

import { getWebLeadCustomersPath } from './server-paths.js';

async function ensureFile() {
  const filePath = getWebLeadCustomersPath();
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ customers: [] }, null, 2));
  }
}

async function readAll() {
  await ensureFile();
  try {
    const raw = await fs.readFile(getWebLeadCustomersPath(), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.customers) ? parsed.customers : [];
  } catch {
    return [];
  }
}

async function writeAll(customers) {
  await ensureFile();
  await fs.writeFile(
    getWebLeadCustomersPath(),
    JSON.stringify({ customers }, null, 2),
  );
}

function parseLeadHistory(persona) {
  if (!persona || typeof persona !== 'object') return [];
  const raw = persona.web_lead_history;
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function mergePersonaData(previous, incoming) {
  const prev = previous && typeof previous === 'object' ? previous : {};
  const next = incoming && typeof incoming === 'object' ? incoming : {};
  const history = [...parseLeadHistory(next), ...parseLeadHistory(prev)].slice(0, 25);
  const observaciones = [next.observaciones, prev.observaciones]
    .filter((value) => typeof value === 'string' && value.trim())
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .join('\n')
    .slice(0, 4000);

  return {
    ...prev,
    ...next,
    web_lead_history: JSON.stringify(history),
    ...(observaciones ? { observaciones } : {}),
  };
}

/**
 * @param {Record<string, unknown>} customer
 */
export async function upsertWebLeadCustomerFile(customer) {
  const customers = await readAll();
  const email = String(customer.email ?? '').trim().toLowerCase();
  const taxId = String(customer.tax_id ?? '').trim();
  const id = String(customer.id ?? '').trim() || randomUUID();

  const index = customers.findIndex((row) => {
    if (row?.id === id) return true;
    if (taxId && String(row?.tax_id ?? '').trim() === taxId) return true;
    if (email && String(row?.email ?? '').trim().toLowerCase() === email) return true;
    return false;
  });

  const now = new Date().toISOString();
  const existing = index >= 0 ? customers[index] : null;
  const next = {
    ...(existing ?? {}),
    ...customer,
    id: existing?.id ?? id,
    persona_data: mergePersonaData(existing?.persona_data, customer.persona_data),
    notes: [customer.notes, existing?.notes]
      .filter((value) => typeof value === 'string' && value.trim())
      .filter((value, i, arr) => arr.indexOf(value) === i)
      .join('\n')
      .slice(0, 4000),
    created_at: existing?.created_at ?? customer.created_at ?? now,
    updated_at: now,
    source: 'haistore',
    profile_role: customer.profile_role ?? existing?.profile_role ?? customer.tipo_cliente ?? 'public',
  };

  if (index >= 0) {
    customers[index] = next;
  } else {
    customers.unshift(next);
  }

  await writeAll(customers.slice(0, 500));
  return { id: next.id, email: next.email, created: index < 0 };
}

/**
 * @param {Record<string, unknown>} row
 */
export function mapWebLeadCustomerForAdmin(row) {
  return {
    id: row.id,
    profile_id: null,
    email: row.email ?? '',
    full_name: row.full_name ?? null,
    phone: row.phone ?? null,
    company_name: row.company_name ?? null,
    tax_id: row.tax_id ?? null,
    nombre_contacto: row.nombre_contacto ?? row.full_name ?? null,
    direccion: row.direccion ?? null,
    ciudad: row.ciudad ?? null,
    tipo_cliente: row.tipo_cliente ?? 'public',
    persona_data: row.persona_data ?? {},
    productos_interes: Array.isArray(row.productos_interes) ? row.productos_interes : [],
    notes: row.notes ?? null,
    source: 'haistore',
    created_at: row.created_at ?? new Date().toISOString(),
    updated_at: row.updated_at ?? row.created_at ?? new Date().toISOString(),
    profile_role: row.profile_role ?? row.tipo_cliente ?? 'public',
  };
}

export async function listWebLeadCustomersFile() {
  const rows = await readAll();
  return rows.map(mapWebLeadCustomerForAdmin);
}

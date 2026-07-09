import { randomUUID } from 'crypto';

import { getSupabaseAdmin } from './supabase-auth.js';

const VALID_MODALIDAD = new Set(['presencial', 'remoto', 'mixto']);
const VALID_TIPO = new Set(['unico', 'mensual', 'proyecto']);
const VALID_ESTADO = new Set(['activo', 'programado', 'pausado', 'archivado']);

export const SERVICE_CATALOG_MIGRATION_HINT =
  'Falta la tabla store_service_catalog en Supabase. Ejecuta la migración 017 (npm run db:migrate:017) o aplica supabase/migrations/017_store_service_catalog.sql en el SQL Editor.';

/** @param {{ code?: string; message?: string } | null | undefined} error */
export function isMissingServiceCatalogTable(error) {
  if (!error) return false;
  if (error.code === 'PGRST205') return true;
  const message = String(error.message ?? '').toLowerCase();
  return message.includes('store_service_catalog') && message.includes('schema cache');
}

function defaultPrices() {
  return { public: 0, tecnico: 0, mayorista: 0, distribuidor: 0 };
}

function normalizePrices(value) {
  const base = defaultPrices();
  if (!value || typeof value !== 'object') return base;
  for (const key of Object.keys(base)) {
    const raw = value[key];
    base[key] = typeof raw === 'number' && Number.isFinite(raw) ? raw : 0;
  }
  return base;
}

function rowToItem(row) {
  const item = {
    id: row.id,
    code: row.code,
    name: row.name,
    categoryId: row.category_id,
    description: row.description ?? '',
    prices: normalizePrices(row.prices),
    active: row.active !== false,
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };

  if (row.modalidad) item.modalidad = row.modalidad;
  if (row.tipo) item.tipo = row.tipo;
  if (row.estado) item.estado = row.estado;
  if (row.cobertura) item.cobertura = row.cobertura;
  if (row.responsable_name) item.responsableName = row.responsable_name;
  if (row.responsable_title) item.responsableTitle = row.responsable_title;

  return item;
}

function itemToRow(item, sortOrder = 0) {
  const row = {
    id: item.id,
    code: item.code,
    name: item.name,
    category_id: item.categoryId,
    description: item.description ?? '',
    prices: normalizePrices(item.prices),
    active: item.active !== false,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  };

  if (item.modalidad && VALID_MODALIDAD.has(item.modalidad)) row.modalidad = item.modalidad;
  if (item.tipo && VALID_TIPO.has(item.tipo)) row.tipo = item.tipo;
  if (item.estado && VALID_ESTADO.has(item.estado)) row.estado = item.estado;
  if (item.cobertura) row.cobertura = String(item.cobertura).trim();
  if (item.responsableName) row.responsable_name = String(item.responsableName).trim();
  if (item.responsableTitle) row.responsable_title = String(item.responsableTitle).trim();
  if (item.createdAt) row.created_at = item.createdAt;

  return row;
}

function generateCode() {
  return `SRV-${String(Date.now()).slice(-6)}`;
}

export async function readServiceCatalog() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { items: [], unavailable: true, migrationHint: SERVICE_CATALOG_MIGRATION_HINT };
  }

  const { data, error } = await supabase
    .from('store_service_catalog')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('updated_at', { ascending: false });

  if (error) {
    if (isMissingServiceCatalogTable(error)) {
      return { items: [], unavailable: true, migrationHint: SERVICE_CATALOG_MIGRATION_HINT };
    }
    throw new Error('No se pudo cargar el catálogo de servicios');
  }

  return { items: (data ?? []).map(rowToItem), unavailable: false };
}

export async function createServiceCatalogItem(body) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);

  const name = String(body.name ?? '').trim();
  const categoryId = String(body.categoryId ?? body.category_id ?? '').trim();
  if (!name) throw new Error('El nombre del servicio es obligatorio');
  if (!categoryId) throw new Error('La categoría es obligatoria');

  const now = new Date().toISOString();
  const item = {
    id: body.id?.trim() || `sp-${randomUUID()}`,
    code: String(body.code ?? '').trim() || generateCode(),
    name,
    categoryId,
    description: String(body.description ?? '').trim(),
    prices: normalizePrices(body.prices),
    active: body.active !== false,
    createdAt: body.createdAt ?? now,
    updatedAt: now,
  };

  if (body.modalidad && VALID_MODALIDAD.has(body.modalidad)) item.modalidad = body.modalidad;
  if (body.tipo && VALID_TIPO.has(body.tipo)) item.tipo = body.tipo;
  if (body.estado && VALID_ESTADO.has(body.estado)) item.estado = body.estado;
  if (body.cobertura) item.cobertura = String(body.cobertura).trim();
  if (body.responsableName) item.responsableName = String(body.responsableName).trim();
  if (body.responsableTitle) item.responsableTitle = String(body.responsableTitle).trim();

  const { count } = await supabase
    .from('store_service_catalog')
    .select('id', { count: 'exact', head: true });
  const sortOrder = (count ?? 0) + 1;

  const row = itemToRow(item, sortOrder);
  if (!row.created_at) row.created_at = now;

  const { data, error } = await supabase
    .from('store_service_catalog')
    .insert(row)
    .select('*')
    .single();

  if (error) {
    if (isMissingServiceCatalogTable(error)) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);
    throw new Error('No se pudo crear el servicio en el catálogo');
  }

  return rowToItem(data);
}

export async function patchServiceCatalogItem(id, body) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);

  const patch = { updated_at: new Date().toISOString() };

  if (body.code !== undefined) patch.code = String(body.code).trim();
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.categoryId !== undefined || body.category_id !== undefined) {
    patch.category_id = String(body.categoryId ?? body.category_id).trim();
  }
  if (body.description !== undefined) patch.description = String(body.description).trim();
  if (body.prices !== undefined) patch.prices = normalizePrices(body.prices);
  if (body.active !== undefined) patch.active = Boolean(body.active);
  if (body.modalidad !== undefined && VALID_MODALIDAD.has(body.modalidad)) {
    patch.modalidad = body.modalidad;
  }
  if (body.tipo !== undefined && VALID_TIPO.has(body.tipo)) patch.tipo = body.tipo;
  if (body.estado !== undefined && VALID_ESTADO.has(body.estado)) patch.estado = body.estado;
  if (body.cobertura !== undefined) patch.cobertura = String(body.cobertura).trim();
  if (body.responsableName !== undefined) patch.responsable_name = String(body.responsableName).trim();
  if (body.responsableTitle !== undefined) {
    patch.responsable_title = String(body.responsableTitle).trim();
  }
  if (body.sortOrder !== undefined) patch.sort_order = Number(body.sortOrder) || 0;

  const { data, error } = await supabase
    .from('store_service_catalog')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle();

  if (error) {
    if (isMissingServiceCatalogTable(error)) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);
    throw new Error('No se pudo actualizar el servicio');
  }
  if (!data) throw new Error('Servicio no encontrado');

  return rowToItem(data);
}

export async function removeServiceCatalogItem(id) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);

  const { error } = await supabase.from('store_service_catalog').delete().eq('id', id);

  if (error) {
    if (isMissingServiceCatalogTable(error)) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);
    throw new Error('No se pudo eliminar el servicio');
  }
}

export async function importServiceCatalog(items) {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);
  if (!Array.isArray(items) || items.length === 0) {
    return { items: [], imported: 0 };
  }

  const rows = items.map((item, index) => {
    const normalized = {
      id: item.id?.trim() || `sp-${randomUUID()}`,
      code: item.code?.trim() || generateCode(),
      name: String(item.name ?? '').trim() || 'Servicio sin nombre',
      categoryId: String(item.categoryId ?? item.category_id ?? 'cat-mantenimiento'),
      description: String(item.description ?? '').trim(),
      prices: normalizePrices(item.prices),
      active: item.active !== false,
      modalidad: item.modalidad,
      tipo: item.tipo,
      estado: item.estado,
      cobertura: item.cobertura,
      responsableName: item.responsableName,
      responsableTitle: item.responsableTitle,
      createdAt: item.createdAt,
    };
    return itemToRow(normalized, index + 1);
  });

  const { data, error } = await supabase
    .from('store_service_catalog')
    .upsert(rows, { onConflict: 'id' })
    .select('*');

  if (error) {
    if (isMissingServiceCatalogTable(error)) throw new Error(SERVICE_CATALOG_MIGRATION_HINT);
    throw new Error('No se pudo importar el catálogo de servicios');
  }

  return {
    items: (data ?? []).map(rowToItem),
    imported: (data ?? []).length,
  };
}

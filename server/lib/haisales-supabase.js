import { createClient } from '@supabase/supabase-js';

import {
  isHaiSalesRemoteProject,
  isSupabaseProjectUrl,
  resolveHaiSalesCredentials,
} from './haitech-integrations-config.js';

let haisalesAdminClient = null;

/** URL del proyecto Supabase de HaiSales (sin /rest/v1). Por defecto = SUPABASE_URL. */
export function getHaiSalesSupabaseUrl() {
  const { url } = resolveHaiSalesCredentials();
  if (!url || !isSupabaseProjectUrl(url)) return url;
  return url;
}

export function getHaiSalesSupabaseKey() {
  return resolveHaiSalesCredentials().key;
}

export function getHaiSalesSupabaseAdmin() {
  if (haisalesAdminClient) return haisalesAdminClient;

  const url = getHaiSalesSupabaseUrl();
  const serviceKey = getHaiSalesSupabaseKey();
  if (!url?.includes('supabase.co') || !serviceKey) return null;

  haisalesAdminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  return haisalesAdminClient;
}

export function isHaiSalesSupabaseConfigured() {
  return Boolean(getHaiSalesSupabaseAdmin());
}

export function isHaiSalesRemoteDatabase() {
  return isHaiSalesRemoteProject();
}

export const HAISALES_TABLE_PERSONA =
  process.env.HAISALES_TABLE_PERSONA?.trim() || 'haisales_persona';

export const HAISALES_TABLE_VENTAS =
  process.env.HAISALES_TABLE_VENTAS?.trim() || 'haisales_ventas';

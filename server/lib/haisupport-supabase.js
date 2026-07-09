import { createClient } from '@supabase/supabase-js';

import {
  isSupabaseProjectUrl,
  resolveHaiSupportCredentials,
} from './haitech-integrations-config.js';

let haisupportAdminClient = null;

/** URL base del proyecto Supabase de HaiSupport (sin /rest/v1). */
export function getHaiSupportSupabaseUrl() {
  const { url } = resolveHaiSupportCredentials();
  if (!url || !isSupabaseProjectUrl(url)) return null;
  return url;
}

export function getHaiSupportSupabaseAdmin() {
  if (haisupportAdminClient) return haisupportAdminClient;

  const { url, key } = resolveHaiSupportCredentials();
  if (!url || !key || !isSupabaseProjectUrl(url)) return null;

  haisupportAdminClient = createClient(url, key, { auth: { persistSession: false } });
  return haisupportAdminClient;
}

export function isHaiSupportSupabaseConfigured() {
  return Boolean(getHaiSupportSupabaseAdmin());
}

import { createClient } from '@supabase/supabase-js';

import { resolveBootstrapRole } from './admin-access.js';
import { isUserRole } from './roles.js';

let adminClient = null;

export function getSupabaseAdmin() {
  if (adminClient) return adminClient;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  adminClient = createClient(url, serviceKey, { auth: { persistSession: false } });
  return adminClient;
}

export function isSupabaseAuthEnabled() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function resolveRoleFromUser(user, profile) {
  const email = profile?.email ?? user.email ?? '';
  const candidates = [profile?.role, user.app_metadata?.role, user.user_metadata?.role];
  let role = 'public';
  for (const value of candidates) {
    if (typeof value === 'string' && isUserRole(value)) {
      role = value;
      break;
    }
  }
  return resolveBootstrapRole(email, role);
}

export async function verifySupabaseToken(token) {
  const client = getSupabaseAdmin();
  if (!client || !token) return null;

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token);

  if (error || !user) return null;

  const { data: profile } = await client
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle();

  const role = resolveRoleFromUser(user, profile);

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? '',
    name: profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Usuario',
    role,
  };
}

export async function upsertProfileFromAuth(user) {
  const client = getSupabaseAdmin();
  if (!client || !user) return null;

  const role = resolveRoleFromUser(user, null);
  const row = {
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuario',
    role,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client.from('profiles').upsert(row, { onConflict: 'id' }).select().single();
  if (error) {
    console.warn('[auth] no se pudo sincronizar perfil:', error.message);
    return row;
  }
  return data;
}

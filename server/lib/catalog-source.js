import { isSupabaseAuthEnabled } from './supabase-auth.js';

/** En Vercel el disco es efímero; Supabase es la fuente de verdad del catálogo. */
export function shouldPreferSupabaseCatalog() {
  if (!isSupabaseAuthEnabled()) return false;
  const isVercelRuntime = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
  if (!isVercelRuntime) return false;
  if (process.env.HAISTORE_CATALOG_SOURCE === 'file') return false;
  if (process.env.HAISTORE_CATALOG_SOURCE === 'supabase') return true;
  return true;
}

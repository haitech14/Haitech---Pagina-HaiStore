/** Cliente Supabase listo para auth real (no placeholders del .env.example). */
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';
  if (!url || !key) return false;
  if (url.includes('tu-proyecto') || key.includes('tu-anon')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/** Realtime es opcional: `VITE_SUPABASE_REALTIME=false` lo desactiva sin tocar el resto. */
export function isSupabaseRealtimeEnabled(): boolean {
  if (!isSupabaseConfigured()) return false;
  const flag = import.meta.env.VITE_SUPABASE_REALTIME?.trim().toLowerCase();
  if (flag === '0' || flag === 'false' || flag === 'off') return false;
  return true;
}

import type { SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/lib/supabase-config';

let client: SupabaseClient | null = null;
let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * Carga @supabase/supabase-js bajo demanda (login, sesión supabase, realtime).
 * El boot anónimo / demo no debe importar el SDK.
 */
export async function getSupabaseClientAsync(): Promise<SupabaseClient> {
  if (client) return client;
  if (!clientPromise) {
    clientPromise = (async () => {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

      if (!isSupabaseConfigured()) {
        console.warn(
          '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
            'Copia .env.example a .env y rellena tus credenciales.',
        );
        client = createClient('https://placeholder.local', 'placeholder-key', {
          auth: { persistSession: false, autoRefreshToken: false },
        });
        return client;
      }

      client = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return client;
    })().catch((error) => {
      clientPromise = null;
      throw error;
    });
  }
  return clientPromise;
}

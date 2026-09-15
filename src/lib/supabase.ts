import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { isSupabaseConfigured } from '@/lib/supabase-config';

let client: SupabaseClient | null = null;
let realtimeStopped = false;
let realtimeStopLogged = false;

const REALTIME_OFF_KEY = 'haistore-realtime-off';
const REALTIME_MAX_RECONNECTS = 1;
const REALTIME_STOP_DELAY_MS = 86_400_000;

function persistRealtimeStopped(): void {
  try {
    sessionStorage.setItem(REALTIME_OFF_KEY, '1');
  } catch {
    // ignore
  }
}

function reconnectAfterMs(tries: number): number {
  if (isSupabaseRealtimeStopped() || tries > REALTIME_MAX_RECONNECTS) {
    queueMicrotask(() => stopSupabaseRealtime());
    return REALTIME_STOP_DELAY_MS;
  }
  return Math.min(400 * 2 ** tries, 4_000);
}

export function isSupabaseRealtimeStopped(): boolean {
  if (realtimeStopped) return true;
  try {
    return sessionStorage.getItem(REALTIME_OFF_KEY) === '1';
  } catch {
    return false;
  }
}

/** Cierra Realtime y evita reintentos infinitos si el WebSocket no está disponible. */
export function stopSupabaseRealtime(): void {
  if (realtimeStopped) {
    persistRealtimeStopped();
    return;
  }
  realtimeStopped = true;
  persistRealtimeStopped();
  if (!client) return;

  try {
    void client.removeAllChannels();
    client.realtime.disconnect();
  } catch {
    // ignore
  }

  if (!realtimeStopLogged && import.meta.env.DEV) {
    realtimeStopLogged = true;
    console.info('[supabase] Realtime no disponible; se desactiva el sync en vivo.');
  }
}

function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ?? '';

  if (!isSupabaseConfigured()) {
    console.warn(
      '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
        'Copia .env.example a .env y rellena tus credenciales.',
    );
    client = createClient('https://placeholder.local', 'placeholder-key', {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { reconnectAfterMs: () => REALTIME_STOP_DELAY_MS },
    });
    return client;
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      timeout: 8_000,
      heartbeatIntervalMs: 30_000,
      reconnectAfterMs,
    },
  });
  return client;
}

/** Cliente Supabase (solo operativo si `isSupabaseConfigured()` es true). */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const value = getSupabaseClient()[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(getSupabaseClient()) : value;
  },
});

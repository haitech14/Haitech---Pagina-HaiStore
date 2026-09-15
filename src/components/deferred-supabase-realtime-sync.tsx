import { useEffect, useState } from 'react';

import { SupabaseRealtimeSync } from '@/components/supabase-realtime-sync';
import { isSupabaseRealtimeEnabled } from '@/lib/supabase-config';
import { isSupabaseRealtimeStopped } from '@/lib/supabase';

/** Monta Realtime tras idle para no competir con la carga inicial. */
export function DeferredSupabaseRealtimeSync() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isSupabaseRealtimeEnabled() || isSupabaseRealtimeStopped()) return;

    const enable = () => {
      if (isSupabaseRealtimeStopped()) return;
      setEnabled(true);
    };
    const idleCallback = window.requestIdleCallback?.bind(window);
    const idleId = idleCallback ? idleCallback(enable, { timeout: 4000 }) : null;
    const timeoutId = window.setTimeout(enable, 4000);

    return () => {
      if (idleId != null && window.cancelIdleCallback) {
        window.cancelIdleCallback(idleId);
      }
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!enabled) return null;
  return <SupabaseRealtimeSync />;
}

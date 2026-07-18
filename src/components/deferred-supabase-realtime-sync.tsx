import { lazy, Suspense, useEffect, useState } from 'react';

import { isSupabaseConfigured } from '@/lib/supabase-config';

const SupabaseRealtimeSync = lazy(() =>
  import('@/components/supabase-realtime-sync').then((m) => ({
    default: m.SupabaseRealtimeSync,
  })),
);

/** Monta Realtime tras idle para no competir con la carga inicial ni con supabase-js. */
export function DeferredSupabaseRealtimeSync() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const enable = () => setEnabled(true);
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
  return (
    <Suspense fallback={null}>
      <SupabaseRealtimeSync />
    </Suspense>
  );
}

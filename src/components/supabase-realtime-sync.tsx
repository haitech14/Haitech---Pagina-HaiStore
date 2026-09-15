import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { isSupabaseRealtimeEnabled } from '@/lib/supabase-config';
import {
  isSupabaseRealtimeStopped,
  stopSupabaseRealtime,
  supabase,
} from '@/lib/supabase';

const TABLE_QUERY_KEYS: Record<string, string[][]> = {
  products: [['products'], ['product']],
  store_customers: [['admin-store-customers']],
  store_proformas: [['admin-proformas']],
  store_rental_plans: [['rental-plans']],
  store_rental_requests: [['rental-requests']],
  store_service_requests: [['service-requests']],
  store_service_categories: [['service-categories']],
  store_service_catalog: [['service-catalog']],
  store_orders: [['admin-orders'], ['admin-orders-list'], ['admin-orders-recent'], ['admin-dashboard']],
};

/**
 * Invalida caché de React Query cuando Supabase Realtime detecta cambios
 * (HaiStore ↔ HaiSupport comparten la misma BD).
 */
export function SupabaseRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSupabaseRealtimeEnabled() || isSupabaseRealtimeStopped()) return;

    const channel = supabase
      .channel('haistore-postgres-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          const table = payload.table;
          for (const queryKey of TABLE_QUERY_KEYS[table] ?? []) {
            void queryClient.invalidateQueries({
              queryKey,
              refetchType: 'active',
            });
          }
        },
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          stopSupabaseRealtime();
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return null;
}

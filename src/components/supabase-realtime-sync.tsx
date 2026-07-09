import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { isSupabaseConfigured } from '@/lib/supabase-config';
import { supabase } from '@/lib/supabase';

const TABLE_QUERY_KEYS: Record<string, string[][]> = {
  products: [['products'], ['admin-inventory'], ['product']],
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
    if (!isSupabaseConfigured()) return;

    const tables = Object.keys(TABLE_QUERY_KEYS);
    const channels = tables.map((table) => {
      const channel = supabase
        .channel(`haistore-realtime-${table}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table },
          () => {
            for (const queryKey of TABLE_QUERY_KEYS[table] ?? []) {
              void queryClient.invalidateQueries({
                queryKey,
                refetchType: 'active',
              });
            }
          },
        )
        .subscribe();

      return channel;
    });

    return () => {
      for (const channel of channels) {
        void supabase.removeChannel(channel);
      }
    };
  }, [queryClient]);

  return null;
}

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  invalidateProductQueries,
  PRODUCT_UPDATED_CHANNEL,
} from '@/lib/invalidate-product-queries';

/**
 * Sincroniza caché de productos entre pestañas (admin ↔ ficha pública) vía BroadcastChannel.
 */
export function ProductQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(PRODUCT_UPDATED_CHANNEL);
    channel.onmessage = (event: MessageEvent<{ productId?: string }>) => {
      const productId = event.data?.productId;
      void invalidateProductQueries(queryClient, productId ? { productId } : undefined);
    };

    return () => {
      channel.close();
    };
  }, [queryClient]);

  return null;
}

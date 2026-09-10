import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { patchCatalogIndexProduct } from '@/lib/catalog-featured';
import {
  invalidateProductQueries,
  PRODUCT_UPDATED_CHANNEL,
  type ProductUpdatedBroadcast,
} from '@/lib/invalidate-product-queries';

/**
 * Sincroniza caché de productos entre pestañas (admin ↔ ficha pública) vía BroadcastChannel.
 */
export function ProductQuerySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel(PRODUCT_UPDATED_CHANNEL);
    channel.onmessage = (event: MessageEvent<ProductUpdatedBroadcast>) => {
      const productId = event.data?.productId;
      const inventoryProduct = event.data?.inventoryProduct;
      if (inventoryProduct?.id) {
        patchCatalogIndexProduct(inventoryProduct);
      }
      void invalidateProductQueries(
        queryClient,
        inventoryProduct
          ? { productId: inventoryProduct.id, inventoryProduct }
          : productId
            ? { productId }
            : undefined,
      );
    };

    return () => {
      channel.close();
    };
  }, [queryClient]);

  return null;
}

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { fetchProductById } from '@/hooks/use-product';
import {
  buildInventoryVariantOptions,
  collectLinkedVariantProductIds,
} from '@/lib/product-inventory-variants';
import type { Product } from '@/types/product';

export function useProductInventoryVariants(product: Product | undefined) {
  const linkedIds = useMemo(
    () => (product ? collectLinkedVariantProductIds(product) : []),
    [product],
  );

  const siblingIds = useMemo(
    () => linkedIds.filter((id) => id !== product?.id),
    [linkedIds, product?.id],
  );

  const queries = useQueries({
    queries: siblingIds.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => fetchProductById(id),
      enabled: Boolean(product && siblingIds.length > 0),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const linkedProducts = useMemo(() => {
    if (!product) return [];
    const siblings = queries
      .map((query) => query.data)
      .filter((row): row is Product => Boolean(row));
    return buildInventoryVariantOptions(product, siblings);
  }, [product, queries]);

  const isLoading = queries.some((query) => query.isLoading);

  return {
    options: linkedProducts,
    hasVariants: linkedProducts.length > 1,
    isLoading,
  };
}

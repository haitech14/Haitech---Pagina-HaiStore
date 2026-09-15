import { useMemo } from 'react';

import { useProductsByIds } from '@/hooks/use-products-by-ids';
import {
  buildInventoryVariantOptions,
  collectLinkedVariantProductIds,
  type ProductInventoryVariantOption,
} from '@/lib/product-inventory-variants';
import type { Product } from '@/types/product';

export function useProductInventoryVariants(product: Product): {
  options: ProductInventoryVariantOption[];
} {
  const linkedIds = useMemo(
    () => collectLinkedVariantProductIds(product).filter((id) => id !== product.id),
    [product],
  );
  const { data: linked = [] } = useProductsByIds(linkedIds, linkedIds.length > 0);

  const options = useMemo(
    () => buildInventoryVariantOptions(product, linked),
    [linked, product],
  );

  return { options };
}

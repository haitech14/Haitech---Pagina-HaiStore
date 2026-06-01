import { useMemo } from 'react';

import { useAdminInventory } from '@/hooks/use-products';
import { buildSupplierNameCatalog } from '@/lib/inventory-supplier-catalog';

export function useSupplierCatalog(): string[] {
  const { data: products } = useAdminInventory();

  return useMemo(() => buildSupplierNameCatalog(products ?? []), [products]);
}

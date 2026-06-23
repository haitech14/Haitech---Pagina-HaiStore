import type { QueryClient } from '@tanstack/react-query';

import type { Product } from '@/types/product';

function isProduct(value: unknown): value is Product {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as Product).id === 'string' &&
    'name' in value
  );
}

function findInProductList(list: Product[] | undefined, id: string): Product | undefined {
  return list?.find((product) => product.id === id);
}

/** Busca un producto ya cargado en caché de React Query (listado, búsqueda o ficha). */
export function findProductInQueryCache(queryClient: QueryClient, id: string): Product | undefined {
  for (const [, data] of queryClient.getQueriesData<Product | null>({ queryKey: ['product'] })) {
    if (isProduct(data) && data.id === id) return data;
  }

  for (const [, data] of queryClient.getQueriesData<Product[]>({ queryKey: ['products'] })) {
    const found = findInProductList(data, id);
    if (found) return found;
  }

  for (const prefix of ['product-search', 'catalog-search'] as const) {
    for (const [, data] of queryClient.getQueriesData<{ products: Product[] }>({
      queryKey: [prefix],
    })) {
      const found = findInProductList(data?.products, id);
      if (found) return found;
    }
  }

  for (const [, data] of queryClient.getQueriesData<{ products: Product[] }>({
    queryKey: ['products-by-ids'],
  })) {
    const found = findInProductList(data?.products, id);
    if (found) return found;
  }

  return undefined;
}

export function seedProductQueryCache(
  queryClient: QueryClient,
  product: Product,
  role: string,
  viewAsRoles: readonly string[],
): void {
  queryClient.setQueryData(['product', product.id, role, [...viewAsRoles].sort().join(',')], product);
}

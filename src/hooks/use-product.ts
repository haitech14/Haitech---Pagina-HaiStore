import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { featuredToProduct, getFeaturedProductById } from '@/data/featured-products';
import { useProducts } from '@/hooks/use-products';
import { apiFetch } from '@/lib/api';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { toPublicProduct } from '@/lib/pricing';
import { applyViewAsPriceToProduct } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

async function fetchProductById(id: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export function useProduct(id: string | undefined) {
  const { role, viewAsRole, effectiveRole } = useAuth();
  const featured = id ? getFeaturedProductById(id) : undefined;
  const { data: products, isError: catalogError } = useProducts();

  const fromList = useMemo(
    () => (id ? products?.find((product) => product.id === id) : undefined),
    [id, products],
  );

  const shouldFetchOne = Boolean(id && !featured && !fromList);

  const { data: fetchedProduct, isLoading: fetchingOne } = useQuery({
    queryKey: ['product', id, role, viewAsRole],
    queryFn: () => (id ? fetchProductById(id) : Promise.resolve(null)),
    enabled: shouldFetchOne,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    select: (product) =>
      product && viewAsRole ? applyViewAsPriceToProduct(product, effectiveRole) : product,
  });

  const fromCatalogJson = useMemo(() => {
    if (!id || featured || fromList || fetchedProduct) return undefined;
    if (!catalogError) return undefined;
    const row = getCatalogProductById(id);
    if (!row) return undefined;
    return viewAsRole
      ? applyViewAsPriceToProduct(toPublicProduct(normalizeInventoryProduct(row), effectiveRole), effectiveRole)
      : toPublicProduct(normalizeInventoryProduct(row), role);
  }, [id, featured, fromList, fetchedProduct, catalogError, role, viewAsRole, effectiveRole]);

  const product: Product | undefined =
    fromList ??
    fetchedProduct ??
    (featured ? featuredToProduct(featured) : undefined) ??
    fromCatalogJson;

  const isLoading = Boolean(id && !featured && !product && shouldFetchOne && fetchingOne);
  const notFound = Boolean(id && !featured && !isLoading && !product);

  return {
    product,
    featuredMeta: featured,
    isLoading,
    notFound,
  };
}

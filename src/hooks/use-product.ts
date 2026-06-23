import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { featuredToProduct, getFeaturedProductById } from '@/data/featured-products';
import { useProducts } from '@/hooks/use-products';
import { apiFetch } from '@/lib/api';
import { getCatalogProductById } from '@/lib/catalog-featured';
import { findProductInQueryCache } from '@/lib/find-cached-product';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { toPublicProduct } from '@/lib/pricing';
import { applyViewAsPriceToProduct, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export function useProduct(id: string | undefined) {
  const queryClient = useQueryClient();
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const featured = id ? getFeaturedProductById(id) : undefined;

  /** Solo reutiliza el listado si ya está en caché; no dispara /api/products en la ficha. */
  const { data: products, isError: catalogError } = useProducts({ enabled: false });

  const fromList = useMemo(
    () => (id ? products?.find((product) => product.id === id) : undefined),
    [id, products],
  );

  const fromQueryCache = useMemo(
    () => (id ? findProductInQueryCache(queryClient, id) : undefined),
    [queryClient, id, fromList],
  );

  const shouldFetchOne = Boolean(id);

  const { data: fetchedProduct, isFetching: fetchingOne } = useQuery({
    queryKey: ['product', id, role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () => (id ? fetchProductById(id) : Promise.resolve(null)),
    enabled: shouldFetchOne,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    select: (product) =>
      product && shouldApplyViewAsPriceTransform(viewAsRoles)
        ? applyViewAsPriceToProduct(product, effectiveRole)
        : product,
  });

  const fromCatalogJson = useMemo(() => {
    if (!id || featured || fetchedProduct) return undefined;
    if (!catalogError) return undefined;
    const row = getCatalogProductById(id);
    if (!row) return undefined;
    const base = toPublicProduct(normalizeInventoryProduct(row), role);
    return shouldApplyViewAsPriceTransform(viewAsRoles)
      ? applyViewAsPriceToProduct(base, effectiveRole)
      : base;
  }, [id, featured, fetchedProduct, catalogError, role, viewAsRoles, effectiveRole]);

  const applyViewAs = (candidate: Product | undefined): Product | undefined => {
    if (!candidate) return undefined;
    return shouldApplyViewAsPriceTransform(viewAsRoles)
      ? applyViewAsPriceToProduct(candidate, effectiveRole)
      : candidate;
  };

  const product: Product | undefined =
    fetchedProduct ??
    applyViewAs(fromList) ??
    applyViewAs(fromQueryCache) ??
    (featured ? featuredToProduct(featured) : undefined) ??
    fromCatalogJson;

  const isLoading = Boolean(id && !product && fetchingOne);
  const notFound = Boolean(id && !featured && !isLoading && !product);

  return {
    product,
    featuredMeta: featured,
    isLoading,
    notFound,
  };
}

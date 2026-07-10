import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import {
  featuredToProduct,
  getFeaturedDisplayMeta,
  getFeaturedProductById,
} from '@/data/featured-products';
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
    // Bypass HTTP cache so admin saves are visible without a hard refresh.
    return await apiFetch<Product>(`/api/products/${encodeURIComponent(id)}`, {
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

export function useProduct(id: string | undefined) {
  const queryClient = useQueryClient();
  const { role, viewAsRoles, effectiveRole } = useAuth();
  const catalogProductId = id ? getCatalogProductById(id)?.id : undefined;
  const featuredFallback = id
    ? getFeaturedProductById(id) ??
      (catalogProductId ? getFeaturedProductById(catalogProductId) : undefined)
    : undefined;
  const featuredMeta = id
    ? getFeaturedDisplayMeta(id) ??
      (catalogProductId ? getFeaturedDisplayMeta(catalogProductId) : undefined)
    : undefined;

  /** Solo reutiliza el listado si ya está en caché; no dispara /api/products en la ficha. */
  const { data: products } = useProducts({ enabled: false });

  const fromList = useMemo(
    () =>
      id
        ? products?.find(
            (product) =>
              product.id === id ||
              product.slug === id ||
              (product.slug == null && product.id.toLowerCase() === id.toLowerCase()),
          )
        : undefined,
    [id, products],
  );

  const fromQueryCache = useMemo(
    () => (id ? findProductInQueryCache(queryClient, id) : undefined),
    [queryClient, id, fromList],
  );

  const shouldFetchOne = Boolean(id);

  const { data: fetchedProduct, isFetching: fetchingOne, isFetched } = useQuery({
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
    if (!id || featuredFallback || fetchedProduct || !isFetched) return undefined;
    const row = getCatalogProductById(id);
    if (!row) return undefined;
    const base = toPublicProduct(normalizeInventoryProduct(row), role);
    return shouldApplyViewAsPriceTransform(viewAsRoles)
      ? applyViewAsPriceToProduct(base, effectiveRole)
      : base;
  }, [id, featuredFallback, fetchedProduct, isFetched, role, viewAsRoles, effectiveRole]);

  const applyViewAs = (candidate: Product | undefined): Product | undefined => {
    if (!candidate) return undefined;
    return shouldApplyViewAsPriceTransform(viewAsRoles)
      ? applyViewAsPriceToProduct(candidate, effectiveRole)
      : candidate;
  };

  const staticFallbackProduct =
    isFetched && !fetchingOne
      ? featuredFallback
        ? featuredToProduct(featuredFallback)
        : fromCatalogJson
      : undefined;

  const product: Product | undefined =
    fetchedProduct ??
    applyViewAs(fromList) ??
    applyViewAs(fromQueryCache) ??
    staticFallbackProduct;

  const isLoading = Boolean(id && !product && (fetchingOne || !isFetched));
  const notFound = Boolean(
    id && !featuredFallback && isFetched && !fetchingOne && !product,
  );

  return {
    product,
    featuredMeta,
    isLoading,
    notFound,
  };
}

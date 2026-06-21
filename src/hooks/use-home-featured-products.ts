import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/context/auth-context';
import { apiFetch } from '@/lib/api';
import { applyViewAsPriceToProducts } from '@/lib/view-as-role';
import type { Product } from '@/types/product';

export const HOME_FEATURED_QUERY_KEY = 'home-featured-products';

async function fetchHomeFeaturedProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/api/products/home-featured?limit=6&category=multifuncionales');
}

export function useHomeFeaturedProducts() {
  const { role, viewAsRole, effectiveRole } = useAuth();

  return useQuery({
    queryKey: [HOME_FEATURED_QUERY_KEY, role, viewAsRole],
    queryFn: fetchHomeFeaturedProducts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    select: (products) =>
      viewAsRole ? applyViewAsPriceToProducts(products, effectiveRole) : products,
  });
}

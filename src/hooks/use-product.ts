import { useMemo } from 'react';

import {
  featuredToProduct,
  getFeaturedProductById,
  type FeaturedProduct,
} from '@/data/featured-products';
import { useProducts } from '@/hooks/use-products';
import type { Product } from '@/types/product';

export function useProduct(id: string | undefined) {
  const featured = id ? getFeaturedProductById(id) : undefined;
  const { data: products, isLoading: catalogLoading } = useProducts();

  const fromCatalog = useMemo(
    () => (id ? products?.find((product) => product.id === id) : undefined),
    [id, products],
  );

  const product: Product | undefined = fromCatalog ?? (featured ? featuredToProduct(featured) : undefined);
  const isLoading = Boolean(id && !featured && catalogLoading);
  const notFound = Boolean(id && !isLoading && !product);

  return {
    product,
    featuredMeta: featured as FeaturedProduct | undefined,
    isLoading,
    notFound,
  };
}

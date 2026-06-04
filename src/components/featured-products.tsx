import { useMemo } from 'react';

import { FeaturedProductsSection } from '@/components/featured-products-section';
import { useProducts } from '@/hooks/use-products';
import {
  MIN_HOME_FEATURED,
  resolveHomeFeaturedProducts,
} from '@/lib/home-featured-products';

export function FeaturedProducts() {
  const { data: storeProducts } = useProducts();
  const products = useMemo(
    () => resolveHomeFeaturedProducts(storeProducts),
    [storeProducts],
  );

  if (products.length < MIN_HOME_FEATURED) {
    return null;
  }

  return <FeaturedProductsSection products={products} />;
}

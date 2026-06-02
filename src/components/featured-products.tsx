import { useMemo } from 'react';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import {
  FEATURED_PRODUCT_IDS,
  featuredProducts,
  type FeaturedProduct,
} from '@/data/featured-products';
import { useProducts } from '@/hooks/use-products';
import {
  FEATURED_CAROUSEL_LIMIT,
  resolveStoreFeaturedProducts,
  shuffleProducts,
} from '@/lib/store-products';

function useFeaturedFromStore(): FeaturedProduct[] {
  const { data: storeProducts } = useProducts();

  return useMemo(() => {
    if (!storeProducts?.length) {
      return shuffleProducts(featuredProducts).slice(0, FEATURED_CAROUSEL_LIMIT);
    }

    const resolved = resolveStoreFeaturedProducts(storeProducts, FEATURED_PRODUCT_IDS);
    if (resolved.length > 0) return resolved;

    return shuffleProducts(featuredProducts).slice(0, FEATURED_CAROUSEL_LIMIT);
  }, [storeProducts]);
}

export function FeaturedProducts() {
  const products = useFeaturedFromStore();

  if (products.length === 0) {
    return null;
  }

  return (
    <ProductCarouselSection
      sectionId="productos-destacados"
      title="Productos destacados"
      subtitle="Descubre nuestros productos más populares con ofertas exclusivas"
      products={products}
      viewAllHref="/tienda"
      viewAllLabel="Ver todos los productos"
    />
  );
}

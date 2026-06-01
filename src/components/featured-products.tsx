import { useMemo } from 'react';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import {
  FEATURED_PRODUCT_IDS,
  featuredProducts as catalogFeaturedFallback,
  type FeaturedProduct,
} from '@/data/featured-products';
import { useProducts } from '@/hooks/use-products';
import { pickFeaturedByIds, productToFeatured } from '@/lib/store-products';

function useFeaturedFromStore(): FeaturedProduct[] {
  const { data: storeProducts } = useProducts();

  return useMemo(() => {
    if (storeProducts) {
      const ordered = pickFeaturedByIds(storeProducts, FEATURED_PRODUCT_IDS);
      if (ordered.length > 0) return ordered;
      return storeProducts.slice(0, 8).map(productToFeatured);
    }
    return catalogFeaturedFallback;
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

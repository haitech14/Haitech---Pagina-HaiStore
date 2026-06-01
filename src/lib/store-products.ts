import type { FeaturedProduct } from '@/data/featured-products';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { compareProductsBySortOrder } from '@/lib/inventory-product-order';
import type { Product } from '@/types/product';

export function productToFeatured(product: Product): FeaturedProduct {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    ...(product.attributes?.length ? { attributes: product.attributes } : {}),
    price: product.price,
    image: product.image_url ?? '',
    rating: 5,
    reviews: 0,
  };
}

export function filterStoreProductsByCategories(
  products: Product[],
  categoryLabels: readonly string[],
  limit = 10,
): FeaturedProduct[] {
  return [...products]
    .filter((product) =>
      categoryLabels.some((label) => productMatchesCategoryFilter(product, label)),
    )
    .sort(compareProductsBySortOrder)
    .slice(0, limit)
    .map(productToFeatured);
}

export function pickFeaturedByIds(
  products: Product[],
  orderedIds: readonly string[],
): FeaturedProduct[] {
  const byId = new Map(products.map((product) => [product.id, product]));
  return orderedIds
    .map((id) => byId.get(id))
    .filter((product): product is Product => product != null)
    .map(productToFeatured);
}

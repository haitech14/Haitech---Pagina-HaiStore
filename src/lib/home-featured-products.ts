import { FEATURED_PRODUCT_IDS } from '@/data/featured-products';
import type { FeaturedProduct } from '@/data/featured-products';
import { shuffleProductsDaily } from '@/lib/daily-shuffle';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { productToFeatured } from '@/lib/store-products';
import type { Product } from '@/types/product';

/** Múltiplo de 5 para páginas completas en el carrusel (cada bullet = 5 productos). */
export const HOME_FEATURED_LIMIT = 15;
export const MIN_HOME_FEATURED = 3;

/**
 * Productos destacados del inicio: solo inventario en vivo con stock,
 * prioriza `is_featured` e ids configurados, rellena con orden aleatorio diario.
 */
export function resolveHomeFeaturedProducts(
  storeProducts: Product[] | undefined,
  limit = HOME_FEATURED_LIMIT,
): FeaturedProduct[] {
  if (!storeProducts?.length) return [];

  const inStock = storeProducts.filter((product) => product.stock > 0 && product.price > 0);
  if (inStock.length < MIN_HOME_FEATURED) return [];

  const byId = new Map(inStock.map((product) => [product.id, product]));
  const selectedIds = new Set<string>();
  const pool: Product[] = [];

  const add = (product: Product | undefined) => {
    if (!product || selectedIds.has(product.id)) return;
    selectedIds.add(product.id);
    pool.push(product);
  };

  for (const product of inStock) {
    if (product.is_featured === true) add(product);
  }

  for (const id of FEATURED_PRODUCT_IDS) {
    add(byId.get(id));
  }

  const remaining = shuffleProductsDaily(inStock.filter((product) => !selectedIds.has(product.id)));
  for (const product of remaining) {
    if (pool.length >= limit) break;
    add(product);
  }

  return shuffleProductsDaily(pool)
    .slice(0, limit)
    .map((product) => enrichFeaturedFromCatalog(productToFeatured(product)));
}

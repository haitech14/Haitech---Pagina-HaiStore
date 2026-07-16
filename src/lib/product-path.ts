import { buildProductPath, deriveProductSlug } from '@/lib/product-slug';
import type { Product } from '@/types/product';

/** Ruta canónica de ficha de producto en la tienda (slug legible cuando está disponible). */
export function productPath(idOrProduct: string | Pick<Product, 'id' | 'name' | 'slug'>): string {
  if (typeof idOrProduct === 'string') {
    return `/tienda/${encodeURIComponent(idOrProduct)}`;
  }
  return buildProductPath(idOrProduct);
}

export function productCanonicalSlug(
  product: Pick<Product, 'id' | 'name' | 'slug'>,
): string {
  return deriveProductSlug(product);
}

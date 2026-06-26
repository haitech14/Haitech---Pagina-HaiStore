import type { Product } from '@/types/product';

/** Producto multifuncional en carrito (categoría o nombre). */
export function isMultifuncionalCartProduct(product: Pick<Product, 'name' | 'category'>): boolean {
  const category = String(product.category ?? '').toLowerCase();
  const name = String(product.name ?? '').toLowerCase();
  return category.includes('multifuncional') || /\bmultifuncional\b/i.test(name);
}

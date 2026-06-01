import type { FeaturedProduct } from '@/data/featured-products';
import type { Product, ProductAttribute } from '@/types/product';

export const MAX_COMPARE_PRODUCTS = 4;

export interface CompareProductItem {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  price: number;
  image: string | null;
  attributes: ProductAttribute[];
}

export function featuredToCompareItem(product: FeaturedProduct): CompareProductItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    price: product.price,
    image: product.image || null,
    attributes: product.attributes ?? [],
  };
}

export function productToCompareItem(product: Product): CompareProductItem {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    price: product.price,
    image: product.image_url,
    attributes: product.attributes ?? [],
  };
}

function normalizeAttributeKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

/** Una fila por nombre de atributo (los IDs suelen ser distintos en cada producto). */
export function collectCompareAttributeRows(
  items: CompareProductItem[],
): { key: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const item of items) {
    for (const attr of item.attributes) {
      const label = attr.name?.trim();
      if (!label) continue;
      const key = normalizeAttributeKey(label);
      if (!seen.has(key)) seen.set(key, label);
    }
  }
  return [...seen.entries()].map(([key, label]) => ({ key, label }));
}

export function attributeValueForProduct(
  product: CompareProductItem,
  attributeKey: string,
): string {
  const match = product.attributes.find(
    (attr) => normalizeAttributeKey(attr.name) === attributeKey,
  );
  const value = match?.value?.trim();
  return value ? value : '—';
}

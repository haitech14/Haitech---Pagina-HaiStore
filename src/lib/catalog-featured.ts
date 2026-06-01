import catalogData from '@/data/inventory-catalog.json';
import { productCategoryTags } from '@/lib/inventory-categories';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import type { FeaturedProduct } from '@/data/featured-products';
import type { InventoryProduct } from '@/types/product';

export type CatalogRow = InventoryProduct & {
  compare_at_price_usd?: number;
  is_new?: boolean;
};

export function normalizeCategoryName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

export function productMatchesCategories(
  category: string | null | undefined,
  labels: readonly string[],
): boolean {
  const normalizedLabels = labels.map((label) => normalizeCategoryName(label));
  const tags = productCategoryTags({ category });
  if (tags.length === 0) {
    const norm = normalizeCategoryName(category ?? '');
    return normalizedLabels.includes(norm);
  }
  return tags.some((tag) => normalizedLabels.includes(normalizeCategoryName(tag)));
}

function stableReviewCount(id: string): number {
  let hash = 0;
  for (const char of id) {
    hash = (hash + char.charCodeAt(0)) % 200;
  }
  return 24 + hash;
}

export function catalogRowToFeatured(
  row: CatalogRow,
  meta?: Pick<FeaturedProduct, 'rating' | 'reviews' | 'isNew'>,
): FeaturedProduct {
  const product = normalizeInventoryProduct(row);
  const publicPrice = product.prices.public;
  const compareAt = row.compare_at_price_usd;
  const discount =
    compareAt != null && compareAt > publicPrice
      ? Math.round((1 - publicPrice / compareAt) * 100)
      : undefined;

  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    ...(product.attributes?.length ? { attributes: product.attributes } : {}),
    price: publicPrice,
    oldPrice: compareAt,
    discount,
    isNew: meta?.isNew ?? row.is_new ?? false,
    rating: meta?.rating ?? 5,
    reviews: meta?.reviews ?? stableReviewCount(product.id),
    image: product.image_url ?? '',
  };
}

export function getCatalogFeaturedByCategories(
  categoryLabels: readonly string[],
  limit = 10,
): FeaturedProduct[] {
  return (catalogData.products as CatalogRow[])
    .filter((row) => productMatchesCategories(row.category, categoryLabels))
    .slice(0, limit)
    .map((row) => catalogRowToFeatured(row));
}

export function getCatalogProductById(id: string): CatalogRow | undefined {
  return (catalogData.products as CatalogRow[]).find((row) => row.id === id);
}

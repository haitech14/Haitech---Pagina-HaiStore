import catalogData from '@/data/inventory-catalog.json';
import { productCategoryTags } from '@/lib/inventory-categories';
import { normalizeInventoryProduct } from '@/lib/inventory-product';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { findProductBySlugOrId } from '@/lib/product-slug';
import type { FeaturedProduct } from '@/data/featured-products';
import type { InventoryProduct } from '@/types/product';

export type CatalogRow = InventoryProduct & {
  compare_at_price_usd?: number;
  is_new?: boolean;
};

type CatalogJsonRow = Partial<InventoryProduct> &
  Pick<InventoryProduct, 'id' | 'name' | 'prices'> & {
    compare_at_price_usd?: number;
    is_new?: boolean;
  };

/** Filas del JSON maestro normalizadas (incluye sort_order por defecto). */
export function getCatalogRows(): CatalogRow[] {
  return (catalogData.products as unknown as CatalogJsonRow[]).map((raw) => {
    const product = normalizeInventoryProduct(raw);
    const row: CatalogRow = { ...product };
    if (raw.compare_at_price_usd != null) {
      row.compare_at_price_usd = raw.compare_at_price_usd;
    }
    if (raw.is_new != null) {
      row.is_new = raw.is_new;
    }
    return row;
  });
}

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
  const tags = productCategoryTags({ category: category ?? null });
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

  const featured: FeaturedProduct = {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    code: product.code?.trim() || null,
    price: publicPrice,
    isNew: meta?.isNew ?? row.is_new ?? false,
    rating: meta?.rating ?? 5,
    reviews: meta?.reviews ?? stableReviewCount(product.id),
    image: resolveProductImageUrl(product),
  };

  if (product.attributes?.length) {
    featured.attributes = product.attributes;
  }
  if (compareAt != null && compareAt > publicPrice) {
    featured.oldPrice = compareAt;
    if (discount != null) {
      featured.discount = discount;
    }
  }

  return featured;
}

export function getCatalogFeaturedByCategories(
  categoryLabels: readonly string[],
  limit = 10,
): FeaturedProduct[] {
  return getCatalogRows()
    .filter((row) => productMatchesCategories(row.category, categoryLabels))
    .slice(0, limit)
    .map((row) => catalogRowToFeatured(row));
}

export function getCatalogProductById(id: string): CatalogRow | undefined {
  const rows = getCatalogRows();
  const match = findProductBySlugOrId(rows, id);
  return match as CatalogRow | undefined;
}

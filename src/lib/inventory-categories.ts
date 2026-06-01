import { categories } from '@/data/categories';
import { normalizeCategoryName } from '@/lib/catalog-featured';
import { parseInventoryTagList } from '@/lib/inventory-tags';
import type { InventoryProduct } from '@/types/product';

export function buildInventoryCategoryOptions(products: InventoryProduct[]): string[] {
  const names = new Set<string>();
  for (const category of categories) {
    names.add(category.name);
  }
  for (const product of products) {
    if (product.category?.trim()) {
      names.add(product.category.trim());
    }
  }
  return [...names].sort((a, b) => a.localeCompare(b, 'es'));
}

export function productCategoryTags(product: { category?: string | null }): string[] {
  const tags = parseInventoryTagList(product.category ?? undefined);
  if (tags.length > 0) return tags;
  const raw = product.category?.trim();
  return raw ? [raw] : [];
}

export function productMatchesCategoryFilter(
  product: { category?: string | null },
  filterValue: string,
): boolean {
  if (filterValue === 'all') return true;
  const target = normalizeCategoryName(filterValue);
  return productCategoryTags(product).some((tag) => normalizeCategoryName(tag) === target);
}

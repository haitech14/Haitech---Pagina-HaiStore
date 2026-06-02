import { categories, type Category } from '@/data/categories';
import { collectInventoryLabels } from '@/lib/store-category-display';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export function getCategoryProductLabels(category: Category): readonly string[] {
  if (category.inventoryCategories?.length) {
    return category.inventoryCategories;
  }
  return [category.name];
}

export function findCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function findStoreSubcategoryBySlug(
  node: StoreCategoryTreeNode | undefined,
  subSlug: string,
): StoreCategoryTreeNode | undefined {
  if (!node) return undefined;
  for (const child of node.children ?? []) {
    if (child.slug === subSlug) return child;
    const nested = findStoreSubcategoryBySlug(child, subSlug);
    if (nested) return nested;
  }
  return undefined;
}

/** Etiquetas de inventario para filtrar productos en `/categoria/:slug` (estáticas + árbol de tienda). */
export function resolveCategoryPageProductLabels(
  category: Category,
  storeCategory: StoreCategoryTreeNode | undefined,
  subSlug: string | null,
): string[] {
  const staticLabels = [...getCategoryProductLabels(category)];

  if (storeCategory && subSlug) {
    const sub = findStoreSubcategoryBySlug(storeCategory, subSlug);
    if (sub) {
      return sub.inventoryLabels?.length ? [...sub.inventoryLabels] : [sub.name];
    }
  }

  const treeLabels = storeCategory ? collectInventoryLabels(storeCategory) : [];
  const merged = [...new Set([...staticLabels, ...treeLabels])];
  return merged.length > 0 ? merged : staticLabels;
}

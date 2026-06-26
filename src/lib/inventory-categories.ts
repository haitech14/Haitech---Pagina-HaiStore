import { categories } from '@/data/categories';
import { findCategoryBySlug, getCategoryProductLabels } from '@/lib/category-product-labels';
import { normalizeCategoryName } from '@/lib/catalog-featured';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import { nodeMatchesLabel } from '@/lib/inventory-product-category';
import { collectInventoryLabels } from '@/lib/store-category-display';
import { parseInventoryTagList } from '@/lib/inventory-tags';
import { flattenCategoryTree } from '@/lib/store-category-tree';
import type { InventoryProduct } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export function buildInventoryCategoryOptions(
  products: InventoryProduct[],
  tree: StoreCategoryTreeNode[] = [],
): string[] {
  if (tree.length > 0) {
    const extra = products
      .map((product) => product.category ?? '')
      .filter((label) => label.trim().length > 0);
    return buildCategorySelectOptions(tree, extra).map((option) => option.value);
  }

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

/** Etiquetas de inventario que aplican al filtro (incluye subcategorías del árbol). */
export function resolveCategoryFilterLabels(
  tree: StoreCategoryTreeNode[],
  filterValue: string,
): string[] {
  if (filterValue === 'all') return [];

  const trimmed = filterValue.trim();
  const flat = flattenCategoryTree(tree);
  const matches = flat.filter((node) => nodeMatchesLabel(node, trimmed));

  if (matches.length === 0) {
    const staticCategory = findCategoryBySlug(trimmed);
    if (staticCategory) {
      return [...getCategoryProductLabels(staticCategory)];
    }
    return [trimmed];
  }

  const match = matches.reduce((best, node) => (node.depth >= best.depth ? node : best));
  const node = findNodeInTree(tree, match.id);
  if (!node) return [trimmed];

  if ((node.children?.length ?? 0) > 0) {
    const treeLabels = collectInventoryLabels(node);
    const staticCategory = findCategoryBySlug(node.slug);
    if (staticCategory) {
      return [...new Set([...treeLabels, ...getCategoryProductLabels(staticCategory)])];
    }
    return treeLabels;
  }

  const labels = (node.inventoryLabels ?? []).map((label) => label.trim()).filter(Boolean);
  const treeLabels = labels.length > 0 ? labels : [trimmed];
  const staticCategory = findCategoryBySlug(node.slug);
  if (staticCategory) {
    return [...new Set([...treeLabels, ...getCategoryProductLabels(staticCategory)])];
  }
  return [...new Set(treeLabels)];
}

function findNodeInTree(
  nodes: StoreCategoryTreeNode[],
  id: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findNodeInTree(node.children ?? [], id);
    if (nested) return nested;
  }
  return undefined;
}

export function productMatchesCategoryFilterTree(
  product: { category?: string | null },
  filterValue: string,
  tree: StoreCategoryTreeNode[],
): boolean {
  if (filterValue === 'all') return true;
  const labels = resolveCategoryFilterLabels(tree, filterValue);
  const targets = new Set(labels.map((label) => normalizeCategoryName(label)));
  return productCategoryTags(product).some((tag) => targets.has(normalizeCategoryName(tag)));
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

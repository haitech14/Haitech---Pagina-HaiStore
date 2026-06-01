import { categories } from '@/data/categories';
import { categoryInventoryLabel } from '@/lib/inventory-product-category';
import { parseInventoryTagList } from '@/lib/inventory-tags';
import { flattenCategoryTree } from '@/lib/store-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export interface InventorySelectOption {
  value: string;
  label: string;
}

export function buildCategorySelectOptions(
  tree: StoreCategoryTreeNode[],
  extraLabels: string[] = [],
): InventorySelectOption[] {
  const seen = new Set<string>();
  const options: InventorySelectOption[] = [];

  const add = (value: string, label: string) => {
    const key = value.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push({ value: key, label });
  };

  for (const node of flattenCategoryTree(tree)) {
    const value = categoryInventoryLabel(node);
    const prefix = node.depth > 0 ? `${'— '.repeat(node.depth)}` : '';
    add(value, `${prefix}${value}`);
  }

  for (const category of categories) {
    add(category.name, category.name);
  }

  for (const label of extraLabels) {
    for (const part of parseInventoryTagList(label)) {
      add(part, part);
    }
  }

  return options.sort((a, b) => a.label.localeCompare(b.label, 'es'));
}

import { normalizeCategoryName } from '@/lib/catalog-featured';
import { flattenCategoryTree } from '@/lib/store-category-tree';
import type { StoreCategory, StoreCategoryTreeNode } from '@/types/store-category';

export interface ProductCategoryPlacement {
  raw: string;
  parent: StoreCategory | null;
  sub: StoreCategory | null;
}

function nodeMatchesLabel(node: StoreCategory, label: string): boolean {
  const normalized = normalizeCategoryName(label);
  if (!normalized) return false;
  if (normalizeCategoryName(node.name) === normalized) return true;
  return (node.inventoryLabels ?? []).some(
    (entry) => normalizeCategoryName(entry) === normalized,
  );
}

/** Etiqueta guardada en inventario para un nodo de categoría. */
export function categoryInventoryLabel(node: StoreCategory): string {
  const fromLabels = node.inventoryLabels?.find((entry) => entry.trim());
  return fromLabels?.trim() || node.name;
}

export function resolveProductCategoryPlacement(
  tree: StoreCategoryTreeNode[],
  categoryLabel: string | null | undefined,
): ProductCategoryPlacement {
  const raw = categoryLabel?.trim() ?? '';
  if (!raw || tree.length === 0) {
    return { raw, parent: null, sub: null };
  }

  const flat = flattenCategoryTree(tree);
  const match = flat.find((node) => nodeMatchesLabel(node, raw));

  if (!match) {
    return { raw, parent: null, sub: null };
  }

  if (match.parentId) {
    const parent = flat.find((node) => node.id === match.parentId) ?? null;
    return { raw, parent, sub: match };
  }

  return { raw, parent: match, sub: null };
}

export function listRootCategories(tree: StoreCategoryTreeNode[]): StoreCategory[] {
  return tree.map(({ children: _children, ...node }) => node);
}

function findCategoryNode(
  nodes: StoreCategoryTreeNode[],
  id: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    const nested = findCategoryNode(node.children ?? [], id);
    if (nested) return nested;
  }
  return undefined;
}

export function listSubcategories(
  tree: StoreCategoryTreeNode[],
  parentId: string | null,
): StoreCategory[] {
  if (!parentId) return [];
  const parent = findCategoryNode(tree, parentId);
  return parent?.children?.map(({ children: _c, ...node }) => node) ?? [];
}

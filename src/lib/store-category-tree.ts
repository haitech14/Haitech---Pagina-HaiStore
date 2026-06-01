import type { StoreCategory, StoreCategoryReorderItem, StoreCategoryTreeNode } from '@/types/store-category';

export interface FlatStoreCategory extends StoreCategory {
  depth: number;
}

export function flattenCategoryTree(
  nodes: StoreCategoryTreeNode[],
  depth = 0,
): FlatStoreCategory[] {
  const result: FlatStoreCategory[] = [];

  for (const node of nodes) {
    const { children, ...rest } = node;
    result.push({ ...rest, depth });
    if (children?.length) {
      result.push(...flattenCategoryTree(children, depth + 1));
    }
  }

  return result;
}

export function flatToReorderItems(flat: FlatStoreCategory[]): StoreCategoryReorderItem[] {
  const counters = new Map<string | null, number>();

  return flat.map((row) => {
    const sortOrder = counters.get(row.parentId) ?? 0;
    counters.set(row.parentId, sortOrder + 1);
    return { id: row.id, parentId: row.parentId, sortOrder };
  });
}

export function reorderFlatItems(
  flat: FlatStoreCategory[],
  draggedId: string,
  targetId: string,
): FlatStoreCategory[] {
  const fromIndex = flat.findIndex((row) => row.id === draggedId);
  const toIndex = flat.findIndex((row) => row.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return flat;

  const next = [...flat];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export function indentCategory(flat: FlatStoreCategory[], id: string): FlatStoreCategory[] {
  const index = flat.findIndex((row) => row.id === id);
  if (index <= 0) return flat;

  const previous = flat[index - 1];
  const next = [...flat];
  next[index] = {
    ...next[index],
    parentId: previous.id,
    depth: previous.depth + 1,
  };
  return next;
}

export function outdentCategory(flat: FlatStoreCategory[], id: string): FlatStoreCategory[] {
  const index = flat.findIndex((row) => row.id === id);
  const row = flat[index];
  if (!row?.parentId) return flat;

  const parent = flat.find((entry) => entry.id === row.parentId);
  const next = [...flat];
  next[index] = {
    ...next[index],
    parentId: parent?.parentId ?? null,
    depth: Math.max(0, row.depth - 1),
  };
  return next;
}

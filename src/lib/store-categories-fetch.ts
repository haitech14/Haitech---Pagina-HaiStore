import { apiFetch } from '@/lib/api';
import {
  buildStaticStoreCategoryTree,
  enrichStoreCategoryTree,
} from '@/lib/static-store-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export const STORE_CATEGORIES_QUERY_KEY = 'store-categories';
export const STORE_CATEGORIES_STATIC_URL = '/catalog/store-categories-tree.json';
const STORE_CATEGORIES_STORAGE_KEY = 'haistore_categories_tree_v1';

function readStoredStoreCategoriesTree(): StoreCategoryTreeNode[] | undefined {
  try {
    const raw = sessionStorage.getItem(STORE_CATEGORIES_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoreCategoryTreeNode[];
    return Array.isArray(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function storeCategoriesTree(tree: StoreCategoryTreeNode[]): void {
  try {
    sessionStorage.setItem(STORE_CATEGORIES_STORAGE_KEY, JSON.stringify(tree));
  } catch {
    /* quota / privado */
  }
}

async function fetchStaticStoreCategoriesTree(): Promise<StoreCategoryTreeNode[] | null> {
  try {
    const response = await fetch(STORE_CATEGORIES_STATIC_URL, {
      cache: 'default',
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const payload = (await response.json()) as StoreCategoryTreeNode[] | { tree?: StoreCategoryTreeNode[] };
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.tree)) return payload.tree;
    return null;
  } catch {
    return null;
  }
}

function finalizeStoreCategoryTree(tree: StoreCategoryTreeNode[]): StoreCategoryTreeNode[] {
  return enrichStoreCategoryTree(tree);
}

/**
 * Snapshot estático primero; revalida contra API en segundo plano.
 */
export async function fetchStoreCategoriesTreeWithFallback(): Promise<StoreCategoryTreeNode[]> {
  const staticTree = buildStaticStoreCategoryTree();
  const snapshot = await fetchStaticStoreCategoriesTree();

  if (snapshot?.length) {
    const tree = finalizeStoreCategoryTree(snapshot);
    storeCategoriesTree(tree);
    void apiFetch<StoreCategoryTreeNode[]>('/api/categories')
      .then((apiTree) => storeCategoriesTree(finalizeStoreCategoryTree(apiTree)))
      .catch(() => {
        /* mantener snapshot */
      });
    return tree;
  }

  try {
    const tree = finalizeStoreCategoryTree(await apiFetch<StoreCategoryTreeNode[]>('/api/categories'));
    storeCategoriesTree(tree);
    return tree;
  } catch {
    const cached = readStoredStoreCategoriesTree();
    if (cached?.length) return finalizeStoreCategoryTree(cached);

    return staticTree;
  }
}

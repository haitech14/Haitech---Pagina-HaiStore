import { apiFetch, apiFetchWithRetry } from '@/lib/api';
import {
  buildStaticStoreCategoryTree,
  enrichStoreCategoryTree,
  pruneRemovedCategorySlugs,
  removeCategoryFromTree,
} from '@/lib/static-store-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export const STORE_CATEGORIES_QUERY_KEY = 'store-categories';
export const STORE_CATEGORIES_STATIC_URL = '/catalog/store-categories-tree.json';
const STORE_CATEGORIES_STORAGE_KEY = 'haistore_categories_tree_v1';
const REMOVED_STATIC_SLUGS_STORAGE_KEY = 'haistore_removed_static_slugs_v1';

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

export function readRemovedStaticSlugs(): string[] {
  try {
    const raw = sessionStorage.getItem(REMOVED_STATIC_SLUGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function storeRemovedStaticSlugs(slugs: string[]): void {
  try {
    sessionStorage.setItem(REMOVED_STATIC_SLUGS_STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    /* quota / privado */
  }
}

export function rememberRemovedStaticSlug(slug: string): void {
  const next = [...new Set([...readRemovedStaticSlugs(), slug])];
  storeRemovedStaticSlugs(next);
}

export function patchCategoryTreeAfterDelete(input: {
  id: string;
  slug?: string;
}): StoreCategoryTreeNode[] | undefined {
  const removed = new Set(readRemovedStaticSlugs());
  if (input.slug) removed.add(input.slug);
  removed.add(input.id);
  const removedList = [...removed];
  storeRemovedStaticSlugs(removedList);

  const cached = readStoredStoreCategoriesTree();
  if (!cached?.length) return undefined;

  const next = pruneRemovedCategorySlugs(
    removeCategoryFromTree(cached, input.id, input.slug),
    removedList,
  );
  storeCategoriesTree(next);
  return next;
}

export function storeCategoriesTree(tree: StoreCategoryTreeNode[]): void {
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

function finalizeStoreCategoryTree(
  tree: StoreCategoryTreeNode[],
  removedStaticSlugs: readonly string[] = readRemovedStaticSlugs(),
): StoreCategoryTreeNode[] {
  return enrichStoreCategoryTree(tree, removedStaticSlugs);
}

async function fetchRemovedStaticSlugsLive(): Promise<string[]> {
  try {
    const data = await apiFetch<{ slugs?: string[] }>('/api/categories/removed-static-slugs', {
      cache: 'no-store',
    });
    const slugs = Array.isArray(data.slugs) ? data.slugs.map(String).filter(Boolean) : [];
    storeRemovedStaticSlugs(slugs);
    return slugs;
  } catch {
    return readRemovedStaticSlugs();
  }
}

/** Árbol en vivo desde la API (sin caché de navegador). */
export async function fetchStoreCategoriesTreeLive(): Promise<StoreCategoryTreeNode[]> {
  const [apiTree, removedStaticSlugs] = await Promise.all([
    apiFetchWithRetry<StoreCategoryTreeNode[]>('/api/categories', { cache: 'no-store' }),
    fetchRemovedStaticSlugsLive(),
  ]);
  const tree = finalizeStoreCategoryTree(apiTree, removedStaticSlugs);
  storeCategoriesTree(tree);
  return tree;
}

/**
 * Prefiere la API en vivo para que categorías creadas/editadas se vean de inmediato.
 * Solo cae a snapshot estático / sessionStorage / árbol embebido si la API falla.
 */
export async function fetchStoreCategoriesTreeWithFallback(): Promise<StoreCategoryTreeNode[]> {
  try {
    return await fetchStoreCategoriesTreeLive();
  } catch {
    const snapshot = await fetchStaticStoreCategoriesTree();
    if (snapshot?.length) {
      const tree = finalizeStoreCategoryTree(snapshot);
      storeCategoriesTree(tree);
      return tree;
    }

    const cached = readStoredStoreCategoriesTree();
    if (cached?.length) return finalizeStoreCategoryTree(cached);

    return buildStaticStoreCategoryTree(readRemovedStaticSlugs());
  }
}

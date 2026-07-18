import { categories } from '@/data/categories';
import { getCatalogRows, productMatchesCategories } from '@/lib/catalog-featured';
import type { StoreCategoryTreeNode } from '@/types/store-category';
// @ts-expect-error módulo JS compartido
import { EQUIPMENT_STORE_SUBCATEGORIES } from '../../shared/equipment-store-subcategories.js';

const EQUIPMENT_SUBCATEGORIES: Record<
  string,
  Array<{ slug: string; name: string; inventoryLabels: string[]; image?: string | null }>
> = EQUIPMENT_STORE_SUBCATEGORIES;

function countProductsForLabels(labels: readonly string[]): number {
  if (labels.length === 0) return 0;
  return getCatalogRows().filter((row) => productMatchesCategories(row.category, labels)).length;
}

function buildSubcategoryNodes(
  parentId: string,
  entries: Array<{ slug: string; name: string; inventoryLabels: string[]; image?: string | null }>,
): StoreCategoryTreeNode[] {
  return entries.map((entry, index) => ({
    id: `static-${entry.slug}`,
    name: entry.name,
    slug: entry.slug,
    parentId,
    sortOrder: index,
    inventoryLabels: entry.inventoryLabels,
    image: entry.image ?? null,
    tagline: null,
    productCount: countProductsForLabels(entry.inventoryLabels),
    children: [],
  }));
}

/** Quita nodos cuyo slug (o id) fue eliminado explícitamente. */
export function pruneRemovedCategorySlugs(
  tree: StoreCategoryTreeNode[],
  removedSlugs: readonly string[],
): StoreCategoryTreeNode[] {
  const removed = new Set(removedSlugs);

  const walk = (nodes: StoreCategoryTreeNode[]): StoreCategoryTreeNode[] =>
    nodes
      .filter((node) => !removed.has(node.slug) && !removed.has(node.id))
      .map((node) => ({
        ...node,
        children: walk(node.children ?? []),
      }));

  return walk(tree);
}

/** Fusiona hijos de la API con subcategorías estáticas de equipos (sin pisar las creadas). */
export function enrichStoreCategoryTree(
  tree: StoreCategoryTreeNode[],
  removedStaticSlugs: readonly string[] = [],
): StoreCategoryTreeNode[] {
  const removed = new Set(removedStaticSlugs);

  function enrichNode(node: StoreCategoryTreeNode): StoreCategoryTreeNode {
    const children = (node.children ?? []).map(enrichNode);
    const staticSubEntries = EQUIPMENT_SUBCATEGORIES[node.slug] ?? [];

    if (staticSubEntries.length === 0) {
      return { ...node, children };
    }

    const existingSlugs = new Set(children.map((child) => child.slug));
    const missing = staticSubEntries.filter(
      (entry) => !existingSlugs.has(entry.slug) && !removed.has(entry.slug),
    );
    const merged =
      missing.length > 0
        ? [...children, ...buildSubcategoryNodes(node.id, missing)]
        : children;

    return { ...node, children: merged };
  }

  const enrichedChildren = tree.map(enrichNode);
  const withMissingRoots = mergeMissingStaticCategoryRoots(
    enrichedChildren,
    removedStaticSlugs,
  );

  return pruneRemovedCategorySlugs(withMissingRoots, removedStaticSlugs);
}

/**
 * Añade raíces del catálogo estático ausentes en la API (p. ej. Escáneres),
 * para que el árbol taxonómico del inventario esté completo.
 */
export function mergeMissingStaticCategoryRoots(
  tree: StoreCategoryTreeNode[],
  removedStaticSlugs: readonly string[] = [],
): StoreCategoryTreeNode[] {
  const removed = new Set(removedStaticSlugs);
  const existingSlugs = new Set(tree.map((node) => node.slug));
  const missingRoots: StoreCategoryTreeNode[] = [];

  for (const [index, category] of categories.entries()) {
    const hasInventory =
      Boolean(category.inventoryCategories?.length) ||
      Boolean(EQUIPMENT_SUBCATEGORIES[category.slug]);
    if (!hasInventory) continue;
    if (existingSlugs.has(category.slug) || removed.has(category.slug)) continue;

    const id = `static-${category.slug}`;
    const inventoryLabels = category.inventoryCategories ?? [category.name];
    const subEntries = EQUIPMENT_SUBCATEGORIES[category.slug] ?? [];

    missingRoots.push({
      id,
      name: category.name,
      slug: category.slug,
      parentId: null,
      sortOrder: tree.length + index,
      inventoryLabels: [...inventoryLabels],
      image: category.image ?? null,
      tagline: category.tagline ?? null,
      productCount: countProductsForLabels(inventoryLabels),
      children: buildSubcategoryNodes(id, subEntries.filter((entry) => !removed.has(entry.slug))),
    });
  }

  if (missingRoots.length === 0) return tree;
  return [...tree, ...missingRoots];
}

/** Árbol mínimo embebido cuando la API de categorías no responde. */
export function buildStaticStoreCategoryTree(
  removedStaticSlugs: readonly string[] = [],
): StoreCategoryTreeNode[] {
  const tree = categories
    .filter((category) => category.inventoryCategories?.length || EQUIPMENT_SUBCATEGORIES[category.slug])
    .map((category, index) => {
      const id = `static-${category.slug}`;
      const inventoryLabels = category.inventoryCategories ?? [category.name];
      const subEntries = EQUIPMENT_SUBCATEGORIES[category.slug] ?? [];

      return {
        id,
        name: category.name,
        slug: category.slug,
        parentId: null,
        sortOrder: index,
        inventoryLabels: [...inventoryLabels],
        image: category.image ?? null,
        tagline: category.tagline ?? null,
        productCount: countProductsForLabels(inventoryLabels),
        children: buildSubcategoryNodes(id, subEntries),
      };
    });

  return pruneRemovedCategorySlugs(
    enrichStoreCategoryTree(tree, removedStaticSlugs),
    removedStaticSlugs,
  );
}

export function removeCategoryFromTree(
  tree: StoreCategoryTreeNode[],
  id: string,
  slug?: string,
): StoreCategoryTreeNode[] {
  const walk = (nodes: StoreCategoryTreeNode[]): StoreCategoryTreeNode[] =>
    nodes
      .filter((node) => node.id !== id && (!slug || node.slug !== slug))
      .map((node) => ({
        ...node,
        children: walk(node.children ?? []),
      }));

  return walk(tree);
}

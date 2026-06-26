import type { StoreCategoryTreeNode } from '@/types/store-category';

/** Categorías técnicas excluidas de navegación pública (Tienda, mega menú, carrusel). */
export const CATALOG_NAV_HIDDEN_SLUGS = new Set<string>(['sin-categoria']);

function nodeRichness(node: StoreCategoryTreeNode): number {
  return (node.productCount ?? 0) + (node.children?.length ?? 0) * 100;
}

function dedupeRootNodes(tree: StoreCategoryTreeNode[]): StoreCategoryTreeNode[] {
  const bestBySlug = new Map<string, StoreCategoryTreeNode>();

  for (const node of tree) {
    const current = bestBySlug.get(node.slug);
    if (!current || nodeRichness(node) > nodeRichness(current)) {
      bestBySlug.set(node.slug, node);
    }
  }

  const seen = new Set<string>();
  const result: StoreCategoryTreeNode[] = [];

  for (const node of tree) {
    if (CATALOG_NAV_HIDDEN_SLUGS.has(node.slug)) continue;
    if (seen.has(node.slug)) continue;
    seen.add(node.slug);
    const best = bestBySlug.get(node.slug);
    if (best) result.push(best);
  }

  return result;
}

/** Raíces del árbol listas para sidebar de Tienda, mega menú y carrusel de categorías. */
export function prepareCatalogCategoryTree(tree: StoreCategoryTreeNode[]): StoreCategoryTreeNode[] {
  if (tree.length === 0) return tree;
  return dedupeRootNodes(tree);
}

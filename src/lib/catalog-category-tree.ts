import type { StoreCategoryTreeNode } from '@/types/store-category';

/** Categorías técnicas excluidas de navegación pública (Tienda, mega menú, carrusel). */
export const CATALOG_NAV_HIDDEN_SLUGS = new Set<string>([
  'sin-categoria',
  'toner-suministros',
  'toner-compatibles',
  'repuestos',
]);

/** Raíces con menú propio en el header (no van bajo «Productos»). */
export const PRODUCTOS_NAV_EXCLUDED_SLUGS = new Set<string>([
  ...CATALOG_NAV_HIDDEN_SLUGS,
  'servicio-tecnico',
  'software',
  'alquiler',
  'tecnologia',
]);

/** Orden curado de categorías de equipos en el mega menú «Productos». */
export const PRODUCTOS_NAV_ROOT_SLUGS = [
  // Impresión y digitalización
  'multifuncionales',
  'impresoras',
  'formato-ancho',
  'escaneres',
  // Tecnología y periféricos
  'computadoras-laptop',
  'monitores',
  'accesorios',
  // Colaboración y AV
  'soluciones-colaboracion',
  'equipamiento-videoconferencias',
  'camaras',
  // Oficina
  'equipos-de-oficina',
  'soluciones-negocio',
] as const;

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

function mergeCategoryNode(
  apiNode: StoreCategoryTreeNode | undefined,
  staticNode: StoreCategoryTreeNode | undefined,
): StoreCategoryTreeNode | undefined {
  const node = apiNode ?? staticNode;
  if (!node) return undefined;

  const apiChildren = apiNode?.children ?? [];
  const staticChildren = staticNode?.children ?? [];
  const children =
    apiChildren.length > 0 ? apiChildren : staticChildren.length > 0 ? staticChildren : [];

  return {
    ...staticNode,
    ...apiNode,
    id: apiNode?.id ?? staticNode?.id ?? node.id,
    name: apiNode?.name ?? staticNode?.name ?? node.name,
    slug: node.slug,
    parentId: null,
    image: apiNode?.image ?? staticNode?.image ?? null,
    tagline: apiNode?.tagline ?? staticNode?.tagline ?? null,
    inventoryLabels:
      (apiNode?.inventoryLabels?.length ?? 0) > 0
        ? apiNode!.inventoryLabels
        : (staticNode?.inventoryLabels ?? node.inventoryLabels ?? []),
    productCount: Math.max(apiNode?.productCount ?? 0, staticNode?.productCount ?? 0),
    children,
  };
}

/** Árbol de categorías de equipos para el mega menú «Productos» (API + catálogo estático). */
export function prepareProductosNavCategoryTree(
  apiTree: StoreCategoryTreeNode[],
  staticTree: StoreCategoryTreeNode[],
): StoreCategoryTreeNode[] {
  const apiBySlug = new Map(
    prepareCatalogCategoryTree(apiTree)
      .filter((node) => !PRODUCTOS_NAV_EXCLUDED_SLUGS.has(node.slug))
      .map((node) => [node.slug, node]),
  );
  const staticBySlug = new Map(
    staticTree
      .filter((node) => !PRODUCTOS_NAV_EXCLUDED_SLUGS.has(node.slug))
      .map((node) => [node.slug, node]),
  );

  return PRODUCTOS_NAV_ROOT_SLUGS.flatMap((slug) => {
    const merged = mergeCategoryNode(apiBySlug.get(slug), staticBySlug.get(slug));
    return merged ? [merged] : [];
  });
}

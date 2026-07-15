import { categories } from '@/data/categories';
import { getCatalogRows, productMatchesCategories } from '@/lib/catalog-featured';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const EQUIPMENT_SUBCATEGORIES: Record<
  string,
  Array<{ slug: string; name: string; inventoryLabels: string[] }>
> = {
  multifuncionales: [
    {
      slug: 'multifuncionales-nuevas',
      name: 'Multifuncionales Nuevas',
      inventoryLabels: ['Multifuncionales Nuevas', 'Multifuncionales, Multifuncionales Nuevas'],
    },
    {
      slug: 'multifuncionales-seminuevas',
      name: 'Multifuncionales Seminuevas',
      inventoryLabels: ['Multifuncionales Seminuevas', 'Multifuncionales, Multifuncionales Seminuevas'],
    },
    {
      slug: 'multifuncionales-remanufacturadas',
      name: 'Multifuncionales Remanufacturadas',
      inventoryLabels: [
        'Multifuncionales Remanufacturadas',
        'Multifuncionales, Multifuncionales Remanufacturadas',
      ],
    },
  ],
  impresoras: [
    {
      slug: 'impresoras-laser-nuevas',
      name: 'Impresoras Láser Nuevas',
      inventoryLabels: [
        'Impresoras Laser Nuevas',
        'Impresoras Láser Nuevas',
        'Impresoras, Impresoras Laser Nuevas',
        'Impresoras, Impresoras Láser Nuevas',
      ],
    },
    {
      slug: 'impresoras-laser-seminuevas',
      name: 'Impresoras Láser Seminuevas',
      inventoryLabels: ['Impresoras Laser Seminuevas', 'Impresoras Láser Seminuevas'],
    },
    {
      slug: 'impresoras-laser-remanufacturadas',
      name: 'Impresoras Láser Remanufacturadas',
      inventoryLabels: ['Impresoras Laser Remanufacturadas', 'Impresoras Láser Remanufacturadas'],
    },
  ],
  'toner-suministros': [
    {
      slug: 'toner-originales',
      name: 'Toner Originales',
      inventoryLabels: [
        'Suministros, Toner Originales',
        'Suministros, Toner Original',
        'Toner Original',
        'Toner, Toner Original',
        'Toner, Toner Originales',
        'Toner y Suministros, Toner Original',
        'Tóner y Suministros, Toner Original',
      ],
    },
    {
      slug: 'suministros',
      name: 'Suministros',
      inventoryLabels: ['Suministros', 'Toner, Suministros'],
    },
    {
      slug: 'toner-compatibles',
      name: 'Tóner Compatible',
      inventoryLabels: [
        'Toner Compatible',
        'Suministros, Toner Compatible',
        'Toner, Toner Compatible',
        'Toner Compatibles',
        'Toner, Toner Compatibles',
        'Toner Compatibles HaiPrint',
        'Toner Compatibles Haitone',
      ],
    },
    {
      slug: 'tintas-originales',
      name: 'Tintas Originales',
      inventoryLabels: ['Tintas Originales', 'Tinta Original', 'Tinta, Tinta Original', 'Tintas', 'Tinta'],
    },
    {
      slug: 'tintas-compatibles',
      name: 'Tintas Compatibles',
      inventoryLabels: ['Tintas Compatibles', 'Tinta Compatible', 'Tinta, Tinta Compatible', 'Tintas'],
    },
    {
      slug: 'toner-remanufacturado',
      name: 'Toner Remanufacturado',
      inventoryLabels: [
        'Toner Remanufacturado',
        'Toner Remanufacturados',
        'Toner, Toner Remanufacturado',
        'Toner, Toner Remanufacturados',
        'Suministros, Toner Remanufacturado',
        'Toner y Suministros, Toner Remanufacturado',
      ],
    },
    {
      slug: 'toner-recarga',
      name: 'Toner Recarga',
      inventoryLabels: [
        'Toner Recargas',
        'Recargas',
        'Recarga',
        'Toner, Recargas',
        'Toner, Recarga',
        'Suministros, Recarga',
        'Suministros, Toner Recarga',
        'Toner y Suministros, Recarga',
        'Toner y Suministros, Toner Recarga',
      ],
    },
  ],
  escaneres: [
    {
      slug: 'escaneres-nuevos',
      name: 'Escáneres Nuevos',
      inventoryLabels: [
        'Escáneres Nuevos',
        'Escáneres, Escáneres Nuevos',
        'Escaneres Nuevos',
        'Escaner',
        'Escáner',
      ],
    },
  ],
  'equipos-de-oficina': [
    {
      slug: 'espiraladoras',
      name: 'Espiraladoras',
      inventoryLabels: ['Espiraladoras', 'Espiraladora', 'Equipos de Oficina, Espiraladoras'],
    },
    {
      slug: 'anilladoras',
      name: 'Anilladoras',
      inventoryLabels: ['Anilladoras', 'Anilladora', 'Equipos de Oficina, Anilladoras'],
    },
    {
      slug: 'enmicadoras',
      name: 'Enmicadoras',
      inventoryLabels: ['Enmicadoras', 'Enmicadora', 'Equipos de Oficina, Enmicadora'],
    },
    {
      slug: 'guillotinas',
      name: 'Guillotinas',
      inventoryLabels: ['Guillotinas', 'Guillotina', 'Equipos de Oficina, Guillotina'],
    },
  ],
};

function countProductsForLabels(labels: readonly string[]): number {
  if (labels.length === 0) return 0;
  return getCatalogRows().filter((row) => productMatchesCategories(row.category, labels)).length;
}

function buildSubcategoryNodes(
  parentId: string,
  entries: Array<{ slug: string; name: string; inventoryLabels: string[] }>,
): StoreCategoryTreeNode[] {
  return entries.map((entry, index) => ({
    id: `static-${entry.slug}`,
    name: entry.name,
    slug: entry.slug,
    parentId,
    sortOrder: index,
    inventoryLabels: entry.inventoryLabels,
    image: null,
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

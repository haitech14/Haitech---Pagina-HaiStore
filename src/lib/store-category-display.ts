import type { StoreCategory, StoreCategoryTreeNode } from '@/types/store-category';

/** Valor de `?sub=` para ver todas las subcategorías sin filtro activo. */
export const ALL_SUBCATEGORIES_QUERY = 'todas';

export function parseCategorySubSearchParam(raw: string | null): {
  subSlug: string | null;
  isAllSubcategoriesView: boolean;
} {
  if (!raw) {
    return { subSlug: null, isAllSubcategoriesView: false };
  }
  if (raw === ALL_SUBCATEGORIES_QUERY) {
    return { subSlug: null, isAllSubcategoriesView: true };
  }
  return { subSlug: raw, isAllSubcategoriesView: false };
}

export function findStoreCategoryBySlug(
  nodes: StoreCategoryTreeNode[],
  slug: string,
): StoreCategoryTreeNode | undefined {
  for (const node of nodes) {
    if (node.slug === slug) return node;
    const nested = findStoreCategoryBySlug(node.children ?? [], slug);
    if (nested) return nested;
  }
  return undefined;
}

export function collectInventoryLabels(category: StoreCategory): string[] {
  const labels = new Set<string>();
  for (const label of category.inventoryLabels ?? []) {
    if (label.trim()) labels.add(label.trim());
  }
  for (const child of category.children ?? []) {
    for (const label of collectInventoryLabels(child)) labels.add(label);
  }
  return [...labels];
}

/** Etiqueta corta para tabs (p. ej. «Multifuncionales Nuevas» → «Nuevas»). */
export function formatSubcategoryTabLabel(name: string, parentName?: string | null): string {
  if (!parentName?.trim()) return name;
  const prefix = `${parentName.trim()} `;
  if (name.startsWith(prefix)) return name.slice(prefix.length);
  return name;
}

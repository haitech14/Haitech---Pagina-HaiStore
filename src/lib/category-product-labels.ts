import { categories, type Category } from '@/data/categories';
import {
  collectInventoryLabels,
  findStoreCategoryBySlug,
} from '@/lib/store-category-display';
import type { StoreCategoryTreeNode } from '@/types/store-category';

/** Paridad con shared/category-inventory-labels.js y store-categories.json */
const SUBCATEGORY_INVENTORY_LABELS: Record<string, readonly string[]> = {
  'multifuncionales-nuevas': [
    'Multifuncionales Nuevas',
    'Multifuncionales, Multifuncionales Nuevas',
  ],
  'multifuncionales-seminuevas': [
    'Multifuncionales Seminuevas',
    'Multifuncionales, Multifuncionales Seminuevas',
  ],
  'multifuncionales-remanufacturadas': [
    'Multifuncionales Remanufacturadas',
    'Multifuncionales, Multifuncionales Remanufacturadas',
  ],
  'impresoras-laser-nuevas': [
    'Impresoras Laser Nuevas',
    'Impresoras Láser Nuevas',
    'Impresoras, Impresoras Laser Nuevas',
    'Impresoras, Impresoras Láser Nuevas',
  ],
  'impresoras-laser-seminuevas': [
    'Impresoras Laser Seminuevas',
    'Impresoras Láser Seminuevas',
  ],
  'impresoras-laser-remanufacturadas': [
    'Impresoras Laser Remanufacturadas',
    'Impresoras Láser Remanufacturadas',
  ],
  toner: [
    'Toner Original',
    'Toner, Toner Original',
    'Toner, Toner Originales',
  ],
  suministros: ['Suministros', 'Toner, Suministros'],
  'toner-compatibles': [
    'Toner Compatible',
    'Toner, Toner Compatible',
    'Toner Compatibles',
    'Toner, Toner Compatibles',
    'Toner Compatibles HaiPrint',
    'Toner Compatibles Haitone',
  ],
};

function resolveSubcategoryInventoryLabels(subSlug: string): string[] {
  return [...(SUBCATEGORY_INVENTORY_LABELS[subSlug] ?? [])];
}

export function getCategoryProductLabels(category: Category): readonly string[] {
  if (category.inventoryCategories?.length) {
    return category.inventoryCategories;
  }
  return [category.name];
}

export function findCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function findStoreSubcategoryBySlug(
  node: StoreCategoryTreeNode | undefined,
  subSlug: string,
): StoreCategoryTreeNode | undefined {
  if (!node) return undefined;
  for (const child of node.children ?? []) {
    if (child.slug === subSlug) return child;
    const nested = findStoreSubcategoryBySlug(child, subSlug);
    if (nested) return nested;
  }
  return undefined;
}

function resolveSubcategoryLabels(
  category: Category,
  storeCategory: StoreCategoryTreeNode | undefined,
  categoryTree: StoreCategoryTreeNode[],
  subSlug: string,
): string[] | null {
  const sub =
    (storeCategory ? findStoreSubcategoryBySlug(storeCategory, subSlug) : undefined) ??
    (categoryTree.length > 0 ? findStoreCategoryBySlug(categoryTree, subSlug) : undefined);

  if (sub) {
    return sub.inventoryLabels?.length ? [...sub.inventoryLabels] : [sub.name];
  }

  const staticLabels = resolveSubcategoryInventoryLabels(subSlug);
  if (staticLabels.length > 0) return [...staticLabels];

  const parentLabels = getCategoryProductLabels(category).filter((label) =>
    label.toLowerCase().includes(subSlug.replace(/-/g, ' ')),
  );
  if (parentLabels.length > 0) return [...parentLabels];

  return null;
}

/** Etiquetas de inventario para filtrar productos en `/categoria/:slug` (estáticas + árbol de tienda). */
export function resolveCategoryPageProductLabels(
  category: Category,
  storeCategory: StoreCategoryTreeNode | undefined,
  subSlug: string | null,
  categoryTree: StoreCategoryTreeNode[] = [],
): string[] {
  const staticLabels = [...getCategoryProductLabels(category)];

  if (subSlug) {
    const subLabels = resolveSubcategoryLabels(category, storeCategory, categoryTree, subSlug);
    if (subLabels?.length) return subLabels;
  }

  const treeLabels = storeCategory ? collectInventoryLabels(storeCategory) : [];
  const merged = [...new Set([...staticLabels, ...treeLabels])];
  return merged.length > 0 ? merged : staticLabels;
}

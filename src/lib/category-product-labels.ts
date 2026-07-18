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
  'impresoras-termicas': [
    'Impresoras Térmicas',
    'Impresoras Termicas',
    'Impresoras, Impresoras Térmicas',
    'Impresoras, Impresoras Termicas',
  ],
  'toner-originales': [
    'Suministros, Toner Originales',
    'Suministros, Toner Original',
    'Toner Original',
    'Toner, Toner Original',
    'Toner, Toner Originales',
    'Toner y Suministros, Toner Original',
    'Tóner y Suministros, Toner Original',
  ],
  suministros: ['Suministros', 'Toner, Suministros'],
  'toner-compatibles': [
    'Toner Compatible',
    'Suministros, Toner Compatible',
    'Toner, Toner Compatible',
    'Toner Compatibles',
    'Toner, Toner Compatibles',
    'Toner Compatibles HaiPrint',
    'Toner Compatibles Haitone',
  ],
  'rodillos-de-presion': [
    'Rodillo de Presión',
    'Rodillos de Presión',
    'Repuestos Compatibles, Rodillo de Presión',
    'Repuestos, Repuestos Compatibles, Rodillo de Presión',
  ],
  'ruedas-casetera': [
    'Ruedas de Casetera',
    'Rueda de Casetera',
    'Repuestos Compatibles, Ruedas de Casetera',
    'Repuestos, Repuestos Compatibles, Ruedas de Casetera',
  ],
  'engranaje-pinon': [
    'Engranaje/Piñon',
    'Engranaje',
    'Piñon',
    'Repuestos Compatibles, Engranaje/Piñon',
    'Repuestos, Repuestos Compatibles, Engranaje/Piñon',
  ],
  bocinas: [
    'Bocinas',
    'Bocina',
    'Repuestos Compatibles, Bocinas',
    'Repuestos, Repuestos Compatibles, Bocinas',
  ],
  espiraladoras: [
    'Espiraladoras',
    'Espiraladora',
    'Equipos de Oficina, Espiraladoras',
  ],
  anilladoras: [
    'Anilladoras',
    'Anilladora',
    'Equipos de Oficina, Anilladoras',
  ],
  enmicadoras: [
    'Enmicadoras',
    'Enmicadora',
    'Equipos de Oficina, Enmicadora',
  ],
  guillotinas: [
    'Guillotinas',
    'Guillotina',
    'Equipos de Oficina, Guillotina',
  ],
  'equipos-de-oficina': ['Equipos de Oficina'],
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
  category: Category | undefined,
  storeCategory: StoreCategoryTreeNode | undefined,
  categoryTree: StoreCategoryTreeNode[],
  subSlug: string,
): string[] | null {
  const sub =
    (storeCategory ? findStoreSubcategoryBySlug(storeCategory, subSlug) : undefined) ??
    (categoryTree.length > 0 ? findStoreCategoryBySlug(categoryTree, subSlug) : undefined);

  if (sub) {
    const treeLabels = sub.inventoryLabels?.length ? [...sub.inventoryLabels] : [sub.name];
    const staticCategory = findCategoryBySlug(subSlug);
    if (staticCategory) {
      return [...new Set([...treeLabels, ...getCategoryProductLabels(staticCategory)])];
    }
    return treeLabels;
  }

  const staticLabels = resolveSubcategoryInventoryLabels(subSlug);
  if (staticLabels.length > 0) return [...staticLabels];

  if (!category) return null;

  const parentLabels = getCategoryProductLabels(category).filter((label) =>
    label.toLowerCase().includes(subSlug.replace(/-/g, ' ')),
  );
  if (parentLabels.length > 0) return [...parentLabels];

  return null;
}

/** Etiquetas de inventario para filtrar productos en `/categoria/:slug` (estáticas + árbol de tienda). */
export function resolveCategoryPageProductLabels(
  category: Category | undefined,
  storeCategory: StoreCategoryTreeNode | undefined,
  subSlug: string | null,
  categoryTree: StoreCategoryTreeNode[] = [],
): string[] {
  const staticLabels = category ? [...getCategoryProductLabels(category)] : [];

  if (subSlug) {
    const subLabels = resolveSubcategoryLabels(category, storeCategory, categoryTree, subSlug);
    if (subLabels?.length) return subLabels;
  }

  const treeLabels = storeCategory ? collectInventoryLabels(storeCategory) : [];
  const merged = [...new Set([...staticLabels, ...treeLabels])];
  return merged.length > 0 ? merged : staticLabels;
}

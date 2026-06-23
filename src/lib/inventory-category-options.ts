import { categories } from '@/data/categories';
import { categoryInventoryLabel } from '@/lib/inventory-product-category';
import { parseInventoryTagList } from '@/lib/inventory-tags';
import { flattenCategoryTree } from '@/lib/store-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export interface InventorySelectOption {
  value: string;
  label: string;
  /** 0 = categoría raíz del grupo; >0 = subcategoría. */
  depth?: number;
}

export interface InventoryCategorySelectGroup {
  /** Identificador estable del grupo (slug de raíz u «orphans»). */
  id: string;
  /** Etiqueta del grupo (categoría raíz o «Otras etiquetas»). */
  label: string;
  options: InventorySelectOption[];
}

function indentLabel(depth: number, text: string): string {
  if (depth <= 0) return text;
  return `${'— '.repeat(depth)}${text}`;
}

/**
 * Opciones en orden del árbol (sin orden alfabético global).
 */
export function buildCategorySelectOptions(
  tree: StoreCategoryTreeNode[],
  extraLabels: string[] = [],
): InventorySelectOption[] {
  const seen = new Set<string>();
  const options: InventorySelectOption[] = [];

  const add = (value: string, label: string, depth = 0) => {
    const key = value.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push({ value: key, label, depth });
  };

  for (const node of flattenCategoryTree(tree)) {
    const value = categoryInventoryLabel(node);
    add(value, indentLabel(node.depth, value), node.depth);
  }

  for (const category of categories) {
    add(category.name, category.name, 0);
  }

  for (const label of extraLabels) {
    for (const part of parseInventoryTagList(label)) {
      if (!seen.has(part)) {
        add(part, part, 0);
      }
    }
  }

  return options;
}

/**
 * Grupos taxonómicos para selects (raíz → subcategorías).
 */
export function buildCategorySelectGroups(
  tree: StoreCategoryTreeNode[],
  extraLabels: string[] = [],
): InventoryCategorySelectGroup[] {
  const seen = new Set<string>();
  const groups: InventoryCategorySelectGroup[] = [];

  const addOption = (options: InventorySelectOption[], value: string, depth: number) => {
    const key = value.trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push({ value: key, label: indentLabel(depth, key), depth });
  };

  const walk = (node: StoreCategoryTreeNode, depth: number) => {
    const children = node.children ?? [];
    const options: InventorySelectOption[] = [];

    if (children.length === 0) {
      addOption(options, categoryInventoryLabel(node), depth);
      if (options.length === 0) return;
      groups.push({
        id: node.slug,
        label: node.name,
        options,
      });
      return;
    }

    addOption(options, categoryInventoryLabel(node), 0);
    for (const flat of flattenCategoryTree(children, 0)) {
      addOption(options, categoryInventoryLabel(flat), flat.depth + 1);
    }
    if (options.length === 0) return;
    groups.push({ id: node.slug, label: node.name, options });
  };

  for (const root of tree) {
    walk(root, 0);
  }

  const orphanOptions: InventorySelectOption[] = [];
  for (const label of extraLabels) {
    for (const part of parseInventoryTagList(label)) {
      addOption(orphanOptions, part, 1);
    }
  }
  for (const category of categories) {
    addOption(orphanOptions, category.name, 1);
  }
  if (orphanOptions.length > 0) {
    groups.push({ id: 'orphans', label: 'Otras etiquetas', options: orphanOptions });
  }

  return groups;
}

/** Etiquetas de productos que no están ya en el árbol. */
export function collectOrphanCategoryLabels(
  tree: StoreCategoryTreeNode[],
  productLabels: string[],
): string[] {
  const known = new Set(buildCategorySelectOptions(tree).map((o) => o.value));
  const orphans: string[] = [];
  for (const raw of productLabels) {
    for (const part of parseInventoryTagList(raw)) {
      if (!known.has(part) && !orphans.includes(part)) {
        orphans.push(part);
      }
    }
  }
  return orphans;
}

import { Briefcase, Copy, PackageOpen, Printer, type LucideIcon } from 'lucide-react';

import { categories, type Category } from '@/data/categories';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const SLUG_ICONS: Record<string, LucideIcon> = {
  multifuncionales: Copy,
  impresoras: Printer,
  alquiler: Printer,
  software: Briefcase,
};

function defaultIconForSlug(slug: string): LucideIcon {
  return SLUG_ICONS[slug] ?? PackageOpen;
}

/** Convierte un nodo del árbol de tienda en metadatos de página de categoría. */
export function storeCategoryToPageCategory(node: StoreCategoryTreeNode): Category {
  return {
    slug: node.slug,
    name: node.name,
    tagline: node.tagline?.trim() || node.name,
    icon: defaultIconForSlug(node.slug),
    image: node.image ?? undefined,
    inventoryCategories: node.inventoryLabels?.length ? [...node.inventoryLabels] : [node.name],
  };
}

/**
 * Resuelve la categoría de página: prioriza nombres/descripciones del árbol guardado en la API
 * y cae al catálogo estático embebido cuando el slug no existe en la tienda.
 */
export function resolveCategoryForPage(
  slug: string | undefined,
  storeCategory: StoreCategoryTreeNode | undefined,
): Category | undefined {
  if (!slug) return undefined;

  const staticCategory = categories.find((entry) => entry.slug === slug);

  if (storeCategory) {
    const fromStore = storeCategoryToPageCategory(storeCategory);
    if (!staticCategory) return fromStore;
    return {
      ...staticCategory,
      name: storeCategory.name,
      tagline: storeCategory.tagline?.trim() || staticCategory.tagline,
      image: storeCategory.image ?? staticCategory.image,
      inventoryCategories:
        storeCategory.inventoryLabels?.length
          ? [...storeCategory.inventoryLabels]
          : staticCategory.inventoryCategories,
    };
  }

  return staticCategory;
}

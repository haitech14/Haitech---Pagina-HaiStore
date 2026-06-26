import { Briefcase, Copy, Laptop, PackageOpen, type LucideIcon } from 'lucide-react';

import { categories, type Category } from '@/data/categories';
import { prepareCatalogCategoryTree } from '@/lib/catalog-category-tree';
import type { StoreCategoryTreeNode } from '@/types/store-category';

const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));

const DEFAULT_ICON: LucideIcon = Copy;

const FALLBACK_META: Record<string, Pick<Category, 'icon' | 'tagline' | 'image'>> = {
  'toner-suministros': {
    icon: PackageOpen,
    tagline: 'Tóner original, remanufacturado y recargas',
    image: '/categories/toner-suministros.png',
  },
  tecnologia: {
    icon: Laptop,
    tagline: 'Equipos de cómputo, pantallas y accesorios',
    image: '/categories/computadoras-laptop.png',
  },
  software: {
    icon: Briefcase,
    tagline: 'Soluciones de gestión documental y seguridad',
    image: '/categories/soluciones-negocio.png',
  },
  'equipos-de-oficina': {
    icon: PackageOpen,
    tagline: 'Equipamiento para oficina y encuadernación',
    image: '/categories/repuestos.png',
  },
};

function toLandingCategory(node: StoreCategoryTreeNode): Category {
  const staticMeta = categoriesBySlug.get(node.slug);
  const fallback = FALLBACK_META[node.slug];
  const image = node.image ?? staticMeta?.image ?? fallback?.image;

  return {
    slug: node.slug,
    name: node.name,
    tagline: node.tagline ?? staticMeta?.tagline ?? fallback?.tagline ?? '',
    icon: staticMeta?.icon ?? fallback?.icon ?? DEFAULT_ICON,
    ...(image ? { image } : {}),
    ...(staticMeta?.inventoryCategories ? { inventoryCategories: staticMeta.inventoryCategories } : {}),
  };
}

/** Categorías raíz para mega menú y carrusel, derivadas del árbol de la Tienda. */
export function buildLandingMenuCategoriesFromTree(tree: StoreCategoryTreeNode[]): Category[] {
  return prepareCatalogCategoryTree(tree).map(toLandingCategory);
}

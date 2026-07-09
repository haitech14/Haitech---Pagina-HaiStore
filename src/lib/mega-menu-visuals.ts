import { Copy, type LucideIcon } from 'lucide-react';

import { categories } from '@/data/categories';
import { megaMenuImageForSlug } from '@/data/mega-menu';
import { SOFTWARE_CATALOG_CATEGORIES } from '@/data/software-catalog';
import type { SoftwareCatalogCategoryId } from '@/types/software-catalog';

const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));
const softwareById = new Map(
  SOFTWARE_CATALOG_CATEGORIES.map((category) => [category.id, category]),
);

const FALLBACK_COLUMN_IMAGE = '/categories/toner-suministros.png';

export function megaMenuIconForSlug(slug: string): LucideIcon {
  const staticCategory = categoriesBySlug.get(slug);
  if (staticCategory) return staticCategory.icon;

  const software = softwareById.get(slug as SoftwareCatalogCategoryId);
  if (software) return software.icon;

  const rootSlug = slug.split('-')[0];
  if (rootSlug) {
    const rootCategory = categoriesBySlug.get(rootSlug);
    if (rootCategory) return rootCategory.icon;
  }

  return Copy;
}

export function resolveMegaMenuColumnImage(slug: string, image?: string): string {
  if (image?.trim()) return image;
  return megaMenuImageForSlug(slug) ?? FALLBACK_COLUMN_IMAGE;
}

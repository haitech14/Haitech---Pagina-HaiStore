import { serviceHubPath } from '@/lib/service-hub';
import { categories } from '@/data/categories';
import { categoryLandingPath } from '@/lib/category-path';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export type HomeHeroCategoryCarouselItem = {
  id: string;
  name: string;
  description: string;
  href: string;
  image?: string;
};

/** Orden fijo del carrusel compacto bajo el hero. */
export const HOME_HERO_CATEGORY_CAROUSEL_SLUGS = [
  'multifuncionales',
  'impresoras',
  'toner-suministros',
  'repuestos',
  'formato-ancho',
  'accesorios',
] as const;

const DISPLAY_NAMES: Record<string, string> = {
  multifuncionales: 'Fotocopiadoras',
  'formato-ancho': 'Formato ancho',
  'toner-suministros': 'Tóner y tintas',
};

const CAROUSEL_DESCRIPTIONS: Record<string, string> = {
  multifuncionales: 'Equipos multifuncionales para oficina',
  impresoras: 'Impresión eficiente para tu negocio',
  'formato-ancho': 'Plotters y equipos para gran formato',
  'toner-suministros': 'Cartuchos y suministros de impresión',
  repuestos: 'Partes y componentes para impresoras',
  accesorios: 'Bandejas, finisher y complementos',
};

const ALQUILER_CAROUSEL_ITEM: HomeHeroCategoryCarouselItem = {
  id: 'alquiler-equipos',
  name: 'Alquiler de equipos',
  description: 'Planes flexibles con mantenimiento incluido',
  href: serviceHubPath('alquiler'),
  image: '/categories/alquiler.png',
};

const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));

function categoryHref(slug: string): string {
  return categoryLandingPath(slug);
}

export function resolveHomeHeroCategoryCarouselItems(
  tree: StoreCategoryTreeNode[],
): HomeHeroCategoryCarouselItem[] {
  const landingBySlug = new Map(
    buildLandingMenuCategoriesFromTree(tree).map((category) => [category.slug, category]),
  );

  const resolved: HomeHeroCategoryCarouselItem[] = [];

  for (const slug of HOME_HERO_CATEGORY_CAROUSEL_SLUGS) {
    const category = landingBySlug.get(slug) ?? categoriesBySlug.get(slug);
    if (!category) continue;

    resolved.push({
      id: category.slug,
      name: DISPLAY_NAMES[category.slug] ?? category.name,
      description: CAROUSEL_DESCRIPTIONS[category.slug] ?? category.tagline,
      href: categoryHref(category.slug),
      ...(category.image ? { image: category.image } : {}),
    });
  }

  resolved.push(ALQUILER_CAROUSEL_ITEM);

  return resolved;
}

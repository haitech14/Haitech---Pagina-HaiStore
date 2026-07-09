import { categories, type Category } from '@/data/categories';
import { getCatalogRows, productMatchesCategories } from '@/lib/catalog-featured';
import { categoryLandingPath } from '@/lib/category-path';
import { buildLandingMenuCategoriesFromTree } from '@/lib/landing-menu-categories';
import type { StoreCategoryTreeNode } from '@/types/store-category';

export type HomeCategoryStripGroupId = 'equipos' | 'consumibles' | 'soluciones';

export type HomeCategoryStripItem = {
  id: string;
  name: string;
  description: string;
  image?: string;
  href: string;
  ctaLabel: string;
  priceFromUsd?: number | null;
  priceSubtext?: string;
  badge?: string;
  group: HomeCategoryStripGroupId;
  order: number;
};

export type HomeCategoryStripGroup = {
  id: HomeCategoryStripGroupId;
  title: string;
  items: HomeCategoryStripItem[];
};

type CategoryOverride = Partial<
  Pick<
    HomeCategoryStripItem,
    | 'name'
    | 'description'
    | 'href'
    | 'image'
    | 'ctaLabel'
    | 'priceFromUsd'
    | 'priceSubtext'
    | 'badge'
    | 'group'
    | 'order'
  >
>;

type HomeCategoryStripConfig = CategoryOverride & {
  group: HomeCategoryStripGroupId;
  order: number;
};

/** Orden fijo del carrusel de categorías en home (independiente del árbol raíz de la tienda). */
export const HOME_CATEGORY_STRIP_SLUGS: readonly string[] = [
  'multifuncionales',
  'impresoras',
  'formato-ancho',
  'computadoras-laptop',
  'toner-compatibles',
  'toner-suministros',
  'repuestos',
  'software',
] as const;

export const HOME_CATEGORY_STRIP_GROUP_ORDER: readonly HomeCategoryStripGroupId[] = [
  'equipos',
  'consumibles',
  'soluciones',
] as const;

export const HOME_CATEGORY_STRIP_GROUP_TITLES: Record<HomeCategoryStripGroupId, string> = {
  equipos: 'Equipos',
  consumibles: 'Consumibles y repuestos',
  soluciones: 'Soluciones y servicios',
};

const categoriesBySlug = new Map(categories.map((category) => [category.slug, category]));

const STATIC_MIN_PRICE_USD: Record<string, number> = {
  multifuncionales: 499,
  impresoras: 399,
  'formato-ancho': 899,
  'toner-suministros': 19.9,
  'toner-compatibles': 12.9,
  repuestos: 8.9,
  'computadoras-laptop': 349,
};

const HOME_CATEGORY_STRIP_CONFIG: Record<string, HomeCategoryStripConfig> = {
  multifuncionales: {
    group: 'equipos',
    order: 1,
    name: 'Fotocopiadoras',
    description: 'Equipos de alto rendimiento para tu oficina.',
    ctaLabel: 'Ver modelos',
    badge: 'Más vendido',
  },
  impresoras: {
    group: 'equipos',
    order: 2,
    description: 'Impresión eficiente para tu negocio.',
    ctaLabel: 'Ver impresoras',
    badge: 'Más consultado',
  },
  'formato-ancho': {
    group: 'equipos',
    order: 3,
    name: 'Plotters',
    description: 'Plotters y equipos de gran formato.',
    ctaLabel: 'Ver plotters',
    badge: 'Recomendado',
  },
  'computadoras-laptop': {
    group: 'equipos',
    order: 4,
    name: 'Laptops',
    description: 'Equipos de cómputo para tu oficina.',
    ctaLabel: 'Ver laptops',
  },
  'toner-compatibles': {
    group: 'consumibles',
    order: 1,
    name: 'Tóner',
    description: 'Cartuchos compatibles y alternativos.',
    ctaLabel: 'Ver tóner',
    badge: 'Más consultado',
  },
  'toner-suministros': {
    group: 'consumibles',
    order: 2,
    name: 'Suministros',
    description: 'Cartuchos originales y compatibles.',
    ctaLabel: 'Explorar',
  },
  repuestos: {
    group: 'consumibles',
    order: 3,
    description: 'Repuestos y accesorios originales.',
    ctaLabel: 'Ver repuestos',
  },
  software: {
    group: 'soluciones',
    order: 1,
    description: 'Gestión documental y soluciones digitales.',
    ctaLabel: 'Ver software',
    priceSubtext: 'Cotización personalizada',
  },
};

const DEFAULT_CTA_LABEL = 'Ver más';

function categoryHref(slug: string): string {
  if (slug === 'software') return '/software';
  return categoryLandingPath(slug);
}

/** Categorías del carrusel home: lista curada con fallback al catálogo estático. */
export function resolveHomeCategoryStripCategories(tree: StoreCategoryTreeNode[]): Category[] {
  const landingBySlug = new Map(
    buildLandingMenuCategoriesFromTree(tree).map((category) => [category.slug, category]),
  );

  const resolved: Category[] = [];
  for (const slug of HOME_CATEGORY_STRIP_SLUGS) {
    const category = landingBySlug.get(slug) ?? categoriesBySlug.get(slug);
    if (category) resolved.push(category);
  }
  return resolved;
}

function resolveCtaLabel(config: HomeCategoryStripConfig): string {
  return config.ctaLabel ?? DEFAULT_CTA_LABEL;
}

function resolveCategoryMinPriceUsd(category: Category): number | null {
  if (category.slug === 'software') {
    return null;
  }

  const labels = category.inventoryCategories ?? [category.name];
  const rows = getCatalogRows();
  let min = Infinity;

  for (const row of rows) {
    if (!productMatchesCategories(row.category, labels)) continue;
    const price = row.prices?.public ?? 0;
    if (price > 0 && price < min) min = price;
  }

  if (min !== Infinity) return min;
  return STATIC_MIN_PRICE_USD[category.slug] ?? null;
}

/** Tarjetas del carrusel «Explora nuestras categorías», con lista curada y fallback al catálogo. */
export function buildHomeCategoryStripItems(categories: Category[]): HomeCategoryStripItem[] {
  return categories.map((category) => {
    const config = HOME_CATEGORY_STRIP_CONFIG[category.slug];
    if (!config) {
      throw new Error(`Missing home category strip config for slug: ${category.slug}`);
    }

    const image = config.image ?? category.image;
    const priceFromUsd =
      config.priceFromUsd !== undefined ? config.priceFromUsd : resolveCategoryMinPriceUsd(category);

    return {
      id: category.slug,
      name: config.name ?? category.name,
      description: config.description ?? category.tagline,
      ...(image ? { image } : {}),
      href: config.href ?? categoryHref(category.slug),
      ctaLabel: resolveCtaLabel(config),
      priceFromUsd,
      ...(config.priceSubtext ? { priceSubtext: config.priceSubtext } : {}),
      ...(config.badge ? { badge: config.badge } : {}),
      group: config.group,
      order: config.order,
    };
  });
}

/** Agrupa y ordena las tarjetas del carrusel por bloque visual. */
export function buildHomeCategoryStripGroups(categories: Category[]): HomeCategoryStripGroup[] {
  const items = buildHomeCategoryStripItems(categories);

  return HOME_CATEGORY_STRIP_GROUP_ORDER.map((groupId) => ({
    id: groupId,
    title: HOME_CATEGORY_STRIP_GROUP_TITLES[groupId],
    items: items
      .filter((item) => item.group === groupId)
      .sort((a, b) => a.order - b.order),
  })).filter((group) => group.items.length > 0);
}

export const CATEGORY_HERO_ID = 'categoria-hero';
export const CATEGORY_PRODUCTS_ID = 'categoria-productos';

import type { ProductCondition } from '@/lib/product-condition';
import { serviceHubPath } from '@/lib/service-hub';
// @ts-ignore módulo JS compartido sin declaración de tipos
import { MOST_VIEWED_OFFER_ATTR_KEY } from '../../shared/catalog-most-viewed-offers.js';

type ShowcaseCategoryId =
  | 'multifuncionales'
  | 'impresoras'
  | 'formato-ancho'
  | 'escaneres'
  | 'accesorios'
  | 'camaras'
  | 'monitores'
  | 'laptops'
  | 'toner'
  | 'repuestos'
  | 'pantallas-interactivas'
  | 'videoconferencia';

type ShowcaseConditionId = 'nuevas' | 'seminuevas' | 'remanufacturadas';

const CATALOG_SLUG_TO_SHOWCASE: Record<string, ShowcaseCategoryId> = {
  multifuncionales: 'multifuncionales',
  impresoras: 'impresoras',
  'formato-ancho': 'formato-ancho',
  escaneres: 'escaneres',
  accesorios: 'accesorios',
  camaras: 'camaras',
  monitores: 'monitores',
  'computadoras-laptop': 'laptops',
  laptops: 'laptops',
  toner: 'toner',
  'toner-suministros': 'toner',
  'toner-compatibles': 'toner',
  repuestos: 'repuestos',
  'soluciones-colaboracion': 'pantallas-interactivas',
  'pantallas-interactivas': 'pantallas-interactivas',
  'equipamiento-videoconferencias': 'videoconferencia',
  videoconferencia: 'videoconferencia',
  plotter: 'formato-ancho',
};

const IMPRESORA_TIPOS = new Set(['laser', 'tinta', 'termica', 'matricial']);
const CONSUMABLE_ORIGINS = new Set(['originales', 'compatibles', 'remanufacturados']);

function buildShowcaseHref(
  categoryId: ShowcaseCategoryId,
  options: {
    condition?: ShowcaseConditionId;
    filter?: string;
    deviceClass?: 'plotter' | 'multifuncional';
  },
): string {
  const params = new URLSearchParams();

  if (categoryId === 'impresoras' && options.filter && IMPRESORA_TIPOS.has(options.filter)) {
    params.set('tipo', options.filter);
  } else if (
    (categoryId === 'toner' || categoryId === 'repuestos') &&
    options.filter &&
    CONSUMABLE_ORIGINS.has(options.filter)
  ) {
    params.set('origen', options.filter);
  }

  if (categoryId === 'formato-ancho' && options.deviceClass) {
    params.set('clase', options.deviceClass);
  }

  if (options.condition && options.condition !== 'nuevas') {
    params.set('condicion', options.condition);
  }

  const qs = params.toString();
  return qs ? `/tienda/${categoryId}?${qs}` : `/tienda/${categoryId}`;
}

function productConditionToShowcase(
  condition: ProductCondition,
  categoryId: ShowcaseCategoryId,
): {
  condition?: ShowcaseConditionId;
  filter?: string;
} {
  const isConsumable = categoryId === 'toner' || categoryId === 'repuestos';
  if (isConsumable) {
    if (condition === 'originales') return { filter: 'originales' };
    if (condition === 'compatibles') return { filter: 'compatibles' };
    if (condition === 'remanufacturados') return { filter: 'remanufacturados' };
    return {};
  }
  if (condition === 'originales') return { condition: 'nuevas' };
  if (condition === 'compatibles') return { condition: 'seminuevas' };
  if (condition === 'remanufacturados') return { condition: 'remanufacturadas' };
  return {};
}

function inferShowcaseCondition(text: string): ShowcaseConditionId | undefined {
  const n = text.toLowerCase();
  if (n.includes('remanufactur')) return 'remanufacturadas';
  if (n.includes('seminuev')) return 'seminuevas';
  if (/(^|[^a-z])nuev/.test(n)) return 'nuevas';
  return undefined;
}

function inferShowcaseFilter(categoryId: ShowcaseCategoryId, text: string): string | undefined {
  const n = text.toLowerCase();
  if (categoryId === 'impresoras') {
    if (n.includes('termic')) return 'termica';
    if (n.includes('tinta') || n.includes('inkjet')) return 'tinta';
    if (n.includes('matricial')) return 'matricial';
    if (n.includes('laser') || n.includes('láser')) return 'laser';
  }
  if (categoryId === 'toner' || categoryId === 'repuestos') {
    if (n.includes('original')) return 'originales';
    if (n.includes('compatible')) return 'compatibles';
    if (n.includes('remanufactur')) return 'remanufacturados';
  }
  return undefined;
}

function inferFormatoAnchoDeviceClass(text: string): 'plotter' | 'multifuncional' | undefined {
  const n = text.toLowerCase();
  if (n.includes('plotter')) return 'plotter';
  if (n.includes('multifuncional')) return 'multifuncional';
  return undefined;
}

export type CatalogSlugToStorePathOptions = {
  subSlug?: string | null;
  condition?: ProductCondition | null;
  extraPath?: string | null;
  searchParams?: URLSearchParams;
};

/** Convierte un slug de catálogo (`/categoria/...`) a la vitrina de Comprar. */
export function catalogSlugToStorePath(
  slug: string,
  options: CatalogSlugToStorePathOptions = {},
): string {
  if (slug === 'software') return '/software';
  if (slug === 'alquiler') return serviceHubPath('alquiler');
  if (slug === 'servicio-tecnico') return serviceHubPath('servicio-tecnico');

  const categoryId = CATALOG_SLUG_TO_SHOWCASE[slug];
  if (!categoryId) return '/tienda';

  const estadoParam = options.searchParams?.get('estado') ?? '';
  const haystack = [options.subSlug, options.extraPath, estadoParam]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ');

  const fromProductCondition = options.condition
    ? productConditionToShowcase(options.condition, categoryId)
    : {};

  let condition = fromProductCondition.condition ?? inferShowcaseCondition(haystack);
  const filter = fromProductCondition.filter ?? inferShowcaseFilter(categoryId, haystack);
  const deviceClass =
    categoryId === 'formato-ancho' ? inferFormatoAnchoDeviceClass(haystack) : undefined;

  if (
    (categoryId === 'laptops' || categoryId === 'escaneres') &&
    condition === 'remanufacturadas'
  ) {
    condition = 'seminuevas';
  }

  return buildShowcaseHref(categoryId, {
    ...(filter ? { filter } : {}),
    ...(deviceClass ? { deviceClass } : {}),
    ...(condition ? { condition } : {}),
  });
}

/** Redirige URLs antiguas `/categoria/:slug` (y segmentos extra) a Comprar. */
export function categoryRedirectFromLocation(pathname: string, search = ''): string {
  const match = pathname.match(/^\/categoria\/([^/]+)(?:\/(.*))?$/);
  if (!match?.[1]) return '/tienda';

  const slug = decodeURIComponent(match[1]);
  const extraPath = match[2] ? decodeURIComponent(match[2]) : null;
  const rawSearch = search.startsWith('?') ? search.slice(1) : search;
  const searchParams = new URLSearchParams(rawSearch);

  return catalogSlugToStorePath(slug, {
    subSlug: searchParams.get('sub'),
    extraPath,
    searchParams,
  });
}

/** Entrada desde vitrinas (home, mega menú): misma vista que Comprar. */
export function categoryLandingPath(slug: string): string {
  return catalogSlugToStorePath(slug);
}

/** Parsea `/categoria/:slug` (+ `?sub=`) desde un href relativo o absoluto. */
export function parseCategoryHref(href: string): { slug: string; subSlug: string | null } | null {
  try {
    const url = new URL(href, 'https://haitech.pe');
    const match = url.pathname.match(/^\/categoria\/([^/]+)/);
    if (!match?.[1]) return null;
    return {
      slug: decodeURIComponent(match[1]),
      subSlug: url.searchParams.get('sub'),
    };
  } catch {
    return null;
  }
}

export function categoryPath(slug: string, subSlug?: string | null): string {
  if (subSlug == null) return catalogSlugToStorePath(slug);
  return catalogSlugToStorePath(slug, { subSlug });
}

export function categoryPathWithCondition(
  slug: string,
  condition: ProductCondition,
  subSlug?: string | null,
): string {
  if (subSlug == null) return catalogSlugToStorePath(slug, { condition });
  return catalogSlugToStorePath(slug, { subSlug, condition });
}

export function storeMostViewedOffersPath(): string {
  const params = new URLSearchParams();
  params.set('attrs', MOST_VIEWED_OFFER_ATTR_KEY);
  return `/tienda?${params.toString()}`;
}

export function scrollToCategoryHero(behavior: ScrollBehavior = 'smooth') {
  const target = document.getElementById(CATEGORY_HERO_ID);
  if (!target) return;
  target.scrollIntoView({ behavior, block: 'start' });
}

export function scrollToCategoryProducts(behavior: ScrollBehavior = 'smooth') {
  const target = document.getElementById(CATEGORY_PRODUCTS_ID);
  if (!target) return;
  target.scrollIntoView({ behavior, block: 'start' });
}

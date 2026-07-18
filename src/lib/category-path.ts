export const CATEGORY_HERO_ID = 'categoria-hero';
export const CATEGORY_PRODUCTS_ID = 'categoria-productos';

import type { ProductCondition } from '@/lib/product-condition';
import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';
// @ts-ignore módulo JS compartido sin declaración de tipos
import { MOST_VIEWED_OFFER_ATTR_KEY } from '../../shared/catalog-most-viewed-offers.js';

function categoryQueryString(subSlug?: string | null, condition?: ProductCondition | null): string {
  const params = new URLSearchParams();
  if (subSlug) params.set('sub', subSlug);
  if (condition) params.set('estado', condition);
  const query = params.toString();
  return query ? `?${query}` : '';
}

/** Entrada desde vitrinas (home, mega menú): hero + subcategorías visibles al cargar. */
export function categoryLandingPath(slug: string): string {
  if (slug === 'multifuncionales') {
    return `/categoria/${slug}?sub=${ALL_SUBCATEGORIES_QUERY}`;
  }
  return `/categoria/${slug}`;
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
  return `/categoria/${slug}${categoryQueryString(subSlug)}#${CATEGORY_PRODUCTS_ID}`;
}

export function categoryPathWithCondition(
  slug: string,
  condition: ProductCondition,
  subSlug?: string | null,
): string {
  return `/categoria/${slug}${categoryQueryString(subSlug, condition)}#${CATEGORY_PRODUCTS_ID}`;
}

export function storeMostViewedOffersPath(): string {
  const params = new URLSearchParams();
  params.set('attrs', MOST_VIEWED_OFFER_ATTR_KEY);
  return `/tienda?${params.toString()}#${CATEGORY_PRODUCTS_ID}`;
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

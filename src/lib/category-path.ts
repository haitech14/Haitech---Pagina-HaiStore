export const CATEGORY_HERO_ID = 'categoria-hero';
export const CATEGORY_PRODUCTS_ID = 'categoria-productos';

import type { ProductCondition } from '@/lib/product-condition';
import { ALL_SUBCATEGORIES_QUERY } from '@/lib/store-category-display';

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

export function categoryPathAll(slug: string, subSlug?: string | null): string {
  return `/categoria/${slug}${categoryQueryString(subSlug)}#${CATEGORY_PRODUCTS_ID}`;
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

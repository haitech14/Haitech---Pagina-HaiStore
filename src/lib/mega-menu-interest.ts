import {
  findBrandBySlug,
  getBrandSlug,
  printerBrands,
  type Brand,
} from '@/data/brands';
import type { FeaturedProduct } from '@/data/featured-products';
import {
  catalogRowToFeatured,
  getCatalogRows,
  productMatchesCategories,
} from '@/lib/catalog-featured';
import { CATEGORY_PRODUCTS_ID, categoryLandingPath } from '@/lib/category-path';

const DEFAULT_PRODUCT_LIMIT = 4;
const BRAND_SCAN_LIMIT = 80;
const DEFAULT_BRAND_LIMIT = 6;

function categoryRowsForLabels(labels: readonly string[]) {
  if (labels.length === 0) return [];
  return getCatalogRows().filter((row) => productMatchesCategories(row.category, labels));
}

/** Productos en stock (prioridad) para el panel «Te puede interesar» del mega menú. */
export function getMegaMenuInterestProducts(
  labels: readonly string[],
  limit = DEFAULT_PRODUCT_LIMIT,
): FeaturedProduct[] {
  const rows = categoryRowsForLabels(labels);
  if (rows.length === 0) return [];

  const ranked = [...rows].sort((a, b) => {
    const stockA = (a.stock ?? 0) > 0 ? 1 : 0;
    const stockB = (b.stock ?? 0) > 0 ? 1 : 0;
    if (stockB !== stockA) return stockB - stockA;
    const newA = a.is_new ? 1 : 0;
    const newB = b.is_new ? 1 : 0;
    if (newB !== newA) return newB - newA;
    return String(a.name).localeCompare(String(b.name), 'es');
  });

  return ranked.slice(0, limit).map((row) => catalogRowToFeatured(row));
}

/** Marcas presentes en la categoría (con logo cuando existe en printerBrands). */
export function getMegaMenuInterestBrands(
  labels: readonly string[],
  limit = DEFAULT_BRAND_LIMIT,
): Brand[] {
  const rows = categoryRowsForLabels(labels).slice(0, BRAND_SCAN_LIMIT);
  const seen = new Set<string>();
  const brands: Brand[] = [];

  for (const row of rows) {
    const raw = typeof row.brand === 'string' ? row.brand.trim() : '';
    if (!raw) continue;
    const slug = getBrandSlug({ name: raw, logo: '' });
    if (seen.has(slug)) continue;
    seen.add(slug);
    const known = findBrandBySlug(slug) ?? printerBrands.find((b) => getBrandSlug(b) === slug);
    brands.push(known ?? { name: raw, logo: '' });
    if (brands.length >= limit) break;
  }

  return brands;
}

export function megaMenuCategorySectionHref(categoryHref: string): string {
  if (categoryHref.includes('#')) return categoryHref;
  return `${categoryHref}#${CATEGORY_PRODUCTS_ID}`;
}

export function megaMenuCategoryBrandHref(categorySlug: string, brand: Brand): string {
  const base = categoryLandingPath(categorySlug);
  try {
    const url = new URL(base, 'https://haitech.pe');
    url.searchParams.set('marca', getBrandSlug(brand));
    return `${url.pathname}${url.search}#${CATEGORY_PRODUCTS_ID}`;
  } catch {
    return `${base}${base.includes('?') ? '&' : '?'}marca=${getBrandSlug(brand)}#${CATEGORY_PRODUCTS_ID}`;
  }
}

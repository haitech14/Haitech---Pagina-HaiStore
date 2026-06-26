import { categories } from '@/data/categories';
import { megaMenuServiceLinks } from '@/data/mega-menu';
import { productMatchesCategoryFilter, productMatchesCategoryFilterTree } from '@/lib/inventory-categories';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';
import { productMatchesCategorySlugFilter } from '../../shared/home-catalog-filter.js';
import {
  compareProductSearchRelevance,
  normalizeCatalogSearchText,
  productMatchesSearchQuery,
  productSearchHaystack,
  sortProductsBySearchRelevance,
} from '../../shared/catalog-search.js';

export const MIN_PRODUCT_SEARCH_LENGTH = 3;
export const PRODUCT_SEARCH_INITIAL_VISIBLE = 12;
export const PRODUCT_SEARCH_LOAD_MORE_STEP = 5;
export const PRODUCT_SEARCH_MAX_LIMIT = 24;
/** @deprecated Usar PRODUCT_SEARCH_INITIAL_VISIBLE + paginación en el panel. */
export const PRODUCT_SEARCH_SUGGESTION_LIMIT = PRODUCT_SEARCH_MAX_LIMIT;
export const SEARCH_CATEGORY_SUGGESTION_LIMIT = 3;
export const SEARCH_SERVICE_SUGGESTION_LIMIT = 2;

export function normalizeSearchText(value: string): string {
  return normalizeCatalogSearchText(value);
}

function searchTerms(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean);
}

function textMatchesSearchQuery(haystack: string, query: string): boolean {
  const terms = searchTerms(query);
  if (terms.length === 0) return false;
  const normalizedHaystack = normalizeSearchText(haystack);
  return terms.every((term) => normalizedHaystack.includes(term));
}

export { productMatchesSearchQuery, productSearchHaystack };

export interface SearchCategorySuggestion {
  type: 'category';
  slug: string;
  name: string;
  subtitle: string;
}

export interface SearchServiceSuggestion {
  type: 'service';
  href: string;
  name: string;
  subtitle: string;
}

export function filterCategoriesBySearch(
  query: string,
  limit = SEARCH_CATEGORY_SUGGESTION_LIMIT,
): SearchCategorySuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return [];
  }

  return categories
    .filter(
      (category) =>
        textMatchesSearchQuery(`${category.name} ${category.tagline}`, query) ||
        category.inventoryCategories?.some((label) => textMatchesSearchQuery(label, query)),
    )
    .slice(0, limit)
    .map((category) => ({
      type: 'category' as const,
      slug: category.slug,
      name: category.name,
      subtitle: category.tagline,
    }));
}

export function filterServicesBySearch(
  query: string,
  limit = SEARCH_SERVICE_SUGGESTION_LIMIT,
): SearchServiceSuggestion[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return [];
  }

  return megaMenuServiceLinks
    .filter((service) => textMatchesSearchQuery(`${service.label} ${service.description}`, query))
    .slice(0, limit)
    .map((service) => ({
      type: 'service' as const,
      href: service.href,
      name: service.label,
      subtitle: service.description,
    }));
}

export interface SearchProductCategoryGroup {
  category: string;
  products: Product[];
}

function normalizeSearchCategoryLabel(value: string): string {
  return normalizeSearchText(value ?? '').trim().toLowerCase();
}

function isTonerCategory(category: string): boolean {
  return /(toner|t[oó]ner)/i.test(category);
}

function getSearchCategorySortRank(category: string): number {
  const normalized = normalizeSearchCategoryLabel(category);
  if (!normalized) return 999;

  if (/multifuncion/.test(normalized)) return 0;
  if (/impresor/.test(normalized)) return 1;
  if (/(formato ancho|plotter|copiadora|esc[aá]ner|scanner|equipo)/.test(normalized)) return 2;

  if (isTonerCategory(normalized)) {
    if (/(original|genuin|oem|oficial)/.test(normalized)) return 3;
    if (/(compatible|compatibl|alternativ|gen[eé]ric|repuesto|remplazo|reemplazo)/.test(normalized)) {
      return 4;
    }
    return 5;
  }

  if (/(consumible|suministro|cartucho|tinta|drum|unidad|rodillo|filtro)/.test(normalized)) return 5;

  if (/repuesto|refacci[oó]n|pieza|partes/.test(normalized)) {
    if (/(compatible|compatibl|alternativ|gen[eé]ric)/.test(normalized)) return 7;
    return 6;
  }

  if (/accesorio|cable|adaptador|bandeja|cassette|charola/.test(normalized)) return 8;

  return 9;
}

function compareProductsForSearchPanel(a: Product, b: Product, query?: string): number {
  if (query?.trim()) {
    return compareProductSearchRelevance(a, b, query);
  }
  return a.name.localeCompare(b.name, 'es');
}

/** Emoji por división de inventario (equipos primero en el orden de grupos). */
export function getSearchCategoryEmoji(category: string): string {
  const normalized = normalizeSearchCategoryLabel(category);
  if (/multifuncion/.test(normalized)) return '🖨️';
  if (/impresor/.test(normalized)) return '🖨️';
  if (/(formato ancho|plotter|copiadora|esc[aá]ner|scanner|equipo)/.test(normalized)) return '🖨️';
  if (isTonerCategory(normalized)) return '🧴';
  if (/repuesto|refacci[oó]n|pieza/.test(normalized)) return '🔧';
  if (/accesorio|cable|adaptador|bandeja|cassette|charola/.test(normalized)) return '🔌';
  return '📦';
}

/** Agrupa resultados de búsqueda por categoría para el panel de sugerencias. */
export function groupSearchProductsByCategory(
  products: Product[],
  query?: string,
): SearchProductCategoryGroup[] {
  const groups = new Map<string, Product[]>();

  for (const product of products) {
    const category = product.category?.trim() || 'Sin categoría';
    const bucket = groups.get(category) ?? [];
    bucket.push(product);
    groups.set(category, bucket);
  }

  const sortProducts = (items: Product[]) => {
    if (query?.trim()) {
      return sortProductsBySearchRelevance(items, query);
    }
    return [...items].sort((a, b) => compareProductsForSearchPanel(a, b));
  };

  return Array.from(groups.entries())
    .sort(([a], [b]) => {
      const rankDiff = getSearchCategorySortRank(a) - getSearchCategorySortRank(b);
      if (rankDiff !== 0) return rankDiff;
      return a.localeCompare(b, 'es');
    })
    .map(([category, items]) => ({
      category,
      products: sortProducts(items),
    }));
}

/** Recorta grupos conservando el orden por división (equipos primero). */
export function limitSearchProductCategoryGroups(
  groups: SearchProductCategoryGroup[],
  limit: number,
): SearchProductCategoryGroup[] {
  if (limit <= 0) return [];

  const limited: SearchProductCategoryGroup[] = [];
  let count = 0;

  for (const group of groups) {
    const products: Product[] = [];
    for (const product of group.products) {
      if (count >= limit) break;
      products.push(product);
      count += 1;
    }
    if (products.length > 0) {
      limited.push({ category: group.category, products });
    }
    if (count >= limit) break;
  }

  return limited;
}

export function filterProductsBySearch(
  products: Product[],
  query: string,
  options: {
    categoryFilter?: string;
    categoryTree?: StoreCategoryTreeNode[];
    limit?: number;
  } = {},
): Product[] {
  const normalizedQuery = normalizeSearchText(query);
  if (normalizedQuery.length < MIN_PRODUCT_SEARCH_LENGTH) {
    return [];
  }

  const categoryFilter = options.categoryFilter?.trim() || 'all';
  let list = products.filter((product) => productMatchesSearchQuery(product, query));

  if (categoryFilter !== 'all') {
    const tree = options.categoryTree ?? [];
    list = list.filter((product) =>
      tree.length > 0
        ? productMatchesCategoryFilterTree(product, categoryFilter, tree)
        : productMatchesCategorySlugFilter(product, categoryFilter),
    );
  }

  const sorted = sortProductsBySearchRelevance(list, query);
  const limit = options.limit;
  return limit != null && limit > 0 ? sorted.slice(0, limit) : sorted;
}

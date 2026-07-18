import { compareCatalogProductsBySort, isCatalogPriceOnRequest } from '../../shared/catalog-price-sort.js';
import { applyEquipmentSubcategorySlugFilter } from '../../shared/category-inventory-labels.js';
import {
  isPrinterEquipmentProduct,
  productMatchesCategoryFilter,
  productMatchesCondition,
} from '../../shared/home-catalog-filter.js';
import { productMatchesCatalogFamily } from '@/lib/product-condition';
import {
  productMatchesSearchQuery,
  sortProductsBySearchRelevance,
} from '../../shared/catalog-search.js';
import {
  buildBrandFilterOptions,
  productMatchesBrandFilter,
} from '../../shared/catalog-brand-filter.js';
import {
  productMatchesCatalogAttributeFilters,
} from '../../shared/catalog-attribute-filters.js';
import {
  MOST_VIEWED_OFFER_ATTR_KEY,
  appendMostViewedOfferFacet,
  compareProductsByViewCount,
  resolveMostViewedOfferProductIds,
} from '../../shared/catalog-most-viewed-offers.js';
import { productMatchesSpeedFilterKeys } from '../../shared/catalog-speed-filter.js';
import { getCatalogMediaEpoch, getCatalogRows, loadCatalogIndex } from '@/lib/catalog-featured';
import { dedupeCatalogProductsById } from '@/lib/category-catalog-filters';
import { toPublicProduct } from '@/lib/pricing';
import type { UseCategoryCatalogParams, CategoryCatalogResponse } from '@/hooks/use-category-catalog';
import type { Product } from '@/types/product';

type PublicProductsCache = {
  role: string;
  rowCount: number;
  epoch: number;
  firstId: string;
  products: Product[];
};

let publicProductsCache: PublicProductsCache | null = null;

/** Lista pública cacheada por rol; evita remapear ~1474 filas en cada navegación. */
function getPublicProductsForRole(
  role: string,
  catalogRows: ReturnType<typeof getCatalogRows>,
): Product[] {
  const epoch = getCatalogMediaEpoch();
  const firstId = catalogRows[0]?.id ?? '';
  if (
    publicProductsCache &&
    publicProductsCache.role === role &&
    publicProductsCache.rowCount === catalogRows.length &&
    publicProductsCache.epoch === epoch &&
    publicProductsCache.firstId === firstId
  ) {
    return publicProductsCache.products;
  }

  const products = catalogRows.map((row) => toPublicProduct(row, role));
  publicProductsCache = {
    role,
    rowCount: catalogRows.length,
    epoch,
    firstId,
    products,
  };
  return products;
}

function productMatchesAttributeFilters(
  product: Product,
  attributeKeys: string[],
  productionKey: string | null,
  offerIds: Set<string>,
): boolean {
  return productMatchesCatalogAttributeFilters(
    product,
    attributeKeys,
    productionKey,
    offerIds,
  );
}

function compareProducts(sortBy: string, a: Product, b: Product): number {
  return compareCatalogProductsBySort(sortBy, a, b);
}

function buildAttributeFacets(products: Product[]) {
  const map = new Map<string, { key: string; label: string; count: number }>();
  for (const product of products) {
    for (const attr of product.attributes ?? []) {
      if (!attr?.name || !attr?.value) continue;
      const key = `${attr.name}::${attr.value}`;
      if (
        key.includes('Producción') ||
        key.includes('Modelo de equipo') ||
        key.includes('Rendimiento')
      ) {
        continue;
      }
      const label = `${attr.name}: ${attr.value}`;
      const prev = map.get(key);
      map.set(key, { key, label, count: (prev?.count ?? 0) + 1 });
    }
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'),
  );
}

function buildPriceRange(products: Product[]) {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((product) => product.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

function filterByCategoryLabels(products: Product[], labels: string[], slug: string): Product[] {
  if (slug === 'impresoras') {
    return products.filter((product) => productMatchesCatalogFamily(product, 'impresoras'));
  }
  if (slug === 'sin-categoria') {
    return products.filter((product) => !String(product.category ?? '').trim());
  }
  return products.filter((product) => {
    if (slug === 'repuestos' && isPrinterEquipmentProduct(product)) {
      return false;
    }
    return labels.some((label) => productMatchesCategoryFilter(product, label));
  });
}

function catalogFamilyForSlug(slug: string): string | null {
  if (slug === 'multifuncionales' || slug === 'impresoras' || slug === 'toner-suministros') {
    return slug;
  }
  if (slug === 'repuestos') return 'repuestos';
  return null;
}

function queryCategoryCatalogFromRows(
  params: UseCategoryCatalogParams,
  role: string,
  catalogRows: ReturnType<typeof getCatalogRows>,
): CategoryCatalogResponse {
  const slug = params.slug ?? '';
  const labels = params.labels ?? [];
  const catalogFamily = catalogFamilyForSlug(slug);
  const allProducts = getPublicProductsForRole(role, catalogRows);

  let matched =
    labels.length > 0 ? filterByCategoryLabels(allProducts, labels, slug) : allProducts;

  if (params.subSlug) {
    matched = applyEquipmentSubcategorySlugFilter(matched, params.subSlug);
  }

  const facetBase = [...matched];
  const mostViewedOfferIds = resolveMostViewedOfferProductIds(facetBase);

  if (params.condition && catalogFamily) {
    matched = matched.filter((product) =>
      productMatchesCondition(product, params.condition!, catalogFamily),
    );
  }

  if (params.inStockOnly) {
    matched = matched.filter((product) => product.stock > 0);
  }

  const facets = {
    attributes: appendMostViewedOfferFacet(buildAttributeFacets(facetBase), mostViewedOfferIds),
    brands: buildBrandFilterOptions(facetBase),
    priceRange: buildPriceRange(facetBase),
  };

  const min = params.priceMin ?? facets.priceRange.min;
  const max = params.priceMax ?? facets.priceRange.max;
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  matched = matched.filter((product) => {
    if (isCatalogPriceOnRequest(product.price)) return true;
    return product.price >= safeMin && product.price <= safeMax;
  });

  if ((params.attributeKeys?.length ?? 0) > 0 || params.productionKey) {
    matched = matched.filter((product) =>
      productMatchesAttributeFilters(
        product,
        params.attributeKeys ?? [],
        params.productionKey ?? null,
        mostViewedOfferIds,
      ),
    );
  }

  if (params.speedKeys?.length) {
    matched = matched.filter((product) => productMatchesSpeedFilterKeys(product, params.speedKeys!));
  }

  if ((params.brandKeys?.length ?? 0) > 0) {
    matched = matched.filter((product) =>
      productMatchesBrandFilter(product, params.brandKeys ?? []),
    );
  }

  const trimmedSearch = String(params.search ?? '').trim();
  const sortBy = params.sortBy ?? 'price-asc';
  const sortByMostViewed = (params.attributeKeys ?? []).includes(MOST_VIEWED_OFFER_ATTR_KEY);
  if (trimmedSearch.length >= 3) {
    matched = matched.filter((product) => productMatchesSearchQuery(product, trimmedSearch));
    matched = sortProductsBySearchRelevance(matched, trimmedSearch);
  } else if (sortByMostViewed) {
    matched.sort((a, b) => {
      const byViews = compareProductsByViewCount(a, b);
      if (byViews !== 0) return byViews;
      return compareProducts(sortBy, a, b);
    });
  } else {
    matched.sort((a, b) => compareProducts(sortBy, a, b));
  }

  matched = dedupeCatalogProductsById(matched);

  const safeLimit = Math.min(Math.max(Number(params.limit) || 30, 1), 500);
  const safePage = Math.max(Number(params.page) || 1, 1);
  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;

  return {
    products: matched.slice(start, start + safeLimit),
    total,
    page: safePage,
    totalPages,
    limit: safeLimit,
    facets,
  };
}

/** Catálogo filtrado en cliente (inventory-index.json) cuando la API no responde. */
export function queryCategoryCatalogClient(
  params: UseCategoryCatalogParams,
  role: string,
): CategoryCatalogResponse {
  return queryCategoryCatalogFromRows(params, role, getCatalogRows());
}

export async function queryCategoryCatalogClientAsync(
  params: UseCategoryCatalogParams,
  role: string,
): Promise<CategoryCatalogResponse> {
  const rows = getCatalogRows();
  const catalogRows = rows.length > 0 ? rows : await loadCatalogIndex();
  return queryCategoryCatalogFromRows(params, role, catalogRows);
}

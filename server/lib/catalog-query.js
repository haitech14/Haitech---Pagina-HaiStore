import { readInventory, toPublicProductList } from './inventory-store.js';
import { listProducts, withResolvedMedia } from './product-catalog.js';
import { resolveEquipmentConsumables } from '../../shared/product-equipment-consumables.js';
import {
  isPrinterEquipmentProduct,
  productMatchesCategoryFilter,
  productMatchesCatalogFamily,
  productMatchesCondition,
} from '../../shared/home-catalog-filter.js';
import {
  applyEquipmentSubcategorySlugFilter,
  catalogFamilyForSlug,
} from '../../shared/category-inventory-labels.js';
import {
  productMatchesSearchQuery,
  sortProductsBySearchRelevance,
} from '../../shared/catalog-search.js';
import { normalizeCatalogSearchText } from '../../shared/catalog-search-normalize.js';
import { findInventoryProductByLookupKey } from '../../shared/product-lookup.js';
import {
  buildBrandFacets,
  productMatchesBrandFilter,
} from '../../shared/catalog-brand-filter.js';
import {
  productMatchesCatalogAttributeFilters,
  resolveProductCatalogAttributeKeys,
} from '../../shared/catalog-attribute-filters.js';
import {
  MOST_VIEWED_OFFER_ATTR_KEY,
  appendMostViewedOfferFacet,
  compareProductsByViewCount,
  resolveMostViewedOfferProductIds,
} from '../../shared/catalog-most-viewed-offers.js';

function normalizeSearchText(value) {
  return normalizeCatalogSearchText(value);
}

function productMatchesAttributeFilters(product, attributeKeys, productionKey, offerIds) {
  return productMatchesCatalogAttributeFilters(
    product,
    attributeKeys,
    productionKey,
    offerIds,
  );
}

function compareProducts(sortBy, a, b) {
  if (sortBy === 'price-asc' && a.price !== b.price) return a.price - b.price;
  if (sortBy === 'price-desc' && a.price !== b.price) return b.price - a.price;
  if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'es');
  const ao = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.name.localeCompare(b.name, 'es');
}

function buildAttributeFacets(products) {
  const map = new Map();
  for (const product of products) {
    for (const attr of product.attributes ?? []) {
      if (!attr?.name || !attr?.value) continue;
      const key = `${attr.name}::${attr.value}`;
      if (key.includes('Producción') || key.includes('Modelo de equipo') || key.includes('Rendimiento')) {
        continue;
      }
      const label = `${attr.name}: ${attr.value}`;
      const prev = map.get(key);
      map.set(key, { key, label, count: (prev?.count ?? 0) + 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
}

function buildPriceRange(products) {
  if (products.length === 0) return { min: 0, max: 0 };
  const prices = products.map((product) => product.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}

async function loadPublicProducts(role) {
  return listProducts({ role, adminView: false });
}

function parsePipeList(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw.split('|').map((entry) => entry.trim()).filter(Boolean);
}

function filterByCategoryLabels(products, labels, slug) {
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

function productCategoryTags(product) {
  const raw = String(product.category ?? '').trim();
  if (!raw) return [];
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [raw];
}

function buildLabelProductIndex(products) {
  const index = new Map();
  for (const product of products) {
    const keys = new Set(
      productCategoryTags(product).map((tag) => normalizeSearchText(tag)).filter(Boolean),
    );
    const rawCategory = String(product.category ?? '').trim();
    if (rawCategory) keys.add(normalizeSearchText(rawCategory));

    for (const key of keys) {
      if (!index.has(key)) index.set(key, []);
      index.get(key).push(product);
    }
  }
  return index;
}

function filterByCategoryLabelsIndexed(products, labels, slug, labelIndex) {
  if (!labelIndex || labels.length === 0 || slug === 'impresoras' || slug === 'sin-categoria') {
    return filterByCategoryLabels(products, labels, slug);
  }

  const candidateIds = new Set();
  const candidates = [];
  for (const label of labels) {
    const bucket = labelIndex.get(normalizeSearchText(label)) ?? [];
    for (const product of bucket) {
      if (candidateIds.has(product.id)) continue;
      candidateIds.add(product.id);
      candidates.push(product);
    }
  }

  return candidates.filter((product) => {
    if (slug === 'repuestos' && isPrinterEquipmentProduct(product)) return false;
    return labels.some((label) => productMatchesCategoryFilter(product, label));
  });
}

/** @type {Map<string, Map<string, unknown[]>>} */
const categoryLabelIndexCache = new Map();

function dedupeProductsById(products) {
  const seen = new Set();
  const result = [];
  for (const product of products) {
    if (seen.has(product.id)) continue;
    seen.add(product.id);
    result.push(product);
  }
  return result;
}

/**
 * Catálogo paginado por categoría con filtros server-side.
 */
const CATEGORY_CATALOG_CACHE_TTL_MS = 5 * 60 * 1000;
const CATEGORY_CATALOG_CACHE_MAX = 128;

/** @type {Map<string, { payload: object; cachedAt: number }>} */
const categoryCatalogCache = new Map();

export function invalidateCategoryCatalogCache() {
  categoryCatalogCache.clear();
  categoryLabelIndexCache.clear();
}

function buildCategoryCatalogCacheKey(params) {
  return JSON.stringify({
    role: params.role,
    slug: params.slug,
    subSlug: params.subSlug,
    labels: params.labels,
    condition: params.condition,
    inStockOnly: params.inStockOnly,
    priceMin: params.priceMin,
    priceMax: params.priceMax,
    brandKeys: params.brandKeys,
    attributeKeys: params.attributeKeys,
    productionKey: params.productionKey,
    search: params.search,
    sortBy: params.sortBy,
    page: params.page,
    limit: params.limit,
  });
}

export async function queryProductsByCategory({
  role = 'public',
  slug = '',
  subSlug = null,
  labels = [],
  condition = null,
  inStockOnly = false,
  priceMin = null,
  priceMax = null,
  brandKeys = [],
  attributeKeys = [],
  productionKey = null,
  search = '',
  sortBy = 'price-asc',
  page = 1,
  limit = 30,
} = {}) {
  const cacheKey = buildCategoryCatalogCacheKey({
    role,
    slug,
    subSlug,
    labels,
    condition,
    inStockOnly,
    priceMin,
    priceMax,
    brandKeys,
    attributeKeys,
    productionKey,
    search,
    sortBy,
    page,
    limit,
  });
  const now = Date.now();
  const cached = categoryCatalogCache.get(cacheKey);
  if (cached && now - cached.cachedAt < CATEGORY_CATALOG_CACHE_TTL_MS) {
    return cached.payload;
  }

  const safeLabels = labels.length > 0 ? labels : [];
  const catalogFamily = catalogFamilyForSlug(slug);
  const allProducts = await loadPublicProducts(role);

  let labelIndex = categoryLabelIndexCache.get(role);
  if (!labelIndex) {
    labelIndex = buildLabelProductIndex(allProducts);
    categoryLabelIndexCache.set(role, labelIndex);
  }

  let matched =
    safeLabels.length > 0
      ? filterByCategoryLabelsIndexed(allProducts, safeLabels, slug, labelIndex)
      : allProducts;

  if (subSlug) {
    matched = applyEquipmentSubcategorySlugFilter(matched, subSlug);
  }

  const facetBase = [...matched];
  const mostViewedOfferIds = resolveMostViewedOfferProductIds(facetBase);

  if (condition && catalogFamily) {
    matched = matched.filter((product) => productMatchesCondition(product, condition, catalogFamily));
  }

  if (inStockOnly) {
    matched = matched.filter((product) => product.stock > 0);
  }

  const facets = {
    attributes: appendMostViewedOfferFacet(buildAttributeFacets(facetBase), mostViewedOfferIds),
    brands: buildBrandFacets(facetBase),
    priceRange: buildPriceRange(facetBase),
  };

  const min = priceMin ?? facets.priceRange.min;
  const max = priceMax ?? facets.priceRange.max;
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  matched = matched.filter((product) => product.price >= safeMin && product.price <= safeMax);

  if (attributeKeys.length > 0 || productionKey) {
    matched = matched.filter((product) =>
      productMatchesAttributeFilters(product, attributeKeys, productionKey, mostViewedOfferIds),
    );
  }

  if (brandKeys.length > 0) {
    matched = matched.filter((product) => productMatchesBrandFilter(product, brandKeys));
  }

  const trimmedSearch = String(search ?? '').trim();
  const sortByMostViewed = attributeKeys.includes(MOST_VIEWED_OFFER_ATTR_KEY);
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

  matched = dedupeProductsById(matched);

  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 500);
  const safePage = Math.max(Number(page) || 1, 1);
  const total = matched.length;
  const totalPages = Math.max(1, Math.ceil(total / safeLimit));
  const start = (safePage - 1) * safeLimit;

  const payload = {
    products: matched.slice(start, start + safeLimit),
    total,
    page: safePage,
    totalPages,
    limit: safeLimit,
    facets,
  };

  if (categoryCatalogCache.size >= CATEGORY_CATALOG_CACHE_MAX) {
    const oldestKey = categoryCatalogCache.keys().next().value;
    if (oldestKey) categoryCatalogCache.delete(oldestKey);
  }
  categoryCatalogCache.set(cacheKey, { payload, cachedAt: now });

  return payload;
}

export async function queryProductsByIds({ role = 'public', ids = [] } = {}) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))];
  if (uniqueIds.length === 0) return { products: [] };

  const { products: inventoryRows } = await readInventory();
  const allProducts = await loadPublicProducts(role);
  const byId = new Map(allProducts.map((product) => [product.id, product]));

  const resolveProduct = (lookupId) => {
    const direct = byId.get(lookupId);
    if (direct) return direct;
    const inventoryRow = findInventoryProductByLookupKey(inventoryRows, lookupId);
    if (!inventoryRow) return undefined;
    return byId.get(inventoryRow.id);
  };

  return {
    products: uniqueIds.map((id) => resolveProduct(id)).filter(Boolean),
  };
}

function isPrinterEquipment(product) {
  const haystack = `${product.category ?? ''} ${product.name}`.toLowerCase();
  return haystack.includes('multifuncional') || haystack.includes('impresora');
}

export async function queryRelatedProducts({ id, role = 'public', limit = 8 } = {}) {
  const allProducts = await loadPublicProducts(role);
  const source = allProducts.find((product) => product.id === id);
  if (!source || !isPrinterEquipment(source)) {
    return { products: [] };
  }

  const sourceKeys = resolveProductCatalogAttributeKeys(source);
  const formatoKey = [...sourceKeys].find((key) => key.startsWith('Formato papel::'));

  const related = allProducts
    .filter((product) => {
      if (product.id === id || !isPrinterEquipment(product)) return false;
      if (formatoKey) {
        return resolveProductCatalogAttributeKeys(product).has(formatoKey);
      }
      return product.category === source.category;
    })
    .slice(0, Math.min(Math.max(limit, 1), 24));

  return {
    products: related.map((product) => toPublicProductList(product, role)),
  };
}

export async function queryEquipmentConsumables({ id, role = 'public' } = {}) {
  const allProducts = await loadPublicProducts(role);
  const equipment = allProducts.find((product) => product.id === id);
  if (!equipment) return { groups: [] };
  return { groups: resolveEquipmentConsumables(equipment, allProducts) };
}

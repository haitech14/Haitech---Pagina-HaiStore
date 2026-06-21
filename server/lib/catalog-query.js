import { readInventory, toPublicProductList, toPublicProductCard } from './inventory-store.js';
import { withResolvedMedia } from './product-catalog.js';
import { resolveEquipmentConsumables } from '../../shared/product-equipment-consumables.js';
import {
  isPrinterEquipmentProduct,
  productMatchesCategoryFilter,
  productMatchesCondition,
} from '../../shared/home-catalog-filter.js';
import { catalogFamilyForSlug } from '../../shared/category-inventory-labels.js';

function normalizeSearchText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function productSearchHaystack(product) {
  const attributes = Array.isArray(product.attributes) ? product.attributes : [];
  return [
    product.name,
    product.code,
    product.description,
    product.brand,
    product.category,
    ...attributes.map((attr) => `${attr.name ?? ''} ${attr.value ?? ''}`),
  ]
    .filter(Boolean)
    .join(' ');
}

function productMatchesSearchQuery(product, query) {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return false;
  const haystack = normalizeSearchText(productSearchHaystack(product));
  return terms.every((term) => haystack.includes(term));
}

function resolveAttributeKeys(product) {
  const keys = new Set();
  for (const attr of product.attributes ?? []) {
    if (attr?.name && attr?.value) {
      keys.add(`${attr.name}::${attr.value}`);
    }
  }
  return keys;
}

function productMatchesAttributeFilters(product, attributeKeys, productionKey) {
  const resolved = resolveAttributeKeys(product);
  if (attributeKeys.length > 0 && !attributeKeys.every((key) => resolved.has(key))) {
    return false;
  }
  if (productionKey && !resolved.has(productionKey)) return false;
  return true;
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
  const { products } = await readInventory();
  return products.map((product) => toPublicProductList(withResolvedMedia(product), role));
}

function parsePipeList(raw) {
  if (typeof raw !== 'string' || !raw.trim()) return [];
  return raw.split('|').map((entry) => entry.trim()).filter(Boolean);
}

function filterByCategoryLabels(products, labels, slug) {
  return products.filter((product) => {
    if (slug === 'repuestos' && isPrinterEquipmentProduct(product)) {
      return false;
    }
    return labels.some((label) => productMatchesCategoryFilter(product, label));
  });
}

/**
 * Catálogo paginado por categoría con filtros server-side.
 */
export async function queryProductsByCategory({
  role = 'public',
  slug = '',
  labels = [],
  condition = null,
  inStockOnly = false,
  priceMin = null,
  priceMax = null,
  attributeKeys = [],
  productionKey = null,
  search = '',
  sortBy = 'price-asc',
  page = 1,
  limit = 30,
} = {}) {
  const safeLabels = labels.length > 0 ? labels : [];
  const catalogFamily = catalogFamilyForSlug(slug);
  const allProducts = await loadPublicProducts(role);

  let matched =
    safeLabels.length > 0
      ? filterByCategoryLabels(allProducts, safeLabels, slug)
      : allProducts;

  const facetBase = [...matched];

  if (condition && catalogFamily) {
    matched = matched.filter((product) => productMatchesCondition(product, condition, catalogFamily));
  }

  if (inStockOnly) {
    matched = matched.filter((product) => product.stock > 0);
  }

  const facets = {
    attributes: buildAttributeFacets(facetBase),
    priceRange: buildPriceRange(facetBase),
  };

  const min = priceMin ?? facets.priceRange.min;
  const max = priceMax ?? facets.priceRange.max;
  const safeMin = Math.min(min, max);
  const safeMax = Math.max(min, max);

  matched = matched.filter((product) => product.price >= safeMin && product.price <= safeMax);

  if (attributeKeys.length > 0 || productionKey) {
    matched = matched.filter((product) =>
      productMatchesAttributeFilters(product, attributeKeys, productionKey),
    );
  }

  const trimmedSearch = String(search ?? '').trim();
  if (trimmedSearch.length >= 3) {
    matched = matched.filter((product) => productMatchesSearchQuery(product, trimmedSearch));
  }

  matched.sort((a, b) => compareProducts(sortBy, a, b));

  const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);
  const safePage = Math.max(Number(page) || 1, 1);
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

export async function queryProductsByIds({ role = 'public', ids = [] } = {}) {
  const uniqueIds = [...new Set(ids.filter((id) => typeof id === 'string' && id.length > 0))];
  if (uniqueIds.length === 0) return { products: [] };

  const allProducts = await loadPublicProducts(role);
  const byId = new Map(allProducts.map((product) => [product.id, product]));

  return {
    products: uniqueIds.map((id) => byId.get(id)).filter(Boolean),
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

  const sourceKeys = resolveAttributeKeys(source);
  const formatoKey = [...sourceKeys].find((key) => key.startsWith('Formato papel::'));

  const related = allProducts
    .filter((product) => {
      if (product.id === id || !isPrinterEquipment(product)) return false;
      if (formatoKey) {
        return resolveAttributeKeys(product).has(formatoKey);
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

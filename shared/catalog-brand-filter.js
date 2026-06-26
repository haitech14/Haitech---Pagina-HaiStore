export const BRAND_FILTER_OPTIONS = [
  { key: 'ricoh', label: 'RICOH' },
  { key: 'canon', label: 'Canon' },
  { key: 'pantum', label: 'Pantum' },
  { key: 'hp', label: 'HP' },
  { key: 'brother', label: 'Brother' },
  { key: 'epson', label: 'Epson' },
];

export function normalizeCatalogBrandKey(brand) {
  const trimmed = String(brand ?? '').trim();
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export function getCatalogBrandLabel(brand) {
  const trimmed = String(brand ?? '').trim();
  if (!trimmed) return null;
  return trimmed;
}

export function findBrandFilterOption(brandKey) {
  if (!brandKey) return null;
  const normalized = normalizeCatalogBrandKey(brandKey);
  return BRAND_FILTER_OPTIONS.find((option) => option.key === normalized) ?? null;
}

export function buildBrandFacets(products) {
  const map = new Map();
  for (const product of products) {
    const label = getCatalogBrandLabel(product.brand);
    const key = normalizeCatalogBrandKey(product.brand);
    if (!key || !label) continue;
    const prev = map.get(key);
    map.set(key, { key, label, count: (prev?.count ?? 0) + 1 });
  }
  return [...map.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'),
  );
}

/** Opciones fijas de marca con conteo sobre el catálogo visible. */
export function buildBrandFilterOptions(products) {
  const facetMap = new Map(
    buildBrandFacets(products).map((facet) => [facet.key, facet.count]),
  );
  return BRAND_FILTER_OPTIONS.map(({ key, label }) => ({
    key,
    label,
    count: facetMap.get(key) ?? 0,
  }));
}

export function countProductsForBrandFilterKey(products, brandKey) {
  return products.filter((product) => productMatchesBrandFilter(product, [brandKey])).length;
}

export function productMatchesBrandFilter(product, selectedBrandKeys) {
  if (!selectedBrandKeys?.length) return true;
  const key = normalizeCatalogBrandKey(product.brand);
  if (!key) return false;
  return selectedBrandKeys.includes(key);
}

/**
 * Orden de catálogo por precio: productos con precio numérico primero;
 * «Consultar Precio» (precio null/0/NaN) al final en cualquier criterio.
 */

export function isCatalogPriceOnRequest(price) {
  return price == null || !Number.isFinite(Number(price)) || Number(price) <= 0;
}

/** Precio efectivo para ordenar (price o prices.public). */
export function getCatalogSortPrice(product) {
  if (!product || typeof product !== 'object') return null;
  if (product.price != null && product.price !== '') {
    const direct = Number(product.price);
    if (Number.isFinite(direct)) return direct;
  }
  const pub = product.prices?.public;
  if (pub != null && pub !== '') {
    const fromPublic = Number(pub);
    if (Number.isFinite(fromPublic)) return fromPublic;
  }
  return null;
}

/**
 * @param {string} sortBy
 * @param {{ price?: number|null, prices?: { public?: number|null }, name?: string, sort_order?: number|null }} a
 * @param {{ price?: number|null, prices?: { public?: number|null }, name?: string, sort_order?: number|null }} b
 */
export function compareCatalogProductsBySort(sortBy, a, b) {
  const aPrice = getCatalogSortPrice(a);
  const bPrice = getCatalogSortPrice(b);
  const aOnRequest = isCatalogPriceOnRequest(aPrice);
  const bOnRequest = isCatalogPriceOnRequest(bPrice);
  if (aOnRequest !== bOnRequest) return aOnRequest ? 1 : -1;

  if (sortBy === 'price-asc' && aPrice !== bPrice) {
    return Number(aPrice) - Number(bPrice);
  }
  if (sortBy === 'price-desc' && aPrice !== bPrice) {
    return Number(bPrice) - Number(aPrice);
  }
  if (sortBy === 'name-asc') {
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'es');
  }

  const ao = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;

  return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'es');
}

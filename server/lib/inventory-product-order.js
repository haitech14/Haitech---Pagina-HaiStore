/**
 * Orden de productos en inventario y tienda.
 */

export function compareProductsBySortOrder(a, b) {
  const ao = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'es');
}

export function sortProductsByOrder(products) {
  return [...products].sort(compareProductsBySortOrder);
}

export function assignProductSortOrders(products) {
  return products.map((product, index) => ({ ...product, sort_order: index }));
}

/** Asigna sort_order si falta o hay huecos; devuelve { products, changed }. */
export function ensureProductSortOrders(products) {
  const sorted = sortProductsByOrder(products);
  const needsNormalize = sorted.some(
    (product, index) =>
      !Number.isFinite(Number(product.sort_order)) || Number(product.sort_order) !== index,
  );
  if (!needsNormalize) return { products: sorted, changed: false };
  return { products: assignProductSortOrders(sorted), changed: true };
}

export function reorderProductList(list, dragId, targetId) {
  const fromIndex = list.findIndex((item) => item.id === dragId);
  const toIndex = list.findIndex((item) => item.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return list;

  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

export function applyOrderedIds(products, orderedIds) {
  const byId = new Map(products.map((product) => [product.id, product]));
  const ordered = [];

  for (const id of orderedIds) {
    const product = byId.get(id);
    if (product) {
      ordered.push(product);
      byId.delete(id);
    }
  }

  for (const product of sortProductsByOrder([...byId.values()])) {
    ordered.push(product);
  }

  return assignProductSortOrders(ordered);
}

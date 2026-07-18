import type { ProductRolePrices } from '@/lib/roles';
import { ensureFullPrices } from '@/lib/roles';
import type { InventoryProduct } from '@/types/product';
import { isCatalogPriceOnRequest } from '../../shared/catalog-price-sort.js';

/** Precio público USD para ordenar listados. */
export function getProductPublicPriceUsd(product: {
  prices?: ProductRolePrices;
}): number {
  return Number(ensureFullPrices(product.prices ?? { public: 0 }).public) || 0;
}

/** Menor precio público primero; «Consultar Precio» al final; desempate por nombre. */
export function compareProductsByPublicPriceAsc(
  a: { prices?: ProductRolePrices; name: string },
  b: { prices?: ProductRolePrices; name: string },
): number {
  const aPrice = getProductPublicPriceUsd(a);
  const bPrice = getProductPublicPriceUsd(b);
  const aOnRequest = isCatalogPriceOnRequest(aPrice);
  const bOnRequest = isCatalogPriceOnRequest(bPrice);
  if (aOnRequest !== bOnRequest) return aOnRequest ? 1 : -1;

  const diff = aPrice - bPrice;
  if (diff !== 0) return diff;
  return a.name.localeCompare(b.name, 'es');
}

export function sortProductsByPublicPriceAsc<T extends { prices?: ProductRolePrices; name: string }>(
  products: T[],
): T[] {
  return [...products].sort(compareProductsByPublicPriceAsc);
}

/** Producto ordenable en tienda (inventario o catálogo público). */
export type ProductSortable = {
  sort_order?: number;
  name: string;
};

/** Orden ascendente por `sort_order`; desempate por nombre. */
export function compareProductsBySortOrder(a: ProductSortable, b: ProductSortable): number {
  const ao = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.name.localeCompare(b.name, 'es');
}

export function sortProductsByOrder<T extends ProductSortable>(products: T[]): T[] {
  return [...products].sort(compareProductsBySortOrder);
}

export function assignProductSortOrders<T extends InventoryProduct>(products: T[]): T[] {
  return products.map((product, index) => ({ ...product, sort_order: index }));
}

export function reorderProductList<T extends { id: string }>(
  list: T[],
  dragId: string,
  targetId: string,
): T[] {
  const fromIndex = list.findIndex((item) => item.id === dragId);
  const toIndex = list.findIndex((item) => item.id === targetId);
  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return list;

  const next = [...list];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return next;
}

/**
 * Reordena solo los productos visibles (p. ej. filtro de categoría) y conserva
 * el orden relativo del resto en la lista global.
 */
export function mergeVisibleProductReorder(
  allProducts: InventoryProduct[],
  visibleProducts: InventoryProduct[],
  dragId: string,
  targetId: string,
): InventoryProduct[] {
  const sortedAll = sortProductsByOrder(allProducts);
  const reorderedVisible = reorderProductList(
    sortProductsByOrder(visibleProducts),
    dragId,
    targetId,
  );
  const visibleIds = new Set(reorderedVisible.map((product) => product.id));
  let visibleIndex = 0;

  const merged = sortedAll.map((product) =>
    visibleIds.has(product.id) ? reorderedVisible[visibleIndex++]! : product,
  );

  return assignProductSortOrders(merged);
}

/** Mueve un producto a la posición indicada (1 = primero). */
export function moveProductToDisplayPosition(
  products: InventoryProduct[],
  productId: string,
  displayPosition: number,
): InventoryProduct[] {
  const sorted = sortProductsByOrder(products);
  const fromIndex = sorted.findIndex((product) => product.id === productId);
  if (fromIndex === -1) return sorted;

  const toIndex = Math.min(Math.max(0, displayPosition - 1), sorted.length - 1);
  const next = [...sorted];
  const [removed] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, removed);
  return assignProductSortOrders(next);
}

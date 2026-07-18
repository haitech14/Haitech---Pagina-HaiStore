/** Etiqueta compacta de stock sin unidades inmediatas (cards + portapapeles). */
export const PRODUCT_ON_REQUEST_STOCK_LABEL = 'A pedido';

/** Etiqueta en ficha de producto cuando stock ≤ 0 (sidebar de compra). */
export const PRODUCT_ON_REQUEST_STOCK_DETAIL_LABEL = 'Disponible bajo pedido';

/** Stock numérico seguro desde featured / producto. */
export function resolveFeaturedProductStock(product: { stock?: number | null }): number {
  return Math.max(0, Math.floor(Number(product.stock) || 0));
}

/**
 * Limita el carrusel conservando productos a pedido (stock 0).
 * Evita que el top-N por precio deje fuera solo los «A pedido».
 */
export function takeHomeDisplayProductsWithOnRequest<T extends { stock?: number | null }>(
  products: T[],
  limit: number,
): T[] {
  if (products.length <= limit) return products;

  const inStock: T[] = [];
  const onRequest: T[] = [];
  for (const product of products) {
    if (resolveFeaturedProductStock(product) > 0) inStock.push(product);
    else onRequest.push(product);
  }

  if (onRequest.length === 0 || inStock.length === 0) {
    return products.slice(0, limit);
  }

  const onRequestCount = Math.min(onRequest.length, Math.max(2, Math.ceil(limit / 4)));
  const inStockCount = Math.max(0, limit - onRequestCount);
  return [...inStock.slice(0, inStockCount), ...onRequest.slice(0, onRequestCount)];
}

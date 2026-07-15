import { FEATURED_PRODUCT_IDS } from '@/data/featured-products';
import {
  HOME_HIGHLIGHTED_ROW_SIZE,
  MIN_HOME_FEATURED,
} from '@/data/home-highlighted-products';
import type { FeaturedProduct } from '@/data/featured-products';
import { shuffleProductsDaily } from '@/lib/daily-shuffle';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { productToFeatured } from '@/lib/store-products';
import type { Product } from '@/types/product';
import { isHomeCarouselExcludedProduct } from '../../shared/home-excluded-products.js';
import { resolveHomeHighlightedRowProducts as resolveHighlightedRow } from '../../shared/home-highlighted-products.js';
import { isProductVisibleOnStorefront } from '../../shared/product-catalog-status.js';

export { HOME_HIGHLIGHTED_ROW_SIZE, MIN_HOME_FEATURED };

/** Activa + precio > 0: incluye stock 0 («A pedido»). */
export function filterInStockProductsForCategoryLabels(
  products: Product[] | undefined,
  labels: readonly string[],
): Product[] {
  if (!products?.length || labels.length === 0) return [];

  return products.filter(
    (product) =>
      isProductVisibleOnStorefront(product) &&
      product.price > 0 &&
      labels.some((label) => productMatchesCategoryFilter(product, label)),
  );
}

export function countInStockProductsForCategoryLabels(
  products: Product[] | undefined,
  labels: readonly string[],
): number {
  return filterInStockProductsForCategoryLabels(products, labels).length;
}

/** Fila fija de equipos Ricoh: prioriza nuevas con foto de inventario (IM 430F/550F/600F). */
export function resolveHomeHighlightedRowProducts(inCategory: Product[]): Product[] {
  return resolveHighlightedRow(inCategory, HOME_HIGHLIGHTED_ROW_SIZE);
}

/** Múltiplo de 5 para páginas completas en el carrusel (cada bullet = 5 productos). */
export const HOME_FEATURED_LIMIT = 15;

/**
 * Productos destacados del inicio: inventario Activa con precio (incluye «A pedido»),
 * prioriza `is_featured` e ids configurados, rellena con orden aleatorio diario.
 */
export function resolveHomeFeaturedProducts(
  storeProducts: Product[] | undefined,
  limit = HOME_FEATURED_LIMIT,
): FeaturedProduct[] {
  if (!storeProducts?.length) return [];

  const sellable = storeProducts.filter(
    (product) =>
      isProductVisibleOnStorefront(product) &&
      product.price > 0 &&
      !isHomeCarouselExcludedProduct(product),
  );
  if (sellable.length < MIN_HOME_FEATURED) return [];

  const byId = new Map(sellable.map((product) => [product.id, product]));
  const selectedIds = new Set<string>();
  const pool: Product[] = [];

  const add = (product: Product | undefined) => {
    if (!product || selectedIds.has(product.id)) return;
    selectedIds.add(product.id);
    pool.push(product);
  };

  for (const product of sellable) {
    if (product.is_featured === true) add(product);
  }

  for (const id of FEATURED_PRODUCT_IDS) {
    add(byId.get(id));
  }

  const remaining = shuffleProductsDaily(sellable.filter((product) => !selectedIds.has(product.id)));
  for (const product of remaining) {
    if (pool.length >= limit) break;
    add(product);
  }

  // Mantener los IDs configurados primero (orden estable),
  // y rellenar con el resto para completar el límite.
  const pinned: Product[] = [];
  const pinnedIds = new Set<string>();
  for (const id of FEATURED_PRODUCT_IDS) {
    const product = byId.get(id);
    if (!product || pinnedIds.has(product.id)) continue;
    pinnedIds.add(product.id);
    pinned.push(product);
  }

  const unpinned = pool.filter((product) => !pinnedIds.has(product.id));
  const ordered = [...pinned, ...shuffleProductsDaily(unpinned)].slice(0, limit);

  return ordered.map((product) => enrichFeaturedFromCatalog(productToFeatured(product)));
}

/** Productos visibles por «página» del carrusel de destacados (cada bullet = una página). */
export const FEATURED_PRODUCTS_PER_VIEW = 5;

export function chunkFeaturedProducts<T>(items: readonly T[], size = FEATURED_PRODUCTS_PER_VIEW): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    pages.push(items.slice(i, i + size));
  }
  return pages;
}

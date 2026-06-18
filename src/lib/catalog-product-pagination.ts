import type { CatalogGridColumns } from '@/lib/category-grid-layout';

/** Máximo de filas visibles por página en la grilla del catálogo. */
export const CATALOG_MAX_GRID_ROWS = 5;

/** Columnas y filas en móvil (< sm) para paginación más corta. */
export const MOBILE_CATALOG_COLUMNS = 2;
export const MOBILE_CATALOG_MAX_ROWS = 4;
export const MOBILE_CATALOG_PRODUCTS_PER_PAGE =
  MOBILE_CATALOG_COLUMNS * MOBILE_CATALOG_MAX_ROWS;

/** Productos por página con grilla por defecto (6 columnas × 5 filas). */
export const CATALOG_PRODUCTS_PER_PAGE = 6 * CATALOG_MAX_GRID_ROWS;

export function getCatalogProductsPerPage(gridColumns: CatalogGridColumns = 6): number {
  return Math.max(1, gridColumns) * CATALOG_MAX_GRID_ROWS;
}

export function getResponsiveCatalogPageSize(
  isMobile: boolean,
  gridColumns: CatalogGridColumns = 6,
): number {
  if (isMobile) return MOBILE_CATALOG_PRODUCTS_PER_PAGE;
  return getCatalogProductsPerPage(gridColumns);
}

export function getCatalogTotalPages(
  totalItems: number,
  pageSize = CATALOG_PRODUCTS_PER_PAGE,
): number {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

export function getCatalogPageSlice<T>(
  items: readonly T[],
  page: number,
  pageSize = CATALOG_PRODUCTS_PER_PAGE,
): T[] {
  const safePage = Math.max(1, Math.min(page, getCatalogTotalPages(items.length, pageSize)));
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function clampCatalogPage(page: number, totalPages: number): number {
  return Math.max(1, Math.min(page, Math.max(1, totalPages)));
}

export type CatalogGridColumns = 3 | 4 | 5 | 6;

/** Grilla del catálogo en modo storefront (tienda y categorías). */
export const STOREFRONT_CATALOG_GRID_CLASS =
  'grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4 items-stretch';

export const CATALOG_GRID_COLUMN_OPTIONS: readonly CatalogGridColumns[] = [5, 6, 4, 3];

/** Densidad de grilla con sidebar fijo (multifuncionales). */
export const CATALOG_SIDEBAR_GRID_COLUMNS: readonly CatalogGridColumns[] = [4, 5];
export const CATALOG_SIDEBAR_DEFAULT_COLUMNS: CatalogGridColumns = 4;

export function catalogGridClassName(
  columns: CatalogGridColumns,
  sidebarOpen = false,
): string {
  const stretch = 'items-stretch';
  switch (columns) {
    case 3:
      return `grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 ${stretch}`;
    case 4:
      return sidebarOpen
        ? `grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 lg:gap-3 ${stretch}`
        : `grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 ${stretch}`;
    case 5:
      return sidebarOpen
        ? `grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-3 ${stretch}`
        : `grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3 ${stretch}`;
    case 6:
      return sidebarOpen
        ? `grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-3 ${stretch}`
        : `grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 xl:gap-3 ${stretch}`;
    default: {
      const _exhaustive: never = columns;
      return _exhaustive;
    }
  }
}

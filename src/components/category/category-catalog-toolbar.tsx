import { ArrowUpDown, Check, Columns3, LayoutGrid, List, Search, SlidersHorizontal, Table2 } from 'lucide-react';
import type { ReactNode } from 'react';

import {
  CategoryActiveFilterChips,
  type ActiveFilterChip,
} from '@/components/category/category-active-filter-chips';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MIN_PRODUCT_SEARCH_LENGTH } from '@/lib/product-search';
import {
  CATALOG_SIDEBAR_GRID_COLUMNS,
  type CatalogGridColumns,
} from '@/lib/category-grid-layout';
import type { QuickFilterChip } from '@/components/category/category-quick-filters';
import { cn } from '@/lib/utils';

export type CategorySortValue = 'price-asc' | 'price-desc' | 'name-asc';
export type CatalogViewMode = 'grid' | 'list' | 'table';

export interface CatalogColorFormatTab {
  key: string;
  label: string;
  count: number;
}

interface CategoryCatalogToolbarProps {
  productCount: number;
  pageTitle: string;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  sortBy: CategorySortValue;
  onSortChange: (value: CategorySortValue) => void;
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  gridColumns: CatalogGridColumns;
  onGridColumnsChange: (columns: CatalogGridColumns) => void;
  filtersOpen: boolean;
  filtersSheetOpen: boolean;
  hasSidebarFilters: boolean;
  onToggleSidebarFilters: () => void;
  tipoFilters: QuickFilterChip[];
  productionFilters: QuickFilterChip[];
  showProductionFilters: boolean;
  selectedAttributes: string[];
  selectedProduction: string | null;
  onSelectAllQuickFilters: () => void;
  onToggleAttribute: (key: string) => void;
  onToggleProduction: (key: string) => void;
  endAction?: ReactNode;
  subcategoryTabs?: ReactNode;
  catalogSpecTabs?: CatalogColorFormatTab[];
  selectedCatalogSpecKeys?: string[];
  onToggleCatalogSpec?: (key: string) => void;
  filtersActive?: boolean;
  /** Layout con sidebar fijo, chips activos y grilla de 5 columnas. */
  catalogSidebarLayout?: boolean;
  /** Oculta búsqueda (va en cabecera del storefront) y simplifica la barra. */
  storefrontMode?: boolean;
  activeFilterChips?: ActiveFilterChip[];
}

const SORT_OPTIONS: { value: CategorySortValue; label: string }[] = [
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a mayor' },
  { value: 'name-asc', label: 'Nombre A-Z' },
];

const iconButtonClass =
  'inline-flex size-11 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

export function CategoryCatalogToolbar({
  pageTitle,
  searchQuery,
  onSearchQueryChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
  subcategoryTabs,
  catalogSpecTabs,
  selectedCatalogSpecKeys = [],
  onToggleCatalogSpec,
  onToggleSidebarFilters,
  filtersOpen,
  filtersSheetOpen,
  filtersActive = false,
  catalogSidebarLayout = false,
  activeFilterChips = [],
  storefrontMode = false,
  endAction,
}: CategoryCatalogToolbarProps) {
  const searchHint =
    searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_PRODUCT_SEARCH_LENGTH
      ? `Escribe al menos ${MIN_PRODUCT_SEARCH_LENGTH} caracteres`
      : null;
  const filtersPanelActive = filtersOpen || filtersSheetOpen || filtersActive;

  const handleViewModeChange = (mode: CatalogViewMode) => {
    onViewModeChange(mode);
  };

  if (storefrontMode) {
    if (!catalogSidebarLayout || activeFilterChips.length === 0) return null;
    return (
      <div className="mb-4">
        <CategoryActiveFilterChips chips={activeFilterChips} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'mb-4 space-y-3',
        storefrontMode
          ? ''
          : 'rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4',
      )}
    >
      {catalogSidebarLayout && activeFilterChips.length > 0 ? (
        <CategoryActiveFilterChips chips={activeFilterChips} />
      ) : null}

      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-1.5 md:gap-2">
        {!catalogSidebarLayout && subcategoryTabs ? (
          <div
            className="w-full shrink-0 overflow-x-auto border-border/70 pb-1 sm:max-w-[46%] sm:border-r sm:pr-1.5 sm:pb-0 md:pr-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="presentation"
          >
            {subcategoryTabs}
          </div>
        ) : null}

        <div
          className={cn(
            'flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2',
            storefrontMode && 'justify-end',
          )}
        >
          {!storefrontMode ? (
            <button
              type="button"
              aria-label="Filtros del catálogo"
              aria-pressed={filtersPanelActive}
              onClick={onToggleSidebarFilters}
              className={cn(
                iconButtonClass,
                catalogSidebarLayout && filtersOpen && 'lg:hidden',
                filtersPanelActive && 'border-red-600/30 bg-red-50 text-red-700',
              )}
            >
              <SlidersHorizontal className="size-5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              aria-label="Filtros del catálogo"
              aria-pressed={filtersPanelActive}
              onClick={onToggleSidebarFilters}
              className={cn(
                iconButtonClass,
                'hidden lg:inline-flex',
                filtersPanelActive && 'border-red-600/30 bg-red-50 text-red-700',
              )}
            >
              <SlidersHorizontal className="size-5" aria-hidden="true" />
            </button>
          )}

          {!storefrontMode ? (
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Buscar en esta categoría…"
              aria-label={`Buscar productos en ${pageTitle}`}
              aria-describedby={searchHint ? 'category-search-hint' : undefined}
              className="h-9 border-border bg-background pl-9 pr-2 text-sm sm:h-10 sm:pr-3"
              autoComplete="off"
            />
            {searchHint ? (
              <p id="category-search-hint" className="sr-only">
                {searchHint}
              </p>
            ) : null}
          </div>
          ) : null}

        <>
          <div
            className="inline-flex shrink-0 overflow-hidden rounded-md border border-border"
            role="group"
            aria-label="Vista del catálogo"
          >
            <button
              type="button"
              aria-label="Vista en grilla"
              aria-pressed={viewMode === 'grid'}
              onClick={() => handleViewModeChange('grid')}
              className={cn(
                iconButtonClass,
                'rounded-none border-0',
                viewMode === 'grid' && 'bg-red-600 text-white hover:bg-red-500 hover:text-white',
              )}
            >
              <LayoutGrid className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Vista en lista"
              aria-pressed={viewMode === 'list'}
              onClick={() => handleViewModeChange('list')}
              className={cn(
                iconButtonClass,
                'rounded-none border-0 border-l border-border',
                viewMode === 'list' && 'bg-red-600 text-white hover:bg-red-500 hover:text-white',
              )}
            >
              <List className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Vista en tabla"
              aria-pressed={viewMode === 'table'}
              onClick={() => handleViewModeChange('table')}
              className={cn(
                iconButtonClass,
                'rounded-none border-0 border-l border-border',
                viewMode === 'table' && 'bg-red-600 text-white hover:bg-red-500 hover:text-white',
              )}
            >
              <Table2 className="size-5" aria-hidden="true" />
            </button>
          </div>

          {viewMode === 'grid' && !storefrontMode ? (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={`Columnas por fila: ${gridColumns}`}
                  className={cn(iconButtonClass, 'gap-1 px-2 sm:min-w-11')}
                >
                  <Columns3 className="size-5 shrink-0" aria-hidden="true" />
                  <span className="text-xs font-bold tabular-nums">{gridColumns}</span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" sideOffset={8} className="w-44 p-2">
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Columnas
                </p>
                <ul role="listbox" aria-label="Columnas por fila" className="space-y-0.5">
                  {CATALOG_SIDEBAR_GRID_COLUMNS.map((columns) => {
                    const isActive = gridColumns === columns;
                    return (
                      <li key={columns} role="presentation">
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => onGridColumnsChange(columns)}
                          className={cn(
                            'flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset',
                            isActive
                              ? 'bg-red-50 font-medium text-red-700'
                              : 'text-foreground hover:bg-muted',
                          )}
                        >
                          <span>{columns} columnas</span>
                          {isActive ? (
                            <Check className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </PopoverContent>
            </Popover>
          ) : null}
        </>

        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label="Ordenar productos" className={iconButtonClass}>
              <ArrowUpDown className="size-5" aria-hidden="true" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" sideOffset={8} className="w-56 p-2">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ordenar por
            </p>
            <ul role="listbox" aria-label="Opciones de orden" className="space-y-0.5">
              {SORT_OPTIONS.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => onSortChange(option.value)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset',
                        isActive
                          ? 'bg-red-50 font-medium text-red-700'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <span>{option.label}</span>
                      {isActive ? (
                        <Check className="size-4 shrink-0 text-red-600" aria-hidden="true" />
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          </PopoverContent>
        </Popover>

        {endAction}
        </div>
      </div>

      {!catalogSidebarLayout &&
      catalogSpecTabs &&
      catalogSpecTabs.length > 0 &&
      onToggleCatalogSpec ? (
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border/60 pt-3 sm:gap-x-5"
          role="toolbar"
          aria-label="Filtros de formato y color"
        >
          {[
            {
              label: 'Color',
              tabs: catalogSpecTabs.filter((tab) => tab.key.startsWith('Color::')),
            },
            {
              label: 'Formato papel',
              tabs: catalogSpecTabs.filter((tab) => tab.key.includes('Formato papel::')),
            },
          ]
            .filter((group) => group.tabs.length > 0)
            .map((group, groupIndex) => (
              <div
                key={group.label}
                className={cn(
                  'flex flex-wrap items-center gap-2',
                  groupIndex > 0 && 'sm:border-l sm:border-border/60 sm:pl-5',
                )}
                role="group"
                aria-label={group.label}
              >
                <span className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted-foreground sm:text-xs">
                  {group.label}
                </span>
                {group.tabs.map((tab) => {
                  const isActive = selectedCatalogSpecKeys.includes(tab.key);
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      aria-pressed={isActive}
                      disabled={tab.count === 0}
                      onClick={() => onToggleCatalogSpec(tab.key)}
                      className={cn(
                        'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors sm:text-sm',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                        'disabled:pointer-events-none disabled:opacity-45',
                        isActive
                          ? 'border-red-600 bg-red-600 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]'
                          : 'border-border/80 bg-background text-foreground hover:border-border hover:bg-muted/40',
                      )}
                    >
                      <span>{tab.label.replace(/^Formato\s+/i, '')}</span>
                      <span
                        className={cn(
                          'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[0.65rem] leading-none',
                          isActive ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground',
                        )}
                      >
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
        </div>
      ) : null}
    </div>
  );
}

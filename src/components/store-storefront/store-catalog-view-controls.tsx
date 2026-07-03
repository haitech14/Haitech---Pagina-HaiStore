import { ArrowUpDown, Check, Columns3, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CATALOG_SIDEBAR_GRID_COLUMNS,
  type CatalogGridColumns,
} from '@/lib/category-grid-layout';
import type { CatalogViewMode, CategorySortValue } from '@/components/category/category-catalog-toolbar';
import { cn } from '@/lib/utils';

const SORT_OPTIONS: { value: CategorySortValue; label: string }[] = [
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a mayor' },
  { value: 'name-asc', label: 'Nombre A-Z' },
];

const iconButtonClass =
  'inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

interface StoreCatalogViewControlsProps {
  viewMode: CatalogViewMode;
  onViewModeChange: (mode: CatalogViewMode) => void;
  gridColumns: CatalogGridColumns;
  onGridColumnsChange: (columns: CatalogGridColumns) => void;
  sortBy: CategorySortValue;
  onSortChange: (value: CategorySortValue) => void;
  filtersActive?: boolean;
  onToggleFilters: () => void;
  className?: string;
}

export function StoreCatalogViewControls({
  viewMode,
  onViewModeChange,
  gridColumns,
  onGridColumnsChange,
  sortBy,
  onSortChange,
  filtersActive = false,
  onToggleFilters,
  className,
}: StoreCatalogViewControlsProps) {
  return (
    <div className={cn('flex shrink-0 items-center gap-1.5', className)}>
      <button
        type="button"
        aria-label="Filtros del catálogo"
        aria-pressed={filtersActive}
        onClick={onToggleFilters}
        className={cn(
          iconButtonClass,
          filtersActive && 'border-red-600/30 bg-red-50 text-red-700',
        )}
      >
        <SlidersHorizontal className="size-[1.125rem]" aria-hidden="true" />
      </button>

      <div
        className="inline-flex shrink-0 overflow-hidden rounded-md border border-border"
        role="group"
        aria-label="Vista del catálogo"
      >
        <button
          type="button"
          aria-label="Vista en grilla"
          aria-pressed={viewMode === 'grid'}
          onClick={() => onViewModeChange('grid')}
          className={cn(
            iconButtonClass,
            'rounded-none border-0',
            viewMode === 'grid' && 'bg-red-600 text-white hover:bg-red-500 hover:text-white',
          )}
        >
          <LayoutGrid className="size-[1.125rem]" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Vista en lista"
          aria-pressed={viewMode === 'list'}
          onClick={() => onViewModeChange('list')}
          className={cn(
            iconButtonClass,
            'rounded-none border-0 border-l border-border',
            viewMode === 'list' && 'bg-red-600 text-white hover:bg-red-500 hover:text-white',
          )}
        >
          <List className="size-[1.125rem]" aria-hidden="true" />
        </button>
      </div>

      {viewMode === 'grid' ? (
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Columnas por fila: ${gridColumns}`}
              className={cn(iconButtonClass, 'gap-1 px-2')}
            >
              <Columns3 className="size-[1.125rem] shrink-0" aria-hidden="true" />
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

      <Popover>
        <PopoverTrigger asChild>
          <button type="button" aria-label="Ordenar productos" className={iconButtonClass}>
            <ArrowUpDown className="size-[1.125rem]" aria-hidden="true" />
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
    </div>
  );
}

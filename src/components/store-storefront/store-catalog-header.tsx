import { Search, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { storeCatalogCopy } from '@/data/store-landing';
import { MIN_PRODUCT_SEARCH_LENGTH } from '@/lib/product-search';
import { cn } from '@/lib/utils';

interface StoreCatalogHeaderProps {
  productCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onOpenFilters: () => void;
  eyebrow?: string;
  title?: string;
  searchPlaceholder?: string;
  className?: string;
}

export function StoreCatalogHeader({
  productCount,
  searchQuery,
  onSearchQueryChange,
  onOpenFilters,
  eyebrow = storeCatalogCopy.eyebrow,
  title = storeCatalogCopy.title,
  searchPlaceholder = storeCatalogCopy.searchPlaceholder,
  className,
}: StoreCatalogHeaderProps) {
  const searchHint =
    searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_PRODUCT_SEARCH_LENGTH
      ? `Escribe al menos ${MIN_PRODUCT_SEARCH_LENGTH} caracteres`
      : null;

  return (
    <div className={cn('mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-red-600">{eyebrow}</p>
        <h2 id="tienda-catalogo-titulo" className="text-2xl font-bold text-foreground sm:text-3xl">
          {title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {productCount} resultado{productCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-10 pl-9"
            aria-label="Buscar productos en la tienda"
            aria-describedby={searchHint ? 'store-search-hint' : undefined}
            autoComplete="off"
          />
          {searchHint ? (
            <p id="store-search-hint" className="sr-only">
              {searchHint}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-10 shrink-0 gap-2 lg:hidden"
          aria-label="Abrir filtros"
          onClick={onOpenFilters}
        >
          <SlidersHorizontal className="size-4" aria-hidden="true" />
          Filtros
        </Button>
      </div>
    </div>
  );
}

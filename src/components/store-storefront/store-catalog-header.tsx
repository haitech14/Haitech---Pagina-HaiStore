import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { storeCatalogCopy } from '@/data/store-landing';
import { MIN_PRODUCT_SEARCH_LENGTH } from '@/lib/product-search';
import { cn } from '@/lib/utils';

interface StoreCatalogHeaderProps {
  productCount: number;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  eyebrow?: string;
  title?: string;
  searchPlaceholder?: string;
  viewControls?: ReactNode;
  className?: string;
}

export function StoreCatalogHeader({
  productCount,
  searchQuery,
  onSearchQueryChange,
  eyebrow,
  title = storeCatalogCopy.title,
  searchPlaceholder = storeCatalogCopy.searchPlaceholder,
  viewControls,
  className,
}: StoreCatalogHeaderProps) {
  const searchHint =
    searchQuery.trim().length > 0 && searchQuery.trim().length < MIN_PRODUCT_SEARCH_LENGTH
      ? `Escribe al menos ${MIN_PRODUCT_SEARCH_LENGTH} caracteres`
      : null;

  return (
    <div className={cn('flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="shrink-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wide text-red-600">{eyebrow}</p>
        ) : null}
        <h2 id="tienda-catalogo-titulo" className="text-xl font-bold text-foreground sm:text-2xl">
          {title}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {productCount} resultado{productCount === 1 ? '' : 's'}
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-10 rounded-lg border-border bg-background pl-9 shadow-sm"
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

        {viewControls}
      </div>
    </div>
  );
}

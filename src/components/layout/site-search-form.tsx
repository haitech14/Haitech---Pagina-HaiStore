import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FolderOpen, Loader2, Search, Wrench } from 'lucide-react';

import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useProductSearch } from '@/hooks/use-product-search';
import { categoryLandingPath } from '@/lib/category-path';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import {
  filterCategoriesBySearch,
  filterServicesBySearch,
  MIN_PRODUCT_SEARCH_LENGTH,
  PRODUCT_SEARCH_SUGGESTION_LIMIT,
  type SearchCategorySuggestion,
  type SearchServiceSuggestion,
} from '@/lib/product-search';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import type { Product } from '@/types/product';
import { cn, formatUsd } from '@/lib/utils';

const ALL_CATEGORIES_VALUE = 'all';

type SiteSearchFormProps = {
  className?: string;
  onNavigate?: () => void;
  /** Barra segmentada (header) o campo único (móvil compacto). */
  variant?: 'segmented' | 'simple';
};

type SearchSuggestionItem =
  | SearchCategorySuggestion
  | SearchServiceSuggestion
  | { type: 'product'; product: Product };

const searchBarClass =
  'flex w-full items-stretch overflow-hidden rounded-lg border border-border/70 bg-white shadow-[0_1px_4px_rgba(15,23,42,0.08)] transition-shadow focus-within:border-border focus-within:shadow-[0_2px_10px_rgba(15,23,42,0.1)] focus-within:ring-2 focus-within:ring-ring/25';

const categorySegmentClass =
  'h-11 max-w-[6.75rem] appearance-none border-0 border-r border-border/70 bg-muted/40 py-0 pl-3.5 pr-8 text-sm font-medium text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:max-w-[8.75rem]';

const searchInputClass =
  'h-11 w-full border-0 bg-white px-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-4';

const searchButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center border-0 border-l border-border/70 bg-white text-foreground/70 transition-colors hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

function SuggestionSectionHeading({ children }: { children: string }) {
  return (
    <p className="border-b border-border/60 bg-muted/25 px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </p>
  );
}

export function SiteSearchForm({
  className,
  onNavigate,
  variant = 'segmented',
}: SiteSearchFormProps) {
  const navigate = useNavigate();
  const fieldId = useId();
  const categoryFieldId = `${fieldId}-category`;
  const inputFieldId = `${fieldId}-query`;
  const listboxId = `${fieldId}-listbox`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: categoryTree = [] } = useStoreCategoriesTree();

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [panelOpen, setPanelOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const deferredQuery = useDeferredValue(query);
  const isSearchPending = query.trim() !== deferredQuery.trim();

  const categoryOptions = useMemo(() => {
    const fromTree = buildCategorySelectOptions(categoryTree);
    return [{ value: ALL_CATEGORIES_VALUE, label: 'Categorías' }, ...fromTree];
  }, [categoryTree]);

  const categorySuggestions = useMemo(
    () => filterCategoriesBySearch(deferredQuery),
    [deferredQuery],
  );

  const serviceSuggestions = useMemo(
    () => filterServicesBySearch(deferredQuery),
    [deferredQuery],
  );

  const trimmedQuery = query.trim();
  const trimmedDeferredQuery = deferredQuery.trim();
  const queryTooShort =
    panelOpen && trimmedQuery.length > 0 && trimmedQuery.length < MIN_PRODUCT_SEARCH_LENGTH;

  const searchEnabled =
    panelOpen && trimmedDeferredQuery.length >= MIN_PRODUCT_SEARCH_LENGTH;

  const { data: searchResult, isLoading: searchLoading, isFetching: searchFetching } =
    useProductSearch(deferredQuery, {
      categoryFilter,
      limit: PRODUCT_SEARCH_SUGGESTION_LIMIT,
      enabled: searchEnabled,
    });

  const productSuggestions = searchResult?.products ?? [];
  const totalMatches = searchResult?.total ?? 0;
  const searchPending = searchEnabled && (searchLoading || searchFetching);

  const showSuggestions = searchEnabled && !searchPending;

  const suggestions = useMemo<SearchSuggestionItem[]>(
    () => [
      ...categorySuggestions,
      ...serviceSuggestions,
      ...productSuggestions.map((product) => ({ type: 'product' as const, product })),
    ],
    [categorySuggestions, serviceSuggestions, productSuggestions],
  );

  useEffect(() => {
    if (!showSuggestions) {
      setActiveIndex(-1);
    }
  }, [showSuggestions, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const goToSearchResults = (searchText: string, category: string) => {
    const trimmed = searchText.trim();
    if (trimmed.length < MIN_PRODUCT_SEARCH_LENGTH) return;

    const params = new URLSearchParams();
    params.set('buscar', trimmed);
    if (category !== ALL_CATEGORIES_VALUE) {
      params.set('cat', category);
    }
    setPanelOpen(false);
    onNavigate?.();
    void navigate(`/tienda?${params.toString()}`);
  };

  const goToPath = (path: string) => {
    setPanelOpen(false);
    onNavigate?.();
    void navigate(path);
  };

  const goToProduct = (productId: string) => {
    goToPath(`/tienda/producto/${productId}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    goToSearchResults(query, categoryFilter);
  };

  const activateSuggestion = (item: SearchSuggestionItem) => {
    if (item.type === 'category') {
      goToPath(categoryLandingPath(item.slug));
      return;
    }
    if (item.type === 'service') {
      goToPath(item.href);
      return;
    }
    goToProduct(item.product.id);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setPanelOpen(false);
      return;
    }

    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, -1));
      return;
    }

    if (event.key === 'Enter' && activeIndex >= 0 && suggestions[activeIndex]) {
      event.preventDefault();
      activateSuggestion(suggestions[activeIndex]);
    }
  };

  const placeholder =
    variant === 'simple'
      ? 'Buscar productos, categorías o soluciones...'
      : 'Buscar productos, marcas y más...';

  const showPanel = panelOpen && (queryTooShort || showSuggestions || isSearchPending);

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <form role="search" className={searchBarClass} onSubmit={handleSubmit}>
        {variant === 'segmented' ? (
          <>
            <label htmlFor={categoryFieldId} className="sr-only">
              Categoría
            </label>
            <div className="relative shrink-0">
              <select
                id={categoryFieldId}
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className={categorySegmentClass}
                aria-label="Filtrar por categoría"
              >
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-foreground/80"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>
          </>
        ) : null}

        <label htmlFor={inputFieldId} className="sr-only">
          Buscar en la tienda
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            ref={inputRef}
            id={inputFieldId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPanelOpen(true);
            }}
            onFocus={() => setPanelOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={showPanel ? listboxId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0 && suggestions[activeIndex]
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              searchInputClass,
              variant === 'simple' && 'pr-11',
              variant === 'segmented' && 'border-r border-border/70',
            )}
          />
          {variant === 'simple' ? (
            <Search
              className="pointer-events-none absolute right-3.5 top-1/2 size-[1.125rem] -translate-y-1/2 text-foreground/60"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          ) : null}
        </div>

        {variant === 'segmented' ? (
          <button type="submit" aria-label="Buscar" className={searchButtonClass}>
            <Search className="size-[1.125rem]" strokeWidth={1.75} aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" className="sr-only">
            Buscar
          </button>
        )}
      </form>

      {showPanel ? (
        <div
          className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-lg border border-border/70 bg-popover shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          role="presentation"
        >
          {queryTooShort ? (
            <p className="px-4 py-3 text-sm text-muted-foreground" role="status">
              Escribe al menos {MIN_PRODUCT_SEARCH_LENGTH} caracteres para buscar.
            </p>
          ) : isSearchPending || searchPending ? (
            <p
              className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden="true" />
              Buscando…
            </p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground" role="status">
              No hay resultados para «{trimmedDeferredQuery}». Prueba con otro término o revisa la
              ortografía.
            </p>
          ) : (
            <>
              <ul id={listboxId} role="listbox" aria-label="Resultados de búsqueda">
                {categorySuggestions.length > 0 ? (
                  <>
                    <li role="presentation">
                      <SuggestionSectionHeading>Categorías</SuggestionSectionHeading>
                    </li>
                    {categorySuggestions.map((item, index) => {
                      const isActive = index === activeIndex;
                      return (
                        <li key={`category-${item.slug}`} role="presentation">
                          <button
                            id={`${listboxId}-option-${index}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => activateSuggestion(item)}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/40 text-foreground/70">
                              <FolderOpen
                                className="size-4"
                                strokeWidth={1.75}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-foreground">{item.name}</span>
                              <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </>
                ) : null}

                {serviceSuggestions.length > 0 ? (
                  <>
                    <li role="presentation">
                      <SuggestionSectionHeading>Servicios</SuggestionSectionHeading>
                    </li>
                    {serviceSuggestions.map((item, index) => {
                      const suggestionIndex = categorySuggestions.length + index;
                      const isActive = suggestionIndex === activeIndex;
                      return (
                        <li key={`service-${item.href}`} role="presentation">
                          <button
                            id={`${listboxId}-option-${suggestionIndex}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(suggestionIndex)}
                            onClick={() => activateSuggestion(item)}
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-red-600/10 text-red-600">
                              <Wrench className="size-4" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-foreground">{item.name}</span>
                              <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                {item.subtitle}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </>
                ) : null}

                {productSuggestions.length > 0 ? (
                  <>
                    <li role="presentation">
                      <SuggestionSectionHeading>Productos</SuggestionSectionHeading>
                    </li>
                    {productSuggestions.map((product, index) => {
                      const suggestionIndex =
                        categorySuggestions.length + serviceSuggestions.length + index;
                      const isActive = suggestionIndex === activeIndex;
                      const imageUrl =
                        resolveProductImageUrl(product) ?? '/promo-cards/b2b-printer.png';

                      return (
                        <li key={product.id} role="presentation">
                          <button
                            id={`${listboxId}-option-${suggestionIndex}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              'flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(suggestionIndex)}
                            onClick={() => activateSuggestion({ type: 'product', product })}
                          >
                            <img
                              src={imageUrl}
                              alt=""
                              className="size-11 shrink-0 rounded-md border border-border/60 bg-muted object-contain p-0.5"
                              loading="lazy"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="line-clamp-2 font-medium text-foreground">
                                {product.name}
                              </span>
                              {product.category ? (
                                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                  {product.category}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 text-xs font-semibold tabular-nums text-foreground">
                              {formatUsd(product.price)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </>
                ) : null}
              </ul>
              {totalMatches > productSuggestions.length ? (
                <div className="border-t border-border/80 px-3 py-2">
                  <button
                    type="button"
                    className="w-full rounded-md py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    onClick={() => goToSearchResults(query, categoryFilter)}
                  >
                    Ver todos los productos ({totalMatches})
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, FolderOpen, ImageOff, Loader2, Plus, Search, ShoppingCart, Wrench } from 'lucide-react';

import { ProductCardImage } from '@/components/product/product-card-image';
import { AddToCartButton, isProductOutOfStock, ON_REQUEST_STOCK_BADGE_CLASS } from '@/components/cart/add-to-cart-button';
import { useAuth } from '@/context/auth-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { prefetchProductSearch, useProductSearch } from '@/hooks/use-product-search';
import { categoryLandingPath } from '@/lib/category-path';
import { seedProductQueryCache } from '@/lib/find-cached-product';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import {
  filterCategoriesBySearch,
  filterServicesBySearch,
  groupSearchProductsByCategory,
  getSearchCategoryEmoji,
  MIN_PRODUCT_SEARCH_LENGTH,
  PRODUCT_SEARCH_INITIAL_VISIBLE,
  PRODUCT_SEARCH_LOAD_MORE_STEP,
  PRODUCT_SEARCH_MAX_LIMIT,
  type SearchCategorySuggestion,
  type SearchServiceSuggestion,
} from '@/lib/product-search';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { ensureFullPrices } from '@/lib/roles';
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
  'flex w-full items-stretch overflow-hidden rounded-lg border border-border/80 bg-white shadow-sm transition-shadow focus-within:border-border focus-within:ring-2 focus-within:ring-ring/20';

const categorySegmentClass =
  'h-11 min-w-[8rem] max-w-[10rem] appearance-none border-0 border-l border-border/80 bg-white py-0 pl-2.5 pr-8 text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-w-[9rem] sm:max-w-[11rem]';

const searchInputClass =
  'h-11 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:pl-10';

const searchButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-r-[calc(var(--radius)-1px)] border-0 bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

function SuggestionSectionHeading({ children }: { children: string }) {
  return (
    <p className="border-b border-border/60 bg-muted/25 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:px-3.5">
      {children}
    </p>
  );
}

type SearchProductSuggestionRowProps = {
  product: Product;
  optionId: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onNavigateProduct: () => void;
};

function SearchProductSuggestionRow({
  product,
  optionId,
  isActive,
  onMouseEnter,
  onNavigateProduct,
}: SearchProductSuggestionRowProps) {
  const { isAdmin, viewAsRoles } = useAuth();
  const showAdminPrices = isAdmin && viewAsRoles.length === 0;
  const outOfStock = isProductOutOfStock(product);
  const code = formatProductDisplayCode(product.code, {
    brand: product.brand,
    category: product.category,
    name: product.name,
  });
  const stockLabel = outOfStock ? 'A pedido' : `Stock: ${product.stock}`;
  const imageUrl = resolveProductImageUrl(product);
  const rolePrices = ensureFullPrices(product.prices ? product.prices : { public: product.price });
  const priceAria = showAdminPrices
    ? `Precio técnico ${formatUsd(rolePrices.tecnico)}, precio público ${formatUsd(rolePrices.public)}`
    : formatUsd(product.price);

  return (
    <div
      id={optionId}
      role="option"
      aria-selected={isActive}
      aria-label={[product.name, code ? `Código ${code}` : null, stockLabel, priceAria]
        .filter(Boolean)
        .join(', ')}
      className={cn(
        'flex items-stretch gap-0.5 border-b border-border/40 bg-background transition-colors last:border-b-0',
        isActive && 'bg-accent',
      )}
      onMouseEnter={onMouseEnter}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset sm:gap-2.5 sm:px-3"
        onClick={onNavigateProduct}
      >
        {imageUrl ? (
          <ProductCardImage
            src={imageUrl}
            alt=""
            className="size-full object-contain p-0.5"
            overlayClassName="size-10 shrink-0 rounded border border-border/60 bg-muted sm:size-11"
            watermarkClassName={PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS}
          />
        ) : (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded border border-border/60 bg-muted/50 text-muted-foreground sm:size-11"
            aria-hidden="true"
          >
            <ImageOff className="size-4" strokeWidth={1.75} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 text-sm font-medium leading-tight text-foreground">
            {product.name}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0 text-xs text-muted-foreground">
            {code ? (
              <span className="font-mono tracking-tight">{code}</span>
            ) : null}
            <span
              className={cn(
                'font-medium',
                outOfStock ? ON_REQUEST_STOCK_BADGE_CLASS : 'text-emerald-700',
              )}
            >
              {stockLabel}
            </span>
          </span>
        </span>
        {showAdminPrices ? (
          <span className="hidden shrink-0 flex-col items-end gap-y-0.5 min-[480px]:flex">
            <span className="flex items-baseline gap-x-1.5 text-[0.6875rem] sm:text-xs">
              <span className="shrink-0 font-semibold uppercase tracking-wide text-muted-foreground">
                Técnico
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatUsd(rolePrices.tecnico)}
              </span>
            </span>
            <span className="flex items-baseline gap-x-1.5 text-[0.6875rem] sm:text-xs">
              <span className="shrink-0 font-semibold uppercase tracking-wide text-muted-foreground">
                Público
              </span>
              <span className="font-semibold tabular-nums text-foreground">
                {formatUsd(rolePrices.public)}
              </span>
            </span>
          </span>
        ) : (
          <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
            {formatUsd(product.price)}
          </span>
        )}
      </button>

      <div className="flex shrink-0 items-center border-l border-border/40 px-1.5 py-1.5 sm:px-2">
        <AddToCartButton
          product={product}
          addOptions={{ openDrawer: true }}
          size="icon"
          variant="ghost"
          aria-label={`Añadir ${product.name} al carrito`}
          className="size-11 min-h-11 min-w-11 shrink-0 rounded-md text-red-600 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-600"
        >
          <ShoppingCart className="size-[1.125rem]" aria-hidden="true" />
        </AddToCartButton>
      </div>
    </div>
  );
}

function SearchProductSuggestionSkeleton() {
  return (
    <div
      className="flex items-center gap-2 border-b border-border/40 px-2.5 py-2 sm:gap-2.5 sm:px-3"
      aria-hidden="true"
    >
      <div className="size-10 shrink-0 animate-pulse rounded border border-border/60 bg-muted sm:size-11" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-4 w-14 shrink-0 animate-pulse rounded bg-muted" />
    </div>
  );
}

export function SiteSearchForm({
  className,
  onNavigate,
  variant = 'segmented',
}: SiteSearchFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, viewAsRoles } = useAuth();
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
  const [productDisplayLimit, setProductDisplayLimit] = useState(PRODUCT_SEARCH_INITIAL_VISIBLE);

  const debouncedQuery = useDebouncedValue(query, 200);

  const categoryOptions = useMemo(() => {
    const fromTree = buildCategorySelectOptions(categoryTree);
    return [{ value: ALL_CATEGORIES_VALUE, label: 'Todas las categorías' }, ...fromTree];
  }, [categoryTree]);

  const categorySuggestions = useMemo(
    () => filterCategoriesBySearch(query),
    [query],
  );

  const serviceSuggestions = useMemo(
    () => filterServicesBySearch(query),
    [query],
  );

  const trimmedQuery = query.trim();
  const trimmedDebouncedQuery = debouncedQuery.trim();
  const queryTooShort =
    panelOpen && trimmedQuery.length > 0 && trimmedQuery.length < MIN_PRODUCT_SEARCH_LENGTH;
  const isSearchDebouncing =
    trimmedQuery.length >= MIN_PRODUCT_SEARCH_LENGTH && trimmedQuery !== trimmedDebouncedQuery;

  const searchEnabled =
    panelOpen && trimmedDebouncedQuery.length >= MIN_PRODUCT_SEARCH_LENGTH;

  const { data: searchResult, isLoading: searchLoading, isFetching: searchFetching } =
    useProductSearch(debouncedQuery, {
      categoryFilter,
      limit: productDisplayLimit,
      enabled: searchEnabled,
    });

  const productSuggestions = searchResult?.products ?? [];
  const totalMatches = searchResult?.total ?? 0;
  const isProductsLoading =
    searchEnabled && (searchLoading || isSearchDebouncing) && productSuggestions.length === 0;
  const isSearchRefreshing =
    searchEnabled && searchFetching && !searchLoading && !isSearchDebouncing;
  const canLoadMoreProducts =
    productSuggestions.length > 0 &&
    productSuggestions.length < totalMatches &&
    productDisplayLimit < Math.min(totalMatches, PRODUCT_SEARCH_MAX_LIMIT);

  useEffect(() => {
    setProductDisplayLimit(PRODUCT_SEARCH_INITIAL_VISIBLE);
  }, [trimmedDebouncedQuery, categoryFilter]);

  const productGroups = useMemo(
    () => groupSearchProductsByCategory(productSuggestions, debouncedQuery),
    [productSuggestions, debouncedQuery],
  );

  const groupedProductSuggestions = useMemo(
    () => productGroups.flatMap((group) => group.products),
    [productGroups],
  );

  const productGroupsWithIndices = useMemo(() => {
    let index = categorySuggestions.length + serviceSuggestions.length;
    return productGroups.map((group) => ({
      category: group.category,
      products: group.products.map((product) => {
        const suggestionIndex = index;
        index += 1;
        return { product, suggestionIndex };
      }),
    }));
  }, [productGroups, categorySuggestions.length, serviceSuggestions.length]);

  const suggestions = useMemo<SearchSuggestionItem[]>(
    () => [
      ...categorySuggestions,
      ...serviceSuggestions,
      ...groupedProductSuggestions.map((product) => ({ type: 'product' as const, product })),
    ],
    [categorySuggestions, serviceSuggestions, groupedProductSuggestions],
  );

  const showEmptyResults =
    panelOpen &&
    trimmedQuery.length >= MIN_PRODUCT_SEARCH_LENGTH &&
    !isProductsLoading &&
    !isSearchDebouncing &&
    !searchFetching &&
    suggestions.length === 0;

  const showPanel =
    panelOpen &&
    (queryTooShort ||
      trimmedQuery.length >= MIN_PRODUCT_SEARCH_LENGTH ||
      categorySuggestions.length > 0 ||
      serviceSuggestions.length > 0);

  const warmupSearch = useCallback(() => {
    void prefetchProductSearch(queryClient, {
      query: 'ricoh',
      categoryFilter,
      limit: PRODUCT_SEARCH_INITIAL_VISIBLE,
      role,
      viewAsRoles,
    });
  }, [queryClient, categoryFilter, role, viewAsRoles]);

  useEffect(() => {
    if (!showPanel || queryTooShort || suggestions.length === 0) {
      setActiveIndex(-1);
    }
  }, [showPanel, queryTooShort, suggestions.length]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const loadMoreProducts = () => {
    setProductDisplayLimit((current) =>
      Math.min(current + PRODUCT_SEARCH_LOAD_MORE_STEP, PRODUCT_SEARCH_MAX_LIMIT, totalMatches),
    );
  };

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

  const goToProduct = (product: Product) => {
    seedProductQueryCache(queryClient, product, role, viewAsRoles);
    goToPath(productPath(product));
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
    goToProduct(item.product);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setPanelOpen(false);
      return;
    }

    if (!showPanel || queryTooShort || suggestions.length === 0) return;

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

  const placeholder = 'Buscar productos, categorías o marcas...';

  const showSuggestionsList =
    !queryTooShort &&
    !showEmptyResults &&
    (suggestions.length > 0 || isProductsLoading);

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <form role="search" className={searchBarClass} onSubmit={handleSubmit}>
        <label htmlFor={inputFieldId} className="sr-only">
          Buscar en la tienda
        </label>
        <div className="relative min-w-0 flex-1">
          {variant === 'segmented' ? (
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          ) : null}
          <input
            ref={inputRef}
            id={inputFieldId}
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPanelOpen(true);
            }}
            onFocus={() => {
              setPanelOpen(true);
              warmupSearch();
            }}
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
            className={cn(searchInputClass, variant === 'simple' && 'pr-11')}
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
                className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </div>

            <button type="submit" aria-label="Buscar" className={searchButtonClass}>
              <Search className="size-4" strokeWidth={2} aria-hidden="true" />
            </button>
          </>
        ) : (
          <button type="submit" className="sr-only">
            Buscar
          </button>
        )}
      </form>

      {showPanel ? (
        <div
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(80vh,44rem)] overflow-hidden rounded-xl border border-border/70 bg-popover shadow-[0_12px_32px_rgba(15,23,42,0.14)] sm:left-1/2 sm:right-auto sm:w-[min(100vw-1rem,56rem)] sm:-translate-x-1/2"
          role="presentation"
        >
          {queryTooShort ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground" role="status">
              Escribe al menos {MIN_PRODUCT_SEARCH_LENGTH} caracteres para buscar.
            </p>
          ) : showEmptyResults ? (
            <p className="px-3 py-2.5 text-sm text-muted-foreground" role="status">
              No hay resultados para «{trimmedDebouncedQuery}». Prueba con otro término o revisa la
              ortografía.
            </p>
          ) : showSuggestionsList ? (
            <>
              {isSearchRefreshing ? (
                <p
                  className="flex items-center gap-2 border-b border-border/60 bg-muted/20 px-3 py-1.5 text-xs text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
                  Actualizando resultados…
                </p>
              ) : null}
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Resultados de búsqueda"
                className="max-h-[min(72vh,40rem)] overflow-y-auto"
              >
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
                              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => activateSuggestion(item)}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded border border-border/60 bg-muted/40 text-foreground/70 sm:size-10">
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
                              'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(suggestionIndex)}
                            onClick={() => activateSuggestion(item)}
                          >
                            <span className="flex size-9 shrink-0 items-center justify-center rounded border border-border/60 bg-red-600/10 text-red-600 sm:size-10">
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

                {productGroupsWithIndices.length > 0
                  ? productGroupsWithIndices.map((group) => (
                      <li key={`product-group-${group.category}`} role="presentation">
                        <ul role="group" aria-label={group.category}>
                          <li role="presentation">
                            <SuggestionSectionHeading>
                              {`${getSearchCategoryEmoji(group.category)} ${group.category}`}
                            </SuggestionSectionHeading>
                          </li>
                          <li role="presentation">
                            <ul className="grid grid-cols-1 gap-0">
                              {group.products.map(({ product, suggestionIndex }) => {
                                const isActive = suggestionIndex === activeIndex;
                                return (
                                  <li
                                    key={product.id}
                                    role="presentation"
                                    className="min-w-0"
                                  >
                                    <SearchProductSuggestionRow
                                      product={product}
                                      optionId={`${listboxId}-option-${suggestionIndex}`}
                                      isActive={isActive}
                                      onMouseEnter={() => setActiveIndex(suggestionIndex)}
                                      onNavigateProduct={() =>
                                        activateSuggestion({ type: 'product', product })
                                      }
                                    />
                                  </li>
                                );
                              })}
                            </ul>
                          </li>
                        </ul>
                      </li>
                    ))
                  : null}

                {isProductsLoading ? (
                  <>
                    <li role="presentation">
                      <SuggestionSectionHeading>Productos</SuggestionSectionHeading>
                    </li>
                    {[0, 1, 2].map((index) => (
                      <li key={`product-skeleton-${index}`} role="presentation">
                        <SearchProductSuggestionSkeleton />
                      </li>
                    ))}
                  </>
                ) : null}
              </ul>
              {canLoadMoreProducts || totalMatches > productSuggestions.length ? (
                <div className="space-y-0.5 border-t border-border/80 bg-muted/10 px-3 py-2">
                  {canLoadMoreProducts ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-center text-sm font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      onClick={loadMoreProducts}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Agregar más productos
                    </button>
                  ) : null}
                  {totalMatches > productSuggestions.length ? (
                    <button
                      type="button"
                      className="w-full rounded-md py-2 text-center text-sm font-semibold text-foreground hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      onClick={() => goToSearchResults(query, categoryFilter)}
                    >
                      Ver todos los resultados ({totalMatches})
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

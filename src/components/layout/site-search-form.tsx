import { useDeferredValue, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, FolderOpen, ImageOff, Loader2, Plus, Search, ShoppingCart, Wrench } from 'lucide-react';

import { AddToCartButton, isProductOutOfStock } from '@/components/cart/add-to-cart-button';
import { useAuth } from '@/context/auth-context';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useProductSearch } from '@/hooks/use-product-search';
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
  'h-10 min-w-[7.5rem] max-w-[9rem] appearance-none border-0 border-l border-border/80 bg-white py-0 pl-2 pr-7 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-w-[8.5rem] sm:max-w-[10rem]';

const searchInputClass =
  'h-10 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-9 pr-2.5 text-xs text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:px-3 sm:pl-9';

const searchButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-r-[calc(var(--radius)-1px)] border-0 bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

function SuggestionSectionHeading({ children }: { children: string }) {
  return (
    <p className="border-b border-border/60 bg-muted/25 px-3.5 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
  const stockLabel = outOfStock ? 'Sin stock' : `Stock: ${product.stock}`;
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
        'flex min-h-[5.5rem] items-stretch gap-1 border-b border-border/40 bg-background transition-colors last:border-b-0',
        isActive && 'bg-accent',
      )}
      onMouseEnter={onMouseEnter}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-left text-sm hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset"
        onClick={onNavigateProduct}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="size-10 shrink-0 rounded-md border border-border/60 bg-muted object-contain p-0.5"
            loading="lazy"
          />
        ) : (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-muted/50 text-muted-foreground"
            aria-hidden="true"
          >
            <ImageOff className="size-3.5" strokeWidth={1.75} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="line-clamp-2 text-[0.8125rem] font-medium leading-snug text-foreground">
            {product.name}
          </span>
          <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.65rem]">
            {code ? (
              <span className="font-mono tracking-tight text-muted-foreground">{code}</span>
            ) : null}
            <span
              className={cn(
                'font-medium',
                outOfStock ? 'text-orange-600' : 'text-emerald-700',
              )}
            >
              {stockLabel}
            </span>
          </span>
        </span>
        {showAdminPrices ? (
          <span className="hidden shrink-0 space-y-1 text-right tabular-nums min-[480px]:block">
            <span className="block">
              <span className="block text-[0.55rem] font-medium uppercase tracking-wide text-muted-foreground">
                Técnico
              </span>
              <span className="block text-[0.7rem] font-semibold text-foreground">
                {formatUsd(rolePrices.tecnico)}
              </span>
            </span>
            <span className="block">
              <span className="block text-[0.55rem] font-medium uppercase tracking-wide text-muted-foreground">
                Público
              </span>
              <span className="block text-[0.7rem] font-semibold text-foreground">
                {formatUsd(rolePrices.public)}
              </span>
            </span>
          </span>
        ) : (
          <span className="shrink-0 text-[0.7rem] font-semibold tabular-nums text-foreground">
            {formatUsd(product.price)}
          </span>
        )}
      </button>

      <div className="flex shrink-0 items-center border-l border-border/40 px-1.5 py-2">
        <AddToCartButton
          product={product}
          addOptions={{ openDrawer: true }}
          disabled={outOfStock}
          size="icon"
          variant="ghost"
          aria-label={`Añadir ${product.name} al carrito`}
          className="size-9 min-h-9 shrink-0 rounded-md text-red-600 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-600"
        >
          <ShoppingCart className="size-4" aria-hidden="true" />
        </AddToCartButton>
      </div>
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

  const deferredQuery = useDeferredValue(query);
  const isSearchPending = query.trim() !== deferredQuery.trim();

  const categoryOptions = useMemo(() => {
    const fromTree = buildCategorySelectOptions(categoryTree);
    return [{ value: ALL_CATEGORIES_VALUE, label: 'Todas las categorías' }, ...fromTree];
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
      limit: productDisplayLimit,
      enabled: searchEnabled,
    });

  const productSuggestions = searchResult?.products ?? [];
  const totalMatches = searchResult?.total ?? 0;
  const searchPending = searchEnabled && (searchLoading || searchFetching);
  const canLoadMoreProducts =
    productSuggestions.length > 0 &&
    productSuggestions.length < totalMatches &&
    productDisplayLimit < Math.min(totalMatches, PRODUCT_SEARCH_MAX_LIMIT);

  useEffect(() => {
    setProductDisplayLimit(PRODUCT_SEARCH_INITIAL_VISIBLE);
  }, [trimmedDeferredQuery, categoryFilter]);

  const showSuggestions = searchEnabled && !searchPending;

  const productGroups = useMemo(
    () => groupSearchProductsByCategory(productSuggestions, deferredQuery),
    [productSuggestions, deferredQuery],
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
    goToPath(`/tienda/producto/${product.id}`);
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

  const placeholder = 'Buscar productos, categorías o marcas...';

  const showPanel = panelOpen && (queryTooShort || showSuggestions || isSearchPending);

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
          className="absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(70vh,32rem)] overflow-hidden rounded-lg border border-border/70 bg-popover shadow-[0_8px_24px_rgba(15,23,42,0.12)] sm:left-1/2 sm:right-auto sm:w-[min(100vw-1.5rem,44rem)] sm:-translate-x-1/2"
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
              <ul
                id={listboxId}
                role="listbox"
                aria-label="Resultados de búsqueda"
                className="max-h-[min(62vh,28rem)] overflow-y-auto"
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
              </ul>
              {canLoadMoreProducts || totalMatches > productSuggestions.length ? (
                <div className="space-y-1 border-t border-border/80 bg-muted/10 px-3 py-2">
                  {canLoadMoreProducts ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-1.5 rounded-md py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      onClick={loadMoreProducts}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      Agregar más productos
                    </button>
                  ) : null}
                  {totalMatches > productSuggestions.length ? (
                    <button
                      type="button"
                      className="w-full rounded-md py-2 text-center text-xs font-semibold text-[#0f1f3d] hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      onClick={() => goToSearchResults(query, categoryFilter)}
                    >
                      Ver todos los resultados ({totalMatches})
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

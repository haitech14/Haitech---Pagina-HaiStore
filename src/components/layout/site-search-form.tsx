import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, FolderOpen, Loader2, Plus, Search, Wrench, X } from 'lucide-react';

import { ProductCardCopyButton } from '@/components/product/product-card-copy-button';
import { ProductCardCopyImageButton } from '@/components/product/product-card-copy-image-button';
import { ProductCardImage } from '@/components/product/product-card-image';
import { DualPrice } from '@/components/product/product-dual-price';
import { ProductNoImagePlaceholder } from '@/components/product/product-no-image-placeholder';
import { useAuth } from '@/context/auth-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { prefetchProductSearch, useProductSearch } from '@/hooks/use-product-search';
import { preloadCatalogIndexNow } from '@/lib/defer-catalog-index';
import { categoryLandingPath } from '@/lib/category-path';
import { seedProductQueryCache } from '@/lib/find-cached-product';
import { buildCategorySelectOptions } from '@/lib/inventory-category-options';
import {
  filterCategoriesBySearch,
  filterServicesBySearch,
  groupSearchProductsByPanelSection,
  MIN_PRODUCT_SEARCH_LENGTH,
  normalizeSearchText,
  PRODUCT_SEARCH_INITIAL_VISIBLE,
  PRODUCT_SEARCH_LOAD_MORE_STEP,
  PRODUCT_SEARCH_MAX_LIMIT,
  PRODUCT_SEARCH_PER_SECTION_LIMIT,
  type SearchCategorySuggestion,
  type SearchServiceSuggestion,
} from '@/lib/product-search';
import { resolveProductCardBadgeLabel } from '@/lib/product-card-condition';
import { getHomeLandingProductCardLines } from '@/lib/product-card-title';
import { getCatalogCardPricing } from '@/lib/product-catalog-card-meta';
import { PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS } from '@/lib/product-image-watermark';
import { productPath } from '@/lib/product-path';
import { CONSULTAR_PRECIO_LABEL, formatDisplayPriceFromUsd } from '@/lib/display-price';
import type { Product } from '@/types/product';
import { cn } from '@/lib/utils';

/** Thumbnails ligeros para el panel (sin sanitize/candidatos pesados por fila). */
function buildSearchSuggestionThumbCandidates(product: Product): string[] {
  const urls: string[] = [];
  const push = (value?: string | null) => {
    const raw = value?.trim();
    if (!raw) return;
    const cleaned = raw.split('?')[0] ?? raw;
    if (!urls.includes(cleaned)) urls.push(cleaned);
  };

  push(product.image_url);
  for (const item of product.gallery ?? []) push(item);
  const id = product.id?.trim();
  if (id) {
    push(`/products/${id}-256.webp`);
    push(`/products/${id}.webp`);
  }
  return urls;
}

const ALL_CATEGORIES_VALUE = 'all';

type SiteSearchFormProps = {
  className?: string;
  onNavigate?: () => void;
  /** Barra segmentada (header), campo único (móvil compacto) o compacto oscuro (nav mockup). */
  variant?: 'segmented' | 'simple' | 'header-dark';
  /** Altura del campo segmentado. */
  size?: 'default' | 'compact' | 'dense';
  /** Muestra iconos de lupa (izquierda del campo y botón de envío). */
  showSearchIcons?: boolean;
  /** Enfoca el campo al montar (p. ej. sheet de búsqueda móvil). */
  autoFocusInput?: boolean;
  /** Muestra filtro de categoría encima del campo (variant simple). */
  showCategoryFilter?: boolean;
};

type SearchSuggestionItem =
  | SearchCategorySuggestion
  | SearchServiceSuggestion
  | { type: 'product'; product: Product };

const headerDarkBarClass =
  'flex w-full items-stretch overflow-hidden rounded-lg border border-white/30 bg-white shadow-sm transition-shadow focus-within:border-white/50 focus-within:ring-2 focus-within:ring-white/25';

const headerDarkInputClass =
  'h-9 w-full min-w-0 flex-1 border-0 bg-transparent py-0 pl-2.5 pr-2 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-0';

const headerDarkButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center border-0 bg-transparent text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const searchBarClass =
  'flex w-full items-stretch overflow-hidden rounded-lg border border-border/80 bg-white shadow-sm transition-shadow focus-within:border-border focus-within:ring-2 focus-within:ring-ring/20';

const categorySegmentClass =
  'h-11 min-w-[8rem] max-w-[10rem] appearance-none border-0 border-l border-border/80 bg-white py-0 pl-2.5 pr-8 text-sm text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:min-w-[9rem] sm:max-w-[11rem]';

const searchInputClass =
  'h-11 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-3 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:pl-3';

const searchInputWithIconClass =
  'h-11 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset sm:pl-10';

const searchButtonClass =
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-r-[calc(var(--radius)-1px)] border-0 bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

const compactSearchBarClass =
  'flex w-full items-stretch overflow-hidden rounded-md border border-border/80 bg-white shadow-sm transition-shadow focus-within:border-border focus-within:ring-2 focus-within:ring-ring/20';

const compactCategorySegmentClass =
  'h-9 min-w-[6.75rem] max-w-[8.5rem] appearance-none border-0 border-l border-border/80 bg-white py-0 pl-2 pr-7 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset xl:min-w-[7.5rem] xl:max-w-[9rem]';

const compactSearchInputClass =
  'h-9 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-3 pr-2 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const compactSearchInputWithIconClass =
  'h-9 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-8 pr-2 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const compactSearchButtonClass =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-r-[calc(var(--radius)-1px)] border-0 bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

const denseSearchBarClass =
  'flex w-full max-w-full items-stretch overflow-hidden rounded-full border border-border/80 bg-white shadow-sm transition-shadow focus-within:border-border focus-within:ring-2 focus-within:ring-ring/20';

const denseCategorySegmentClass =
  'h-10 min-w-[5.75rem] max-w-[7.25rem] shrink-0 appearance-none border-0 border-l border-border/80 bg-white py-0 pl-2.5 pr-7 text-xs text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset xl:min-w-[6.25rem] xl:max-w-[8rem]';

const denseSearchInputClass =
  'h-10 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-3 pr-2 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const denseSearchInputWithIconClass =
  'h-10 w-full min-w-0 flex-1 border-0 bg-white py-0 pl-8 pr-2 text-[0.8125rem] text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset';

const denseSearchButtonClass =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-r-full border-0 bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

const SEARCH_SUGGESTION_THUMB_CLASS =
  'size-8 shrink-0 overflow-hidden rounded border border-border/50 bg-white sm:size-9';

const SEARCH_SUGGESTION_CELL_CLASS =
  'flex w-full items-center gap-2 px-3 py-1.5 text-left transition-colors hover:bg-muted/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-inset';

const SEARCH_DROPDOWN_PANEL_CLASS =
  'absolute left-0 right-0 top-full z-[60] mt-2 max-h-[min(80vh,36rem)] overflow-hidden rounded-xl border border-border/70 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.14)] sm:left-1/2 sm:right-auto sm:w-[min(100vw-1rem,42rem)] sm:-translate-x-1/2 lg:w-[min(100vw-1rem,44rem)]';

function SuggestionSectionHeading({ children }: { children: string }) {
  return (
    <p className="border-b border-border/60 bg-muted/25 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground sm:px-3.5">
      {children}
    </p>
  );
}

function highlightSearchTerms(text: string, query: string): React.ReactNode {
  const terms = normalizeSearchText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;

  const pattern = terms
    .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }
    segments.push(
      <span
        key={`${match.index}-${match[0]}`}
        className="underline decoration-foreground/80 underline-offset-[3px]"
      >
        {match[0]}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments.length > 0 ? segments : text;
}

type SearchProductSuggestionCellProps = {
  product: Product;
  query: string;
  optionId: string;
  isActive: boolean;
  onMouseEnter: () => void;
  onNavigateProduct: () => void;
};

function SearchProductSuggestionThumbInner({ candidates }: { candidates: string[] }) {
  const [imageIndex, setImageIndex] = useState(0);
  const [imagesExhausted, setImagesExhausted] = useState(false);

  const src = imagesExhausted ? null : (candidates[imageIndex] ?? null);

  const handleError = () => {
    if (imageIndex + 1 < candidates.length) {
      setImageIndex((current) => current + 1);
      return;
    }
    setImagesExhausted(true);
  };

  if (!src) {
    return (
      <span
        className={cn(
          'flex items-center justify-center overflow-hidden bg-muted/40',
          SEARCH_SUGGESTION_THUMB_CLASS,
        )}
        aria-hidden="true"
      >
        <ProductNoImagePlaceholder size="sm" className="w-full" />
      </span>
    );
  }

  return (
    <ProductCardImage
      src={src}
      alt=""
      className="size-full max-h-full max-w-full object-contain object-center p-px"
      overlayClassName={SEARCH_SUGGESTION_THUMB_CLASS}
      watermarkClassName={PRODUCT_IMAGE_WATERMARK_OVERLAY_COMPACT_CLASS}
      responsiveSizes="36px"
      onError={handleError}
    />
  );
}

function SearchProductSuggestionThumb({ product }: { product: Product }) {
  const imageCandidates = useMemo(
    () => buildSearchSuggestionThumbCandidates(product),
    [product],
  );

  return (
    <SearchProductSuggestionThumbInner
      key={imageCandidates.join('|')}
      candidates={imageCandidates}
    />
  );
}

function SearchProductSuggestionCell({
  product,
  query,
  optionId,
  isActive,
  onMouseEnter,
  onNavigateProduct,
}: SearchProductSuggestionCellProps) {
  const { displayCurrency, dualPriceOrder } = useDisplayCurrency();
  const pricing = getCatalogCardPricing({ id: product.id, price: product.price });
  const showPrice = product.price > 0;
  const { headline, subtitle } = getHomeLandingProductCardLines(product);
  const title = subtitle ? `${headline} · ${subtitle}` : headline;
  const priceAria = showPrice
    ? formatDisplayPriceFromUsd(pricing.currentUsd, displayCurrency, dualPriceOrder)
    : CONSULTAR_PRECIO_LABEL;
  const clipboardCondition = resolveProductCardBadgeLabel(product);
  const clipboardCode = product.code?.trim() || null;
  const stockCount = Math.max(0, Math.floor(Number(product.stock) || 0));
  const detailPath = productPath(product);
  const clipboardImageUrl = useMemo(
    () => buildSearchSuggestionThumbCandidates(product)[0] ?? null,
    [product],
  );
  const copyActionClass =
    'shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

  return (
    <div
      id={optionId}
      role="option"
      aria-selected={isActive}
      aria-label={[title, priceAria].filter(Boolean).join(', ')}
      className={cn(
        SEARCH_SUGGESTION_CELL_CLASS,
        'cursor-pointer',
        isActive && 'bg-accent',
      )}
      onMouseEnter={onMouseEnter}
      onClick={onNavigateProduct}
    >
      <SearchProductSuggestionThumb product={product} />
      <span className="flex min-w-0 flex-1 items-start gap-2">
        <span className="min-w-0 flex-1">
          <span className="line-clamp-1 text-[0.75rem] font-medium leading-snug text-foreground sm:text-[0.8125rem]">
            {highlightSearchTerms(headline, query)}
            {subtitle ? (
              <span className="font-normal text-muted-foreground">
                {' · '}
                {subtitle}
              </span>
            ) : null}
          </span>
        </span>
        {showPrice ? (
          <span className="shrink-0 text-[0.6875rem] font-semibold tabular-nums sm:text-xs">
            <DualPrice usd={pricing.currentUsd} />
          </span>
        ) : (
          <span className="shrink-0 text-[0.6875rem] font-medium text-[#E30613]">
            {CONSULTAR_PRECIO_LABEL}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-0.5">
        {clipboardImageUrl ? (
          <ProductCardCopyImageButton
            productName={product.name}
            imageUrl={clipboardImageUrl}
            className={copyActionClass}
          />
        ) : null}
        <ProductCardCopyButton
          productName={product.name}
          title={product.name}
          stock={stockCount}
          priceUsd={product.price}
          productId={product.id}
          productPath={detailPath}
          {...(clipboardCode != null ? { code: clipboardCode } : {})}
          {...(clipboardCondition != null ? { condition: clipboardCondition } : {})}
          {...(product.volume_role_prices != null
            ? { volumeRolePrices: product.volume_role_prices }
            : {})}
          className={copyActionClass}
        />
      </span>
    </div>
  );
}

function SearchProductSuggestionSkeleton() {
  return (
    <div className={cn(SEARCH_SUGGESTION_CELL_CLASS)} aria-hidden="true">
      <div className={cn('animate-pulse bg-muted', SEARCH_SUGGESTION_THUMB_CLASS)} />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export function SiteSearchForm({
  className,
  onNavigate,
  variant = 'segmented',
  size = 'default',
  showSearchIcons = true,
  autoFocusInput = false,
  showCategoryFilter = false,
}: SiteSearchFormProps) {
  const isDense = variant === 'segmented' && size === 'dense';
  const isCompact = variant === 'segmented' && (size === 'compact' || size === 'dense');

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
  const [pagination, setPagination] = useState({
    scopeKey: '',
    extraLoads: 0,
  });

  const debouncedQuery = useDebouncedValue(query, 120);

  const categoryOptions = useMemo(() => {
    const fromTree = buildCategorySelectOptions(categoryTree);
    return [{ value: ALL_CATEGORIES_VALUE, label: 'Categorías' }, ...fromTree];
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
  const paginationScopeKey = `${trimmedDebouncedQuery}|${categoryFilter}`;

  if (pagination.scopeKey !== paginationScopeKey) {
    setPagination({ scopeKey: paginationScopeKey, extraLoads: 0 });
  }

  const productDisplayLimit = Math.min(
    PRODUCT_SEARCH_INITIAL_VISIBLE + pagination.extraLoads * PRODUCT_SEARCH_LOAD_MORE_STEP,
    PRODUCT_SEARCH_MAX_LIMIT,
  );

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

  const productSuggestions = useMemo(
    () => searchResult?.products ?? [],
    [searchResult?.products],
  );
  const totalMatches = searchResult?.total ?? 0;
  const isProductsLoading =
    searchEnabled && (searchLoading || isSearchDebouncing) && productSuggestions.length === 0;
  const isSearchRefreshing =
    searchEnabled && searchFetching && !searchLoading && !isSearchDebouncing;
  const canLoadMoreProducts =
    productSuggestions.length > 0 &&
    productSuggestions.length < totalMatches &&
    productDisplayLimit < Math.min(totalMatches, PRODUCT_SEARCH_MAX_LIMIT);

  const productSectionGroups = useMemo(() => {
    const groups = groupSearchProductsByPanelSection(
      productSuggestions,
      trimmedDebouncedQuery,
    );
    // Todas las secciones desplegadas con sus productos (sin recortar a 3).
    return groups.map((group) => {
      const visible =
        group.products.length <= PRODUCT_SEARCH_PER_SECTION_LIMIT
          ? group.products
          : group.products.slice(0, PRODUCT_SEARCH_PER_SECTION_LIMIT);
      return {
        category: group.category,
        products: visible,
        hiddenCount: Math.max(0, group.products.length - visible.length),
      };
    });
  }, [productSuggestions, trimmedDebouncedQuery]);

  const visibleProductSuggestions = useMemo(
    () => productSectionGroups.flatMap((group) => group.products),
    [productSectionGroups],
  );

  useEffect(() => {
    if (!autoFocusInput) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100);
    return () => window.clearTimeout(timer);
  }, [autoFocusInput]);

  const productSuggestionsWithIndices = useMemo(() => {
    const baseIndex = categorySuggestions.length + serviceSuggestions.length;
    let offset = 0;
    return productSectionGroups.map((group) => {
      const products = group.products.map((product, productIndex) => ({
        product,
        suggestionIndex: baseIndex + offset + productIndex,
      }));
      offset += group.products.length;
      return {
        category: group.category,
        hiddenCount: group.hiddenCount,
        products,
      };
    });
  }, [productSectionGroups, categorySuggestions.length, serviceSuggestions.length]);

  const suggestions = useMemo<SearchSuggestionItem[]>(
    () => [
      ...categorySuggestions,
      ...serviceSuggestions,
      ...visibleProductSuggestions.map((product) => ({ type: 'product' as const, product })),
    ],
    [categorySuggestions, serviceSuggestions, visibleProductSuggestions],
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
    preloadCatalogIndexNow();
    void prefetchProductSearch(queryClient, {
      query: 'ricoh',
      categoryFilter,
      limit: PRODUCT_SEARCH_INITIAL_VISIBLE,
      role,
      viewAsRoles,
    });
  }, [queryClient, categoryFilter, role, viewAsRoles]);

  const resolvedActiveIndex = useMemo(() => {
    if (!showPanel || queryTooShort || suggestions.length === 0) return -1;
    if (activeIndex < 0 || activeIndex >= suggestions.length) return -1;
    return activeIndex;
  }, [showPanel, queryTooShort, suggestions.length, activeIndex]);

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
    setPagination((current) =>
      current.scopeKey === paginationScopeKey
        ? { ...current, extraLoads: current.extraLoads + 1 }
        : { scopeKey: paginationScopeKey, extraLoads: 1 },
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

    if (event.key === 'Enter' && resolvedActiveIndex >= 0 && suggestions[resolvedActiveIndex]) {
      event.preventDefault();
      activateSuggestion(suggestions[resolvedActiveIndex]);
    }
  };

  const placeholder =
    variant === 'header-dark' || isDense
      ? 'Buscar productos...'
      : 'Buscar productos, categorías o marcas...';

  const showSuggestionsList =
    !queryTooShort &&
    !showEmptyResults &&
    (suggestions.length > 0 || isProductsLoading);

  const showViewAllResultsButton =
    trimmedQuery.length >= MIN_PRODUCT_SEARCH_LENGTH && showSuggestionsList;

  const showLeadingIcon = showSearchIcons && variant === 'segmented';
  const showSubmitIcon = showSearchIcons && variant === 'segmented';
  const showClearButton = query.length > 0;
  const clearButtonInsetClass =
    variant === 'simple'
      ? 'right-10'
      : variant === 'segmented'
        ? isCompact
          ? 'right-2'
          : 'right-2.5'
        : 'right-2';

  const barClass =
    variant === 'header-dark'
      ? headerDarkBarClass
      : isDense
        ? denseSearchBarClass
        : isCompact
          ? compactSearchBarClass
          : searchBarClass;
  const inputClass =
    variant === 'header-dark'
      ? headerDarkInputClass
      : isDense
        ? showLeadingIcon
          ? denseSearchInputWithIconClass
          : denseSearchInputClass
        : isCompact
          ? showLeadingIcon
            ? compactSearchInputWithIconClass
            : compactSearchInputClass
          : showLeadingIcon
            ? searchInputWithIconClass
            : searchInputClass;
  const categoryClass = isDense
    ? denseCategorySegmentClass
    : isCompact
      ? compactCategorySegmentClass
      : categorySegmentClass;
  const submitButtonClass = isDense
    ? denseSearchButtonClass
    : isCompact
      ? compactSearchButtonClass
      : searchButtonClass;

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      {variant === 'simple' && showCategoryFilter ? (
        <div className="mb-2">
          <label htmlFor={categoryFieldId} className="mb-1 block text-xs font-medium text-muted-foreground">
            Categoría
          </label>
          <div className="relative">
            <select
              id={categoryFieldId}
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-border/80 bg-white py-0 pl-3 pr-9 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Filtrar por categoría"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
        </div>
      ) : null}
      <form
        role="search"
        className={barClass}
        onSubmit={handleSubmit}
      >
        <label htmlFor={inputFieldId} className="sr-only">
          Buscar en la tienda
        </label>
        <div className="relative min-w-0 flex-1">
          {showLeadingIcon ? (
            <Search
              className={cn(
                'pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground/70',
                isCompact ? 'left-2.5 size-3.5' : 'left-3 size-4',
              )}
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
              resolvedActiveIndex >= 0 && suggestions[resolvedActiveIndex]
                ? `${listboxId}-option-${resolvedActiveIndex}`
                : undefined
            }
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            className={cn(
              inputClass,
              variant === 'simple' && 'pr-11',
              showClearButton && variant === 'segmented' && (isCompact ? 'pr-9' : 'pr-10'),
              showClearButton && variant === 'header-dark' && 'pr-9',
            )}
          />
          {showClearButton ? (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              className={cn(
                'absolute top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                clearButtonInsetClass,
                isCompact ? 'size-6' : 'size-7',
              )}
              onClick={() => {
                setQuery('');
                setActiveIndex(-1);
                inputRef.current?.focus();
              }}
            >
              <X className={isCompact ? 'size-3.5' : 'size-4'} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
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
                className={categoryClass}
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

            {showSubmitIcon ? (
              <button type="submit" aria-label="Buscar" className={submitButtonClass}>
                <Search className={isCompact ? 'size-3.5' : 'size-4'} strokeWidth={2} aria-hidden="true" />
              </button>
            ) : null}
          </>
        ) : variant === 'header-dark' ? (
          <button type="submit" aria-label="Buscar" className={headerDarkButtonClass}>
            <Search className="size-4" strokeWidth={2} aria-hidden="true" />
          </button>
        ) : (
          <button type="submit" className="sr-only">
            Buscar
          </button>
        )}
      </form>

      {showPanel ? (
        <div className={SEARCH_DROPDOWN_PANEL_CLASS} role="presentation">
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
                className="max-h-[min(72vh,32rem)] overflow-y-auto"
              >
                {categorySuggestions.length > 0 ? (
                  <>
                    <li role="presentation">
                      <SuggestionSectionHeading>Categorías</SuggestionSectionHeading>
                    </li>
                    {categorySuggestions.map((item, index) => {
                      const isActive = index === resolvedActiveIndex;
                      return (
                        <li key={`category-${item.slug}`} role="presentation">
                          <button
                            id={`${listboxId}-option-${index}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[0.8125rem] transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => activateSuggestion(item)}
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded border border-border/60 bg-muted/40 text-foreground/70 sm:size-9">
                              <FolderOpen
                                className="size-3.5"
                                strokeWidth={1.75}
                                aria-hidden="true"
                              />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-foreground">{item.name}</span>
                              <span className="mt-0.5 line-clamp-1 text-[0.6875rem] text-muted-foreground">
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
                      const isActive = suggestionIndex === resolvedActiveIndex;
                      return (
                        <li key={`service-${item.href}`} role="presentation">
                          <button
                            id={`${listboxId}-option-${suggestionIndex}`}
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={cn(
                              'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[0.8125rem] transition-colors',
                              isActive ? 'bg-accent' : 'hover:bg-muted/60',
                            )}
                            onMouseEnter={() => setActiveIndex(suggestionIndex)}
                            onClick={() => activateSuggestion(item)}
                          >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded border border-border/60 bg-red-600/10 text-red-600 sm:size-9">
                              <Wrench className="size-3.5" strokeWidth={1.75} aria-hidden="true" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-medium text-foreground">{item.name}</span>
                              <span className="mt-0.5 line-clamp-1 text-[0.6875rem] text-muted-foreground">
                                {item.subtitle}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </>
                ) : null}

                {productSuggestionsWithIndices.length > 0 ? (
                  productSuggestionsWithIndices.map((group) => (
                    <li key={`product-section-${group.category}`} role="presentation">
                      <SuggestionSectionHeading>{group.category}</SuggestionSectionHeading>
                      <ul role="group" aria-label={group.category} className="divide-y divide-border/50">
                        {group.products.map(({ product, suggestionIndex }) => {
                          const isActive = suggestionIndex === resolvedActiveIndex;
                          return (
                            <li key={product.id} role="presentation" className="min-w-0">
                              <SearchProductSuggestionCell
                                product={product}
                                query={trimmedQuery}
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
                      {group.hiddenCount > 0 ? (
                        <button
                          type="button"
                          className="w-full border-b border-border/50 px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
                          onClick={() => goToSearchResults(query, categoryFilter)}
                        >
                          Ver más en {group.category}
                          {group.hiddenCount > 0 ? ` (+${group.hiddenCount})` : ''}
                        </button>
                      ) : null}
                    </li>
                  ))
                ) : null}

                {isProductsLoading ? (
                  <>
                    <li role="presentation">
                      <SuggestionSectionHeading>Productos</SuggestionSectionHeading>
                    </li>
                    <li role="presentation">
                      <ul className="divide-y divide-border/50" aria-hidden="true">
                        {[0, 1, 2].map((index) => (
                          <li key={`product-skeleton-${index}`} role="presentation">
                            <SearchProductSuggestionSkeleton />
                          </li>
                        ))}
                      </ul>
                    </li>
                  </>
                ) : null}
              </ul>
              {canLoadMoreProducts || showViewAllResultsButton ? (
                <div className="border-t border-border/80 bg-muted/10">
                  {canLoadMoreProducts ? (
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-1.5 px-3 py-2 text-center text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset"
                      onClick={loadMoreProducts}
                    >
                      <Plus className="size-3.5" aria-hidden="true" />
                      Agregar más productos
                    </button>
                  ) : null}
                  {showViewAllResultsButton ? (
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-center px-3 py-2.5 text-center text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset sm:text-[0.8125rem]',
                        canLoadMoreProducts && 'border-t border-border/60',
                      )}
                      onClick={() => goToSearchResults(query, categoryFilter)}
                    >
                      Ver todos los resultados
                      {totalMatches > 0 ? ` (${totalMatches})` : ''}
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

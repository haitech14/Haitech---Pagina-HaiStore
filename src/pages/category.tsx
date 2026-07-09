import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Plus, PanelLeftClose, SlidersHorizontal } from 'lucide-react';

import { StoreCatalogHeader } from '@/components/store-storefront/store-catalog-header';
import { StoreCatalogProductCard } from '@/components/store-storefront/store-catalog-product-card';
import { StoreCatalogViewControls } from '@/components/store-storefront/store-catalog-view-controls';
import { StoreSubcategoryCarousel } from '@/components/store-storefront/store-subcategory-carousel';
import { storeCatalogCopy } from '@/data/store-landing';
import { CatalogFilterOption } from '@/components/catalog-filter-option';
import { CatalogFilterGroup } from '@/components/catalog-filter-group';
import { CatalogFilterSection } from '@/components/catalog-filter-section';
import { CatalogSidebarNav } from '@/components/catalog-sidebar-nav';
import { CategoryCatalogFormatSections } from '@/components/category/category-catalog-format-sections';
import {
  CategoryCatalogToolbar,
  type CatalogViewMode,
  type CategorySortValue,
} from '@/components/category/category-catalog-toolbar';
import { CatalogProductPagination } from '@/components/category/catalog-product-pagination';
import { HomeCatalogLoadError } from '@/components/home-catalog-load-error';
import { RentalCategoryGrid } from '@/components/rental-category-grid';
import { SubcategoryTabs } from '@/components/subcategory-tabs';
import {
  CategoryProductsTable,
  CategoryProductsTableSkeleton,
} from '@/components/category-products-table';
import { ProductCard } from '@/components/product-card';
import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/range-slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useQuery } from '@tanstack/react-query';

import { useCategoryCatalog } from '@/hooks/use-category-catalog';
import { useProducts } from '@/hooks/use-products';
import { useSeo } from '@/hooks/use-seo';
import { searchCatalogProducts } from '@/lib/catalog-search-api';
import { buildCategorySeoConfig } from '@/lib/build-category-seo';
import { getCategorySeoIntro } from '@/lib/category-seo-intro';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import {
  findCategoryBySlug,
  findStoreSubcategoryBySlug,
  resolveCategoryPageProductLabels,
} from '@/lib/category-product-labels';
import {
  ALL_SUBCATEGORIES_QUERY,
  collectInventoryLabels,
  findRootCategorySlugForSubcategory,
  findStoreCategoryBySlug,
  formatSubcategoryTabLabel,
  parseCategorySubSearchParam,
} from '@/lib/store-category-display';
import { prefetchCategoryPage } from '@/lib/prefetch-category-page';
import { queryClient } from '@/providers';
import { prepareCatalogCategoryTree } from '@/lib/catalog-category-tree';
import { syncStoreCategoryTreeProductCounts } from '@/lib/store-category-product-counts';
import { excludeStoreSoftwareProducts } from '@/lib/store-software-products';
import type { ActiveFilterChip } from '@/components/category/category-active-filter-chips';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { applyEquipmentSubcategorySlugFilter } from '@/lib/equipment-subcategory-filter';
import {
  filterProductsBySearch,
  MIN_PRODUCT_SEARCH_LENGTH,
} from '@/lib/product-search';
import { useCategoryConditionFilter } from '@/components/product-condition-tabs';
import {
  CATEGORY_HERO_ID,
  CATEGORY_PRODUCTS_ID,
  scrollToCategoryHero,
  scrollToCategoryProducts,
} from '@/lib/category-path';
import {
  findRentalCategoryBySlug,
  RENTAL_PARENT_SLUG,
} from '@/data/rental-categories';
import {
  catalogGridClassName,
  type CatalogGridColumns,
  CATALOG_SIDEBAR_DEFAULT_COLUMNS,
} from '@/lib/category-grid-layout';
import {
  CATALOG_FORMAT_SECTION_MAX,
  CATALOG_TABLE_VIEW_MAX,
  getCatalogPageSlice,
  getCatalogTotalPages,
  getResponsiveCatalogPageSize,
  clampCatalogPage,
} from '@/lib/catalog-product-pagination';
import {
  catalogFamilyForCategorySlug,
  isPrinterEquipmentProduct,
  productMatchesCondition,
} from '@/lib/product-condition';
import {
  buildCatalogQuickFilters,
  buildBrandFilterOptions,
  buildCatalogFormatSections,
  buildCatalogSpecFilterTabs,
  CATALOG_SPEC_FILTER_TAB_KEYS,
  countProductsForAttributeKey,
  EXCLUDED_QUICK_ATTRIBUTE_KEYS,
  getQuickFilterChipLabel,
  isModeloEquipoAttributeKey,
  isProduccionAttributeKey,
  isRendimientoAttributeKey,
  PRODUCTION_FILTER_OPTIONS,
  SPEED_FILTER_OPTIONS,
  countProductsForSpeedFilterKey,
  productMatchesSpeedFilterKeys,
  shouldShowSpeedFilters,
  productMatchesCatalogFilters,
  productMatchesBrandFilter,
  MOST_VIEWED_OFFER_ATTR_KEY,
  shouldShowCatalogSpecFilterTabs,
  shouldShowProductionFilters,
  shouldUseCatalogSidebarLayout,
  getCatalogLayoutOrderedProducts,
  getSpecFilterDisplayLabel,
  toggleCatalogSpecFilter,
} from '@/lib/category-catalog-filters';
import { useIsDesktopNav, useIsMobile } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

const EMPTY_PRODUCT_LIST: Product[] = [];
const EMPTY_LABEL_LIST: string[] = [];

function ProductSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col overflow-hidden rounded-xl border border-border/50 bg-white shadow-[0_2px_12px_rgba(15,31,61,0.08)]"
    >
      <div className="aspect-square animate-pulse bg-neutral-100" />
      <div className="flex flex-col gap-2 px-3 pb-3 pt-2">
        <div className="h-10 animate-pulse rounded bg-neutral-100" />
        <div className="h-5 w-2/3 animate-pulse rounded bg-neutral-100" />
        <div className="mt-1 flex gap-1.5">
          <div className="h-8 w-16 animate-pulse rounded-md bg-neutral-100" />
          <div className="h-8 flex-1 animate-pulse rounded-md bg-neutral-100" />
        </div>
      </div>
    </div>
  );
}

export type CategoryPageProps = {
  /** Slug fijo cuando la ruta es `/tienda` (sin `:slug` en la URL). */
  catalogSlug?: string;
  /** Layout tipo storefront (cabecera y estilos alineados a Servicios). */
  storefrontMode?: boolean;
};

export function CategoryPage({ catalogSlug, storefrontMode = false }: CategoryPageProps = {}) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = catalogSlug ?? routeSlug;
  const isStoreAll = !slug;
  const isRentalCategory = slug === RENTAL_PARENT_SLUG;
  const catalogSidebarLayout = isStoreAll ? true : shouldUseCatalogSidebarLayout(slug);
  const showCatalogSpecFilters = shouldShowCatalogSpecFilterTabs(slug);
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const rawSubSlug = searchParams.get('sub');
  const { subSlug, isAllSubcategoriesView } = parseCategorySubSearchParam(rawSubSlug);
  const searchQuery = searchParams.get('buscar')?.trim() ?? '';
  const searchCategoryFilter = searchParams.get('cat')?.trim() || 'all';
  const isInventorySearch = searchQuery.length >= MIN_PRODUCT_SEARCH_LENGTH;
  const estadoFilter = useCategoryConditionFilter();

  const category = slug ? findCategoryBySlug(slug) : undefined;
  const catalogFamily = slug ? catalogFamilyForCategorySlug(slug) : null;
  const {
    data: categoryTreeData,
    isLoading: categoryTreeLoading,
    isError: categoryTreeError,
    isFetching: categoryTreeFetching,
    refetch: refetchCategoryTree,
  } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;
  const storeFilterCategorySlug = useMemo(() => {
    if (searchCategoryFilter !== 'all') return searchCategoryFilter;
    if (isStoreAll && subSlug && !isAllSubcategoriesView && categoryTree.length > 0) {
      return findRootCategorySlugForSubcategory(categoryTree, subSlug);
    }
    return null;
  }, [searchCategoryFilter, isStoreAll, subSlug, isAllSubcategoriesView, categoryTree]);
  const syncSidebarCountsFromCatalog = !isInventorySearch && !isRentalCategory;
  const { data: allProductsData, isFetching: productsFetching, isPending: productsPending } =
    useProducts({ enabled: syncSidebarCountsFromCatalog });
  const allProducts = allProductsData ?? EMPTY_PRODUCT_LIST;
  const storeCatalogProducts = useMemo(
    () => (isStoreAll ? excludeStoreSoftwareProducts(allProducts) : allProducts),
    [allProducts, isStoreAll],
  );
  const sidebarCategoryTree = useMemo(() => {
    const preparedTree = prepareCatalogCategoryTree(categoryTree);
    if (!syncSidebarCountsFromCatalog) return preparedTree;
    const productsForCounts = isStoreAll ? storeCatalogProducts : allProducts;
    return syncStoreCategoryTreeProductCounts(preparedTree, productsForCounts);
  }, [categoryTree, allProducts, storeCatalogProducts, isStoreAll, syncSidebarCountsFromCatalog]);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(() => {
    const raw = searchParams.get('attrs');
    if (!raw?.trim()) return [];
    return raw
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean);
  });
  const [selectedBrands, setSelectedBrands] = useState<string[]>(() => {
    const raw = searchParams.get('marca');
    if (!raw?.trim()) return [];
    return [raw.trim().toLowerCase()];
  });
  const [selectedProduction, setSelectedProduction] = useState<string | null>(null);
  const [selectedSpeeds, setSelectedSpeeds] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<CategorySortValue>('price-asc');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('grid');
  const [gridColumns, setGridColumns] = useState<CatalogGridColumns>(
    catalogSidebarLayout ? CATALOG_SIDEBAR_DEFAULT_COLUMNS : 6,
  );
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(true);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const isMobile = useIsMobile();
  const isDesktopNav = useIsDesktopNav();
  const filtersAsideRef = useRef<HTMLElement>(null);
  const openCreateProductRef = useRef<(() => void) | null>(null);
  const { isAdmin, role, viewAsRoles, effectiveRole } = useAuth();

  const bindOpenCreate = useCallback((openCreate: (() => void) | null) => {
    openCreateProductRef.current = openCreate;
  }, []);

  const storeCategory = useMemo(
    () => (slug ? findStoreCategoryBySlug(categoryTree, slug) : undefined),
    [categoryTree, slug],
  );

  const storeFilterCategory = useMemo(
    () =>
      storeFilterCategorySlug
        ? findStoreCategoryBySlug(categoryTree, storeFilterCategorySlug)
        : undefined,
    [categoryTree, storeFilterCategorySlug],
  );

  const storeFilterSubcategory = useMemo(
    () =>
      storeFilterCategory && subSlug
        ? findStoreSubcategoryBySlug(storeFilterCategory, subSlug)
        : undefined,
    [storeFilterCategory, subSlug],
  );

  const sidebarActiveCategorySlug = isStoreAll
    ? (storeFilterCategorySlug ?? '')
    : (slug ?? '');

  const rentalSubcategory = useMemo(
    () => (subSlug && slug === RENTAL_PARENT_SLUG ? findRentalCategoryBySlug(subSlug) : undefined),
    [slug, subSlug],
  );

  const activeSubcategory = useMemo(
    () =>
      subSlug && storeCategory
        ? findStoreSubcategoryBySlug(storeCategory, subSlug)
        : undefined,
    [storeCategory, subSlug],
  );

  const productLabels = useMemo(() => {
    if (isStoreAll) return EMPTY_LABEL_LIST;
    if (!category) return EMPTY_LABEL_LIST;
    return resolveCategoryPageProductLabels(category, storeCategory, subSlug, categoryTree);
  }, [category, storeCategory, subSlug, categoryTree, isStoreAll]);

  const catalogPageSize = getResponsiveCatalogPageSize(isMobile, gridColumns);
  const isTableView = viewMode === 'table';
  const showFormatSectionsEarly =
    shouldShowCatalogSpecFilterTabs(slug) && viewMode === 'grid';
  const formatSectionFetchLimit = showFormatSectionsEarly
    ? CATALOG_FORMAT_SECTION_MAX
    : isTableView
      ? CATALOG_TABLE_VIEW_MAX
      : catalogPageSize;
  const catalogFetchPage = showFormatSectionsEarly || isTableView ? 1 : catalogPage;

  const {
    data: catalogData,
    isLoading: catalogLoading,
    isError: catalogError,
    isFetching: catalogFetching,
    refetch: refetchCatalog,
  } = useCategoryCatalog({
    enabled: Boolean(slug) && !isRentalCategory && !isInventorySearch && productLabels.length > 0,
    slug: slug ?? '',
    subSlug,
    labels: productLabels,
    condition: estadoFilter,
    inStockOnly,
    priceMin,
    priceMax,
    brandKeys: selectedBrands,
    attributeKeys: selectedAttributes,
    productionKey: selectedProduction,
    speedKeys: selectedSpeeds,
    search: catalogSearch,
    sortBy,
    page: catalogFetchPage,
    limit: formatSectionFetchLimit,
  });

  const { data: searchData, isLoading: searchLoading, isError: searchError, isFetching: searchFetching, refetch: refetchSearch } = useQuery({
    queryKey: ['catalog-search', searchQuery, searchCategoryFilter, role, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () =>
      searchCatalogProducts(searchQuery, {
        categoryFilter: searchCategoryFilter,
        limit: 100,
        role,
      }),
    enabled: isInventorySearch,
    staleTime: 30_000,
    placeholderData: (previous) => previous,
    select: (payload) =>
      shouldApplyViewAsPriceTransform(viewAsRoles)
        ? {
            ...payload,
            products: applyViewAsPriceToProducts(payload.products, effectiveRole),
          }
        : payload,
  });

  const useServerCatalog = !isStoreAll && !isInventorySearch && !isRentalCategory && productLabels.length > 0;
  const products = isInventorySearch
    ? (searchData?.products ?? EMPTY_PRODUCT_LIST)
    : isStoreAll
      ? storeCatalogProducts
      : (catalogData?.products ?? EMPTY_PRODUCT_LIST);
  const storeAwaitingProducts =
    isStoreAll && allProducts.length === 0 && (productsPending || productsFetching);
  const isLoading = isInventorySearch
    ? searchLoading
    : isStoreAll
      ? storeAwaitingProducts || (categoryTreeLoading && categoryTree.length === 0)
      : catalogLoading;
  const isError = isInventorySearch ? searchError : catalogError;
  const isCatalogFetching = isInventorySearch ? searchFetching : catalogFetching;
  const refetchCatalogProducts = isInventorySearch ? refetchSearch : refetchCatalog;

  const baseProducts = useMemo(() => {
    if (!products.length) return EMPTY_PRODUCT_LIST;

    if (isInventorySearch) {
      // El servidor ya filtró y ordenó; solo re-filtrar categoría si el árbol aporta reglas extra.
      const storeSearchProducts = isStoreAll ? excludeStoreSoftwareProducts(products) : products;
      if (searchCategoryFilter === 'all' || !categoryTree.length) {
        return storeSearchProducts;
      }
      return filterProductsBySearch(storeSearchProducts, searchQuery, {
        categoryFilter: searchCategoryFilter,
        categoryTree,
      });
    }

    if (isStoreAll) {
      if (!storeFilterCategorySlug || !categoryTree.length) {
        return products;
      }
      const activeStoreCategory = findStoreCategoryBySlug(categoryTree, storeFilterCategorySlug);
      if (!activeStoreCategory) return products;

      let labels = collectInventoryLabels(activeStoreCategory);
      if (subSlug && !isAllSubcategoriesView) {
        const sub = findStoreSubcategoryBySlug(activeStoreCategory, subSlug);
        if (sub) labels = collectInventoryLabels(sub);
      }

      let list = products.filter((product) =>
        labels.some((label) => productMatchesCategoryFilter(product, label)),
      );
      if (subSlug && !isAllSubcategoriesView) {
        list = applyEquipmentSubcategorySlugFilter(list, subSlug);
      }
      return list;
    }

    if (useServerCatalog) {
      return products;
    }

    return applyEquipmentSubcategorySlugFilter(
      products.filter((product) => {
        if (slug === 'sin-categoria') {
          return !String(product.category ?? '').trim();
        }
        if (slug === 'repuestos' && isPrinterEquipmentProduct(product)) {
          return false;
        }
        return productLabels.some((label) => productMatchesCategoryFilter(product, label));
      }),
      subSlug,
    );
  }, [
    products,
    productLabels,
    isInventorySearch,
    isStoreAll,
    useServerCatalog,
    searchQuery,
    searchCategoryFilter,
    categoryTree,
    slug,
    subSlug,
    storeFilterCategorySlug,
    isAllSubcategoriesView,
  ]);

  const facetCountProducts = useMemo(() => {
    if (isInventorySearch || isRentalCategory || productLabels.length === 0) {
      return baseProducts;
    }
    if (syncSidebarCountsFromCatalog && allProducts.length > 0) {
      return applyEquipmentSubcategorySlugFilter(
        allProducts.filter((product) => {
          if (slug === 'repuestos' && isPrinterEquipmentProduct(product)) {
            return false;
          }
          return productLabels.some((label) => productMatchesCategoryFilter(product, label));
        }),
        subSlug,
      );
    }
    return baseProducts;
  }, [
    baseProducts,
    allProducts,
    syncSidebarCountsFromCatalog,
    isInventorySearch,
    isRentalCategory,
    productLabels,
    slug,
    subSlug,
  ]);

  const mostViewedOfferFilter = useMemo(() => {
    const fromFacets = catalogData?.facets?.attributes?.find(
      (attr) => attr.key === MOST_VIEWED_OFFER_ATTR_KEY,
    );
    const count = countProductsForAttributeKey(facetCountProducts, MOST_VIEWED_OFFER_ATTR_KEY);
    if (!fromFacets && count === 0) return null;
    return {
      key: MOST_VIEWED_OFFER_ATTR_KEY,
      label: 'Más vistos',
      count: fromFacets?.count ?? count,
    };
  }, [catalogData?.facets?.attributes, facetCountProducts]);

  const availableAttributes = useMemo(() => {
    if (useServerCatalog && catalogData?.facets?.attributes) {
      return catalogData.facets.attributes.map((attr) => ({
        ...attr,
        displayLabel: getQuickFilterChipLabel(attr),
        count: countProductsForAttributeKey(baseProducts, attr.key),
      }));
    }

    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const product of baseProducts) {
      for (const attr of product.attributes ?? []) {
        const key = `${attr.name}::${attr.value}`;
        if (EXCLUDED_QUICK_ATTRIBUTE_KEYS.has(key)) continue;
        if (isProduccionAttributeKey(key)) continue;
        if (isRendimientoAttributeKey(key)) continue;
        const label = `${attr.name}: ${attr.value}`;
        const prev = map.get(key);
        map.set(key, { key, label, count: (prev?.count ?? 0) + 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  }, [baseProducts, useServerCatalog, catalogData?.facets?.attributes]);

  const sidebarAttributeOptions = useMemo(() => {
    return availableAttributes
      .filter(
        (attr) =>
          attr.key !== MOST_VIEWED_OFFER_ATTR_KEY &&
          !isModeloEquipoAttributeKey(attr.key) &&
          !isRendimientoAttributeKey(attr.key),
      )
      .map((attr) => ({
        ...attr,
        displayLabel: getQuickFilterChipLabel(attr),
        count: countProductsForAttributeKey(baseProducts, attr.key),
      }));
  }, [availableAttributes, baseProducts]);

  const availablePriceRange = useMemo(() => {
    if (useServerCatalog && catalogData?.facets?.priceRange) {
      return catalogData.facets.priceRange;
    }
    if (baseProducts.length === 0) return { min: 0, max: 0 };
    const prices = baseProducts.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [baseProducts, useServerCatalog, catalogData?.facets?.priceRange]);

  useEffect(() => {
    setPriceMin((prev) =>
      prev == null
        ? prev
        : Math.max(availablePriceRange.min, Math.min(prev, availablePriceRange.max)),
    );
    setPriceMax((prev) =>
      prev == null
        ? prev
        : Math.max(availablePriceRange.min, Math.min(prev, availablePriceRange.max)),
    );
  }, [availablePriceRange.min, availablePriceRange.max]);

  const brandFilterOptions = useMemo(() => {
    if (useServerCatalog && catalogData?.facets?.brands) {
      return catalogData.facets.brands;
    }
    return buildBrandFilterOptions(baseProducts);
  }, [baseProducts, useServerCatalog, catalogData?.facets?.brands]);

  const availableAttributeKeys = useMemo(
    () => availableAttributes.map((attr) => attr.key).join('|'),
    [availableAttributes],
  );

  useEffect(() => {
    setSelectedAttributes([]);
    const marcaFromUrl = searchParams.get('marca')?.trim().toLowerCase();
    setSelectedBrands(marcaFromUrl ? [marcaFromUrl] : []);
    setSelectedProduction(null);
    setSelectedSpeeds([]);
    setPriceMin(null);
    setPriceMax(null);
    setCatalogSearch('');
  }, [slug, subSlug]);

  const availableBrandKeys = useMemo(
    () => brandFilterOptions.map((brand: { key: string }) => brand.key).join('|'),
    [brandFilterOptions],
  );

  useEffect(() => {
    if (!availableBrandKeys) return;
    const validKeys = new Set(availableBrandKeys.split('|').filter(Boolean));
    setSelectedBrands((prev) => {
      const next = prev.filter((key) => validKeys.has(key));
      if (next.length === prev.length && next.every((key, index) => key === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [availableBrandKeys]);

  useEffect(() => {
    if (!availableAttributeKeys) return;
    const validKeys = new Set(availableAttributeKeys.split('|').filter(Boolean));
    setSelectedAttributes((prev) => {
      const next = prev.filter((key) => validKeys.has(key));
      if (next.length === prev.length && next.every((key, index) => key === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [availableAttributeKeys]);

  const filteredProducts = useMemo(() => {
    if (useServerCatalog && !showFormatSectionsEarly) {
      return baseProducts;
    }

    const min = priceMin ?? availablePriceRange.min;
    const max = priceMax ?? availablePriceRange.max;
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);

    let list = baseProducts;
    if (estadoFilter) {
      list = list.filter((product) =>
        productMatchesCondition(product, estadoFilter, catalogFamily),
      );
    }
    if (selectedAttributes.length > 0 || selectedProduction || selectedSpeeds.length > 0) {
      list = list.filter((product) =>
        productMatchesCatalogFilters(
          product,
          selectedAttributes,
          selectedProduction,
          facetCountProducts,
        ) && productMatchesSpeedFilterKeys(product, selectedSpeeds),
      );
    }
    if (selectedBrands.length > 0) {
      list = list.filter((product) => productMatchesBrandFilter(product, selectedBrands));
    }
    if (inStockOnly) {
      list = list.filter((product) => product.stock > 0);
    }
    list = list.filter((product) => {
      if (product.price < safeMin) return false;
      if (product.price > safeMax) return false;
      return true;
    });
    if (catalogSearch.trim().length >= MIN_PRODUCT_SEARCH_LENGTH) {
      list = filterProductsBySearch(list, catalogSearch, { categoryFilter: 'all' });
    }

    if (isInventorySearch) {
      return list;
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'price-asc' && a.price !== b.price) return a.price - b.price;
      if (sortBy === 'price-desc' && a.price !== b.price) return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name, 'es');
      const aOrder = a.sort_order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.sort_order ?? Number.MAX_SAFE_INTEGER;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.name.localeCompare(b.name, 'es');
    });
  }, [
    baseProducts,
    useServerCatalog,
    showFormatSectionsEarly,
    estadoFilter,
    catalogFamily,
    selectedAttributes,
    selectedBrands,
    selectedProduction,
    selectedSpeeds,
    facetCountProducts,
    inStockOnly,
    priceMin,
    priceMax,
    sortBy,
    availablePriceRange.min,
    availablePriceRange.max,
    catalogSearch,
    isInventorySearch,
  ]);

  useLayoutEffect(() => {
    const behavior: ScrollBehavior = location.hash ? 'smooth' : 'auto';
    const hashId = location.hash.replace(/^#/, '');

    const scrollToTarget = () => {
      if (hashId === CATEGORY_PRODUCTS_ID) {
        scrollToCategoryProducts(behavior);
        return;
      }
      scrollToCategoryHero(behavior);
    };

    scrollToTarget();
    const retry = window.setTimeout(scrollToTarget, 150);
    return () => window.clearTimeout(retry);
  }, [slug, location.hash, location.pathname, isLoading]);

  const hasSubcategoryHeroes =
    Boolean(storeCategory?.children?.length) && !isInventorySearch;
  const showProductCatalog = !isRentalCategory || hasSubcategoryHeroes;

  const categorySeoSubtitle = useMemo(() => {
    const fromSub = activeSubcategory?.tagline?.trim();
    if (fromSub) return fromSub;
    const fromStore = storeCategory?.tagline?.trim();
    if (fromStore) return fromStore;
    return category?.tagline?.trim() || null;
  }, [activeSubcategory?.tagline, storeCategory?.tagline, category?.tagline]);

  const seoHasFilterParams = useMemo(() => {
    if (isInventorySearch) return true;
    if (selectedAttributes.length > 0) return true;
    if (selectedProduction != null || selectedSpeeds.length > 0) return true;
    if (selectedBrands.length > 0) return true;
    if (inStockOnly) return true;
    if (priceMin != null || priceMax != null) return true;
    if (catalogPage > 1) return true;
    const estado = searchParams.get('estado');
    if (estado && estado !== 'all') return true;
    return ['orden', 'vista', 'pagina', 'precio_min', 'precio_max'].some((key) =>
      searchParams.has(key),
    );
  }, [
    isInventorySearch,
    selectedAttributes,
    selectedProduction,
    selectedSpeeds,
    selectedBrands,
    inStockOnly,
    priceMin,
    priceMax,
    catalogPage,
    searchParams,
  ]);

  const categorySeoConfig = useMemo(() => {
    if (!category) return null;
    return buildCategorySeoConfig({
      category,
      subcategoryName: activeSubcategory?.name ?? rentalSubcategory?.title ?? null,
      subSlug: subSlug ?? null,
      heroSubtitle: categorySeoSubtitle,
      catalogSlug,
      isInventorySearch,
      searchQuery,
      hasFilterParams: seoHasFilterParams,
    });
  }, [
    category,
    activeSubcategory?.name,
    rentalSubcategory?.title,
    subSlug,
    categorySeoSubtitle,
    catalogSlug,
    isInventorySearch,
    searchQuery,
    seoHasFilterParams,
  ]);

  useSeo(categorySeoConfig);

  const inStockProductCount = useMemo(
    () => baseProducts.filter((product) => product.stock > 0).length,
    [baseProducts],
  );
  const quickAttributeFilters = useMemo(
    () => buildCatalogQuickFilters(slug, availableAttributes),
    [slug, availableAttributes],
  );
  const showProductionFilters = shouldShowProductionFilters(slug, isStoreAll);
  const showSpeedFilters = shouldShowSpeedFilters(slug, isStoreAll);
  const productionFiltersWithCounts = useMemo(
    () =>
      PRODUCTION_FILTER_OPTIONS.map((option) => ({
        ...option,
        count: countProductsForAttributeKey(baseProducts, option.key),
      })),
    [baseProducts],
  );

  const speedFiltersWithCounts = useMemo(
    () =>
      SPEED_FILTER_OPTIONS.map((option) => ({
        ...option,
        count: countProductsForSpeedFilterKey(baseProducts, option.key),
      })),
    [baseProducts],
  );

  const tipoFilterChips = useMemo(
    () =>
      quickAttributeFilters
        .filter((attr) => !CATALOG_SPEC_FILTER_TAB_KEYS.has(attr.key))
        .map((attr) => ({
          key: attr.key,
          label: getQuickFilterChipLabel(attr),
          count: countProductsForAttributeKey(baseProducts, attr.key),
        })),
    [quickAttributeFilters, baseProducts],
  );

  const productionFilterChips = useMemo(
    () =>
      productionFiltersWithCounts.map((option) => ({
        key: option.key,
        label: option.label,
        count: option.count,
      })),
    [productionFiltersWithCounts],
  );

  const selectRootCategory = useCallback(
    (rootSlug: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (rootSlug) {
        next.set('cat', rootSlug);
        next.set('sub', ALL_SUBCATEGORIES_QUERY);
      } else {
        next.delete('cat');
        next.delete('sub');
      }
      setCatalogPage(1);
      setSearchParams(next, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  const selectSubcategory = useCallback(
    (nextSubSlug: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (isStoreAll) {
        if (nextSubSlug) {
          const rootSlug =
            storeFilterCategorySlug ??
            findRootCategorySlugForSubcategory(categoryTree, nextSubSlug);
          if (rootSlug) next.set('cat', rootSlug);
          next.set('sub', nextSubSlug);
        } else {
          next.set('sub', ALL_SUBCATEGORIES_QUERY);
        }
      } else if (nextSubSlug) {
        next.set('sub', nextSubSlug);
      } else {
        next.set('sub', ALL_SUBCATEGORIES_QUERY);
      }
      setCatalogPage(1);
      setSearchParams(next, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams, isStoreAll, categoryTree, storeFilterCategorySlug],
  );

  const prefetchSubcategoryCatalog = useCallback(
    (nextSubSlug: string) => {
      if (isStoreAll || isRentalCategory || isInventorySearch) return;
      const targetSlug = slug ?? findRootCategorySlugForSubcategory(categoryTree, nextSubSlug);
      if (!targetSlug) return;
      void prefetchCategoryPage(queryClient, { slug: targetSlug, subSlug: nextSubSlug, role });
    },
    [slug, categoryTree, isStoreAll, isRentalCategory, isInventorySearch, role],
  );

  const toggleAttribute = useCallback((key: string) => {
    setSelectedAttributes((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const toggleBrand = useCallback((key: string) => {
    setSelectedBrands((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const toggleSpecFilter = useCallback((key: string) => {
    setSelectedAttributes((prev) => toggleCatalogSpecFilter(prev, key));
  }, []);

  const selectedSpecFilters = useMemo(
    () => selectedAttributes.filter((key) => CATALOG_SPEC_FILTER_TAB_KEYS.has(key)),
    [selectedAttributes],
  );

  const specFilterTabs = useMemo(() => {
    if (!showCatalogSpecFilters) return [];
    return buildCatalogSpecFilterTabs(baseProducts);
  }, [showCatalogSpecFilters, baseProducts]);

  const showFormatSections = showFormatSectionsEarly;

  const paginationProducts = useMemo(() => {
    if (!showFormatSections) return filteredProducts;
    return getCatalogLayoutOrderedProducts(filteredProducts);
  }, [filteredProducts, showFormatSections]);

  const useServerPagination = useServerCatalog && !showFormatSections && !isTableView;
  const catalogTotalPages = useServerPagination
    ? (catalogData?.totalPages ?? 1)
    : getCatalogTotalPages(paginationProducts.length, catalogPageSize);
  const safeCatalogPage = clampCatalogPage(catalogPage, catalogTotalPages);
  const pagedCatalogProducts = useServerPagination
    ? filteredProducts
    : getCatalogPageSlice(paginationProducts, safeCatalogPage, catalogPageSize);

  const catalogSidebarOpen = storefrontMode
    ? isDesktopNav
    : filtersPanelOpen && isDesktopNav;

  const closeFiltersPanel = useCallback(() => {
    setFiltersPanelOpen(false);
    if (catalogSidebarLayout) {
      setGridColumns(CATALOG_SIDEBAR_DEFAULT_COLUMNS);
    }
  }, [catalogSidebarLayout]);

  const catalogFormatSections = useMemo(
    () => (showFormatSections ? buildCatalogFormatSections(filteredProducts) : []),
    [filteredProducts, showFormatSections],
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [
    slug,
    subSlug,
    searchCategoryFilter,
    selectedAttributes,
    selectedBrands,
    selectedProduction,
    selectedSpeeds,
    sortBy,
    catalogSearch,
    inStockOnly,
    priceMin,
    priceMax,
    estadoFilter,
    gridColumns,
    filtersPanelOpen,
    catalogSidebarLayout,
    viewMode,
    isMobile,
  ]);

  useEffect(() => {
    if (catalogPage !== safeCatalogPage) setCatalogPage(safeCatalogPage);
  }, [catalogPage, safeCatalogPage]);

  useEffect(() => {
    const fromUrl = (searchParams.get('attrs') ?? '')
      .split('|')
      .map((entry) => entry.trim())
      .filter(Boolean);
    const hasOfferInUrl = fromUrl.includes(MOST_VIEWED_OFFER_ATTR_KEY);
    setSelectedAttributes((prev) => {
      const hasOffer = prev.includes(MOST_VIEWED_OFFER_ATTR_KEY);
      if (hasOfferInUrl === hasOffer) return prev;
      if (hasOfferInUrl) return [...new Set([...prev, MOST_VIEWED_OFFER_ATTR_KEY])];
      return prev.filter((key) => key !== MOST_VIEWED_OFFER_ATTR_KEY);
    });
  }, [searchParams]);

  const toggleMostViewedOffer = useCallback(() => {
    const nextHasOffer = !selectedAttributes.includes(MOST_VIEWED_OFFER_ATTR_KEY);
    setSelectedAttributes((prev) =>
      nextHasOffer
        ? [...prev, MOST_VIEWED_OFFER_ATTR_KEY]
        : prev.filter((key) => key !== MOST_VIEWED_OFFER_ATTR_KEY),
    );
    const next = new URLSearchParams(searchParams);
    if (nextHasOffer) next.set('attrs', MOST_VIEWED_OFFER_ATTR_KEY);
    else next.delete('attrs');
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }, [selectedAttributes, searchParams, setSearchParams]);

  const clearAllFilters = useCallback(() => {
    setSelectedAttributes([]);
    setSelectedBrands([]);
    setSelectedProduction(null);
    setSelectedSpeeds([]);
    setInStockOnly(false);
    setPriceMin(null);
    setPriceMax(null);
    setCatalogSearch('');
    setSortBy('price-asc');
    selectSubcategory(null);
    const next = new URLSearchParams(searchParams);
    next.delete('attrs');
    next.delete('buscar');
    next.delete('cat');
    next.delete('estado');
    next.delete('orden');
    next.delete('vista');
    next.delete('pagina');
    next.delete('precio_min');
    next.delete('precio_max');
    setSearchParams(next, { replace: true, preventScrollReset: true });
  }, [selectSubcategory, searchParams, setSearchParams]);

  const toggleProduction = useCallback((key: string) => {
    setSelectedProduction((prev) => (prev === key ? null : key));
  }, []);

  const toggleSpeed = useCallback((key: string) => {
    setSelectedSpeeds((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }, []);

  const toggleCategoryFilters = useCallback(() => {
    if (storefrontMode && isDesktopNav) {
      return;
    }
    if (isDesktopNav) {
      setFiltersPanelOpen((open) => {
        const next = !open;
        setGridColumns(next ? 5 : 6);
        return next;
      });
      return;
    }
    setFiltersSheetOpen(true);
  }, [storefrontMode, isDesktopNav]);

  if (!isStoreAll && (!slug || !category)) {
    return <Navigate to="/" replace />;
  }

  const defaultAllSubcategoriesRedirect =
    slug === 'multifuncionales' &&
    rawSubSlug === null &&
    !isInventorySearch &&
    !categoryTreeLoading
      ? ALL_SUBCATEGORIES_QUERY
      : null;

  if (defaultAllSubcategoriesRedirect) {
    const catalogBasePath = catalogSlug ? '/tienda' : `/categoria/${slug}`;
    const next = new URLSearchParams(searchParams);
    next.set('sub', defaultAllSubcategoriesRedirect);
    return <Navigate to={`${catalogBasePath}?${next.toString()}`} replace />;
  }

  if (
    rawSubSlug &&
    rawSubSlug !== ALL_SUBCATEGORIES_QUERY &&
    storeCategory &&
    !activeSubcategory &&
    !rentalSubcategory &&
    !categoryTreeLoading
  ) {
    const catalogBasePath = catalogSlug ? '/tienda' : `/categoria/${slug}`;
    return <Navigate to={catalogBasePath} replace />;
  }

  const pageTitle = isInventorySearch
    ? `Resultados para «${searchQuery}»`
    : isStoreAll
      ? (storeFilterSubcategory?.name ?? storeFilterCategory?.name ?? 'Todo el catálogo')
      : (rentalSubcategory?.title ?? activeSubcategory?.name ?? category!.name);
  const defaultCategoryForNewProduct =
    isStoreAll ? null : (activeSubcategory?.name ?? storeCategory?.name ?? category!.name ?? null);
  const hasBrandFilters = selectedBrands.length > 0;
  const hasAttributeFilters =
    selectedAttributes.length > 0 || selectedProduction != null || selectedSpeeds.length > 0;
  const hasSearchFilter = catalogSearch.trim().length > 0;
  const hasSortFilter = sortBy !== 'price-asc';
  const hasPriceFilter =
    (priceMin != null && priceMin !== availablePriceRange.min) ||
    (priceMax != null && priceMax !== availablePriceRange.max);
  const hasSidebarFilters =
    storeFilterCategorySlug != null ||
    (rawSubSlug != null && rawSubSlug !== ALL_SUBCATEGORIES_QUERY) ||
    hasPriceFilter ||
    hasBrandFilters ||
    inStockOnly;

  const formatSpecFilterTabs = specFilterTabs.filter((tab) => tab.key.includes('Formato papel::'));
  const colorSpecFilterTabs = specFilterTabs.filter((tab) => tab.key.startsWith('Color::'));

  const filterSectionLabelClass = storefrontMode
    ? 'text-[0.8125rem] font-medium text-foreground'
    : 'text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground';

  const categoryFiltersContent = (
    <>
      <section aria-label="Catálogo por categoría">
        <h3 className={filterSectionLabelClass}>
          {catalogSidebarLayout ? 'Categorías' : 'Catálogo'}
        </h3>
        <div className="mt-1.5 max-h-[min(16rem,42vh)] overflow-y-auto rounded-md border border-border/70 bg-background shadow-sm [scrollbar-width:thin]">
          {categoryTreeLoading && categoryTree.length === 0 ? (
            <p className="px-2.5 py-2 text-[0.6875rem] text-muted-foreground">Cargando categorías…</p>
          ) : categoryTreeError && categoryTree.length === 0 ? (
            <div className="space-y-2 px-2.5 py-2">
              <p className="text-[0.6875rem] text-destructive">No se pudieron cargar las categorías.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={categoryTreeFetching}
                onClick={() => void refetchCategoryTree()}
              >
                {categoryTreeFetching ? 'Reintentando…' : 'Reintentar'}
              </Button>
            </div>
          ) : categoryTree.length === 0 ? (
            <p className="px-2.5 py-2 text-[0.6875rem] text-muted-foreground">Sin categorías disponibles.</p>
          ) : (
            <CatalogSidebarNav
              categoryTree={sidebarCategoryTree}
              activeCategorySlug={sidebarActiveCategorySlug}
              subSlug={subSlug}
              allSubcategoriesSelected={isAllSubcategoriesView}
              filterInPlace={isStoreAll}
              onSelectRoot={selectRootCategory}
              onSelectSub={selectSubcategory}
              onPrefetchSub={prefetchSubcategoryCatalog}
            />
          )}
        </div>
      </section>

      {catalogSidebarLayout && showCatalogSpecFilters && colorSpecFilterTabs.length > 0 ? (
        <CatalogFilterSection
          title="Color"
          labelClassName={filterSectionLabelClass}
          defaultOpen
          openWhenActive={selectedSpecFilters.some((key) => key.startsWith('Color::'))}
        >
          <CatalogFilterGroup>
            {colorSpecFilterTabs.map((tab) => (
              <CatalogFilterOption
                key={tab.key}
                id={`filter-color-${tab.key}`}
                label={getSpecFilterDisplayLabel(tab.key)}
                count={tab.count}
                active={selectedSpecFilters.includes(tab.key)}
                compact
                disabled={tab.count === 0}
                onToggle={() => toggleSpecFilter(tab.key)}
              />
            ))}
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      {catalogSidebarLayout && showCatalogSpecFilters && formatSpecFilterTabs.length > 0 ? (
        <CatalogFilterSection
          title="Formato"
          labelClassName={filterSectionLabelClass}
          defaultOpen
          openWhenActive={selectedSpecFilters.some((key) => key.includes('Formato papel::'))}
        >
          <CatalogFilterGroup>
            {formatSpecFilterTabs.map((tab) => (
              <CatalogFilterOption
                key={tab.key}
                id={`filter-formato-${tab.key}`}
                label={getSpecFilterDisplayLabel(tab.key)}
                count={tab.count}
                active={selectedSpecFilters.includes(tab.key)}
                compact
                disabled={tab.count === 0}
                onToggle={() => toggleSpecFilter(tab.key)}
              />
            ))}
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      {showSpeedFilters ? (
        <CatalogFilterSection
          title="Velocidad"
          labelClassName={filterSectionLabelClass}
          openWhenActive={selectedSpeeds.length > 0}
        >
          <CatalogFilterGroup>
            {speedFiltersWithCounts.map((option) => (
              <CatalogFilterOption
                key={option.key}
                id={`filter-speed-${option.key}`}
                label={option.sidebarLabel}
                count={option.count}
                active={selectedSpeeds.includes(option.key)}
                compact
                disabled={option.count === 0}
                onToggle={() => toggleSpeed(option.key)}
              />
            ))}
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      {showProductionFilters ? (
        <CatalogFilterSection
          title={catalogSidebarLayout ? 'Producción/mes' : 'Producción'}
          labelClassName={filterSectionLabelClass}
          openWhenActive={selectedProduction != null}
        >
          <CatalogFilterGroup>
            {!catalogSidebarLayout ? (
              <CatalogFilterOption
                id="filter-produccion-all"
                label="Todas"
                count={baseProducts.length}
                active={selectedProduction === null}
                mode="radio"
                compact
                onToggle={() => setSelectedProduction(null)}
              />
            ) : null}
            {productionFiltersWithCounts.map((option) => (
              <CatalogFilterOption
                key={option.key}
                id={`filter-produccion-${option.key}`}
                label={option.sidebarLabel}
                count={option.count}
                active={selectedProduction === option.key}
                mode="radio"
                compact
                disabled={option.count === 0}
                onToggle={() => toggleProduction(option.key)}
              />
            ))}
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      {storefrontMode || !catalogSidebarLayout ? (
        <CatalogFilterSection
          title="Disponibilidad"
          labelClassName={filterSectionLabelClass}
          openWhenActive={inStockOnly}
        >
          <CatalogFilterGroup>
            <CatalogFilterOption
              id="filter-in-stock-only"
              label="Solo en stock"
              count={inStockProductCount}
              active={inStockOnly}
              compact={!storefrontMode}
              disabled={inStockProductCount === 0}
              onToggle={() => setInStockOnly((prev) => !prev)}
            />
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      {!catalogSidebarLayout ? (
        <CatalogFilterSection title="Atributos" labelClassName={filterSectionLabelClass} openWhenActive={selectedAttributes.length > 0}>
          <CatalogFilterGroup className="max-h-48 overflow-y-auto">
            {sidebarAttributeOptions.length === 0 ? (
              <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
                Sin atributos en esta categoría.
              </p>
            ) : (
              sidebarAttributeOptions.map((attr) => (
                <CatalogFilterOption
                  key={attr.key}
                  id={`filter-attr-${attr.key}`}
                  label={attr.displayLabel}
                  count={attr.count}
                  active={selectedAttributes.includes(attr.key)}
                  compact
                  disabled={attr.count === 0}
                  onToggle={() => toggleAttribute(attr.key)}
                />
              ))
            )}
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      <CatalogFilterSection
        title="Precio (USD)"
        labelClassName={cn(
          storefrontMode
            ? filterSectionLabelClass
            : 'font-medium uppercase tracking-wider text-muted-foreground',
          !storefrontMode && catalogSidebarLayout && 'text-[0.65rem] tracking-wider',
          !storefrontMode && !catalogSidebarLayout && 'text-xs tracking-wide',
        )}
        openWhenActive={hasPriceFilter}
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[0.6875rem] text-muted-foreground">
            <div className="flex items-center justify-start gap-1.5">
              <span className="font-medium">Mín:</span>
              <span className="tabular-nums text-foreground">
                {priceMin ?? availablePriceRange.min}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1.5 text-right">
              <span className="font-medium">Máx:</span>
              <span className="tabular-nums text-foreground">
                {priceMax ?? availablePriceRange.max}
              </span>
            </div>
          </div>

          <RangeSlider
            min={availablePriceRange.min}
            max={availablePriceRange.max}
            step={1}
            value={[
              priceMin ?? availablePriceRange.min,
              priceMax ?? availablePriceRange.max,
            ]}
            onValueChange={(next) => {
              const [minValue, maxValue] = next;
              if (minValue == null || maxValue == null) return;
              setPriceMin(Math.max(availablePriceRange.min, Math.min(minValue, maxValue)));
              setPriceMax(Math.min(availablePriceRange.max, Math.max(maxValue, minValue)));
            }}
            onValueCommit={(next) => {
              const [minValue, maxValue] = next;
              if (minValue == null || maxValue == null) return;
              setPriceMin(Math.max(availablePriceRange.min, Math.min(minValue, maxValue)));
              setPriceMax(Math.min(availablePriceRange.max, Math.max(maxValue, minValue)));
            }}
          />
        </div>
        <p className="mt-2 text-[0.6875rem] text-muted-foreground">
          Rango disponible: {availablePriceRange.min} - {availablePriceRange.max} USD
        </p>
      </CatalogFilterSection>

      {mostViewedOfferFilter ? (
        <CatalogFilterSection
          title="Ofertas"
          labelClassName={filterSectionLabelClass}
          openWhenActive={selectedAttributes.includes(MOST_VIEWED_OFFER_ATTR_KEY)}
        >
          <CatalogFilterGroup>
            <CatalogFilterOption
              id="filter-offer-most-viewed"
              label={mostViewedOfferFilter.label}
              count={mostViewedOfferFilter.count}
              active={selectedAttributes.includes(MOST_VIEWED_OFFER_ATTR_KEY)}
              compact
              disabled={mostViewedOfferFilter.count === 0}
              onToggle={toggleMostViewedOffer}
            />
          </CatalogFilterGroup>
        </CatalogFilterSection>
      ) : null}

      <CatalogFilterSection
        title="Marca"
        labelClassName={filterSectionLabelClass}
        openWhenActive={selectedBrands.length > 0}
      >
        <CatalogFilterGroup className="max-h-48 overflow-y-auto">
          {brandFilterOptions.map((brand: { key: string; label: string; count: number }) => (
            <CatalogFilterOption
              key={brand.key}
              id={`filter-brand-${brand.key}`}
              label={brand.label}
              count={brand.count}
              active={selectedBrands.includes(brand.key)}
              compact
              disabled={brand.count === 0}
              onToggle={() => toggleBrand(brand.key)}
            />
          ))}
        </CatalogFilterGroup>
      </CatalogFilterSection>

      {hasSidebarFilters || hasAttributeFilters || hasBrandFilters || hasSearchFilter || hasSortFilter ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-7 w-full text-[0.6875rem] font-medium"
          onClick={clearAllFilters}
        >
          Limpiar filtros
        </Button>
      ) : null}
    </>
  );

  const activeFilterChips: ActiveFilterChip[] = [];
  const chipSubcategory = isStoreAll ? storeFilterSubcategory : activeSubcategory;
  const chipCategory = isStoreAll ? storeFilterCategory : storeCategory;
  if (catalogSidebarLayout && chipSubcategory && chipCategory) {
    activeFilterChips.push({
      key: `sub:${chipSubcategory.slug}`,
      label: formatSubcategoryTabLabel(chipSubcategory.name, chipCategory.name),
      onRemove: () => selectSubcategory(null),
    });
  } else if (
    catalogSidebarLayout &&
    isStoreAll &&
    storeFilterCategory &&
    isAllSubcategoriesView
  ) {
    activeFilterChips.push({
      key: `cat:${storeFilterCategory.slug}`,
      label: storeFilterCategory.name,
      onRemove: () => selectRootCategory(null),
    });
  }
  if (catalogSidebarLayout) {
    for (const key of selectedSpecFilters) {
      activeFilterChips.push({
        key,
        label: getSpecFilterDisplayLabel(key),
        onRemove: () => toggleSpecFilter(key),
      });
    }
    if (selectedProduction) {
      const productionOption = productionFiltersWithCounts.find(
        (option) => option.key === selectedProduction,
      );
      activeFilterChips.push({
        key: selectedProduction,
        label: productionOption?.sidebarLabel ?? 'Producción',
        onRemove: () => setSelectedProduction(null),
      });
    }
    for (const speedKey of selectedSpeeds) {
      const speedOption = speedFiltersWithCounts.find((option) => option.key === speedKey);
      activeFilterChips.push({
        key: speedKey,
        label: speedOption?.sidebarLabel ?? 'Velocidad',
        onRemove: () => toggleSpeed(speedKey),
      });
    }
    if (selectedAttributes.includes(MOST_VIEWED_OFFER_ATTR_KEY)) {
      activeFilterChips.push({
        key: MOST_VIEWED_OFFER_ATTR_KEY,
        label: 'Más vistos',
        onRemove: toggleMostViewedOffer,
      });
    }
    for (const brandKey of selectedBrands) {
      const brandOption = brandFilterOptions.find((brand: { key: string }) => brand.key === brandKey);
      activeFilterChips.push({
        key: `brand:${brandKey}`,
        label: brandOption?.label ?? 'Marca',
        onRemove: () => toggleBrand(brandKey),
      });
    }
    if (hasPriceFilter) {
      activeFilterChips.push({
        key: 'price-range',
        label: `Precio ${priceMin ?? availablePriceRange.min}–${priceMax ?? availablePriceRange.max} USD`,
        onRemove: () => {
          setPriceMin(null);
          setPriceMax(null);
        },
      });
    }
  }

  const heroSubcategoriesTabs =
    !storefrontMode &&
    storeCategory &&
    (storeCategory.children?.length ?? 0) > 0 &&
    activeSubcategory ? (
      <SubcategoryTabs
        heading="Subcategorías"
        align="start"
        showHeading={false}
        variant="default"
        compact
        parentName={storeCategory.name}
        subcategories={storeCategory.children}
        activeSubSlug={subSlug}
        onSelect={selectSubcategory}
        className="w-max"
      />
    ) : null;

  const catalogParentCategory = isStoreAll ? storeFilterCategory : storeCategory;
  const catalogSubcategories = catalogParentCategory?.children ?? [];
  const showSubcategoryCarousel =
    storefrontMode && showProductCatalog && catalogSubcategories.length > 0;

  const categorySeoIntro = useMemo(
    () => (slug && !isStoreAll ? getCategorySeoIntro(slug, subSlug) : null),
    [slug, subSlug, isStoreAll],
  );

  const catalogProductCount =
    useServerCatalog ? (catalogData?.total ?? filteredProducts.length) : filteredProducts.length;
  const showCatalogRefresh = useServerCatalog && isCatalogFetching && !isLoading;
  const catalogUsesSidebarGrid =
    showProductCatalog && (storefrontMode ? isDesktopNav : filtersPanelOpen && isDesktopNav);

  return (
    <div
      className={cn(
        'flex flex-col',
        !storefrontMode && 'gap-8 pb-12 pt-6 sm:gap-10 sm:pb-16 sm:pt-8',
      )}
    >
      <section
        id={CATEGORY_PRODUCTS_ID}
        aria-labelledby={storefrontMode ? 'tienda-catalogo-titulo' : 'productos-categoria-titulo'}
        className={cn(
          storefrontMode
            ? 'scroll-mt-20 bg-muted/30 py-6 sm:py-8'
            : 'scroll-mt-28 sm:scroll-mt-32',
        )}
      >
        <div
          className={cn(
            'container flex flex-col',
            storefrontMode ? 'gap-6 px-4 sm:px-6' : 'gap-6 sm:gap-8',
          )}
        >
          <h1 id={CATEGORY_HERO_ID} className="sr-only">
            {pageTitle}
          </h1>

          {categorySeoIntro ? (
            <p className="sr-only">{categorySeoIntro}</p>
          ) : null}

          {storefrontMode && showProductCatalog ? (
            <>
              {showSubcategoryCarousel ? (
                <StoreSubcategoryCarousel
                  className="min-w-0"
                  subcategories={catalogSubcategories}
                  activeSubSlug={subSlug}
                  parentName={catalogParentCategory?.name ?? null}
                  parentImage={catalogParentCategory?.image ?? null}
                  products={isStoreAll ? storeCatalogProducts : filteredProducts}
                  onSelect={selectSubcategory}
                />
              ) : null}
              <StoreCatalogHeader
                productCount={catalogProductCount}
                searchQuery={catalogSearch}
                onSearchQueryChange={setCatalogSearch}
                {...(isStoreAll ? {} : { eyebrow: category?.name ?? 'Catálogo' })}
                title={isStoreAll ? storeCatalogCopy.title : pageTitle}
                searchPlaceholder={
                  isStoreAll ? storeCatalogCopy.searchPlaceholder : `Buscar en ${pageTitle}…`
                }
                viewControls={
                  <StoreCatalogViewControls
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    gridColumns={gridColumns}
                    onGridColumnsChange={setGridColumns}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    filtersActive={
                      filtersPanelOpen ||
                      filtersSheetOpen ||
                      hasAttributeFilters ||
                      hasBrandFilters ||
                      hasPriceFilter ||
                      inStockOnly
                    }
                    onToggleFilters={toggleCategoryFilters}
                  />
                }
              />
            </>
          ) : null}

          <div
            className={cn(
              'grid gap-5 lg:gap-6',
              catalogUsesSidebarGrid
                ? storefrontMode
                  ? 'lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)]'
                  : 'lg:grid-cols-[minmax(13.5rem,15.5rem)_minmax(0,1fr)]'
                : 'lg:grid-cols-1',
            )}
          >
            {showProductCatalog ? (
              <aside
                ref={filtersAsideRef}
                className={cn(
                  'hidden h-fit lg:sticky lg:top-24 lg:block',
                  storefrontMode
                    ? 'rounded-xl border border-border/70 bg-card p-4 shadow-sm'
                    : cn(
                        'rounded-lg border bg-card p-3 shadow-sm',
                        !filtersPanelOpen && 'lg:hidden',
                      ),
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2
                    className={cn(
                      storefrontMode
                        ? 'text-[0.8125rem] font-bold text-foreground'
                        : 'text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground',
                    )}
                  >
                    Filtros
                  </h2>
                  {storefrontMode ? (
                    <SlidersHorizontal
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
                      aria-label="Contraer panel de filtros"
                      onClick={closeFiltersPanel}
                    >
                      <PanelLeftClose className="size-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
                <div
                  id="category-filters-panel"
                  className={cn('space-y-3', storefrontMode ? 'mt-4' : 'mt-2.5')}
                >
                  {categoryFiltersContent}
                </div>
              </aside>
            ) : null}

            {showProductCatalog ? (
              <Sheet open={filtersSheetOpen} onOpenChange={setFiltersSheetOpen}>
                <SheetContent
                  side="left"
                  className="flex w-full max-w-sm flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
                  aria-describedby={undefined}
                >
                  <SheetHeader className="border-b border-border px-5 py-4 text-left">
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                    {categoryFiltersContent}
                  </div>
                </SheetContent>
              </Sheet>
            ) : null}

            <div className={cn(showProductCatalog && storefrontMode && 'min-w-0')}>
              {!storefrontMode ? (
                <span id="productos-categoria-titulo" className="sr-only">
                  {isRentalCategory ? 'Alquiler de equipos' : 'Productos'}
                </span>
              ) : null}

              {isRentalCategory && !hasSubcategoryHeroes ? (
                <div className="mb-8">
                  <RentalCategoryGrid activeSubSlug={subSlug} />
                </div>
              ) : null}

              {showProductCatalog ? (
                <>
                  <CategoryCatalogToolbar
                    subcategoryTabs={catalogSidebarLayout ? undefined : heroSubcategoriesTabs}
                    productCount={catalogProductCount}
                    pageTitle={pageTitle}
                    searchQuery={catalogSearch}
                    onSearchQueryChange={setCatalogSearch}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    gridColumns={gridColumns}
                    onGridColumnsChange={setGridColumns}
                    filtersOpen={filtersPanelOpen}
                    filtersSheetOpen={filtersSheetOpen}
                    hasSidebarFilters={hasSidebarFilters}
                    onToggleSidebarFilters={toggleCategoryFilters}
                    tipoFilters={tipoFilterChips}
                    productionFilters={productionFilterChips}
                    showProductionFilters={showProductionFilters}
                    selectedAttributes={selectedAttributes}
                    selectedProduction={selectedProduction}
                    onSelectAllQuickFilters={() => {
                      setSelectedAttributes([]);
                      setSelectedBrands([]);
                      setSelectedProduction(null);
                    }}
                    onToggleAttribute={toggleAttribute}
                    onToggleProduction={toggleProduction}
                    catalogSidebarLayout={catalogSidebarLayout}
                    activeFilterChips={activeFilterChips}
                    filtersActive={
                      hasAttributeFilters || hasBrandFilters || hasPriceFilter || inStockOnly
                    }
                    storefrontMode={storefrontMode}
                    endAction={
                      isAdmin && viewMode === 'table' ? (
                        <Button
                          type="button"
                          size="sm"
                          className="min-h-10 gap-1.5 bg-red-600 font-semibold hover:bg-red-500"
                          onClick={() => openCreateProductRef.current?.()}
                        >
                          <Plus className="size-4" aria-hidden="true" />
                          Añadir producto
                        </Button>
                      ) : null
                    }
                  />
                </>
              ) : null}

              {showProductCatalog && isError && products.length === 0 ? (
                <HomeCatalogLoadError
                  message="No se pudieron cargar los productos. Inténtalo de nuevo más tarde."
                  onRetry={() => void refetchCatalogProducts()}
                  isRetrying={isCatalogFetching}
                />
              ) : null}

              {showProductCatalog && isLoading ? (
                viewMode === 'table' ? (
                  <CategoryProductsTableSkeleton />
                ) : (
                  <div
                    className={cn(
                      'grid gap-4',
                      viewMode === 'grid'
                        ? catalogGridClassName(gridColumns, catalogSidebarOpen)
                        : 'grid-cols-1',
                    )}
                  >
                    {Array.from({ length: catalogPageSize }).map((_, index) => (
                      <ProductSkeleton key={index} />
                    ))}
                  </div>
                )
              ) : showProductCatalog && viewMode === 'table' ? (
                <CategoryProductsTable
                  products={filteredProducts}
                  {...(useServerCatalog && catalogData?.total != null
                    ? { totalCount: catalogData.total }
                    : {})}
                  defaultCategory={defaultCategoryForNewProduct}
                  bindOpenCreate={bindOpenCreate}
                />
              ) : showProductCatalog && !isLoading && !isError && filteredProducts.length === 0 ? (
                <div
                  className={cn(
                    'px-6 py-10 text-center',
                    storefrontMode
                      ? 'rounded-xl border border-dashed border-border bg-card'
                      : 'rounded-lg border border-dashed',
                  )}
                >
                  <p className="font-medium text-foreground">
                    No hay productos en «{pageTitle}» por ahora.
                  </p>
                  <Button asChild variant="link" className="mt-3 text-red-600">
                    <Link to="/tienda">Explorar todo el catálogo</Link>
                  </Button>
                </div>
              ) : showProductCatalog ? (
                <div
                  className={cn(
                    'relative transition-opacity duration-150',
                    showCatalogRefresh && 'opacity-60',
                  )}
                  aria-busy={showCatalogRefresh}
                >
                  {showCatalogRefresh ? (
                    <p className="sr-only" role="status">
                      Actualizando productos de la categoría…
                    </p>
                  ) : null}
                  {viewMode === 'list' ? (
                    <div className="flex flex-col gap-4">
                      {pagedCatalogProducts.map((product) => (
                        <ProductCard key={product.id} product={product} layout="list" />
                      ))}
                    </div>
                  ) : showFormatSections ? (
                    <CategoryCatalogFormatSections
                      sections={catalogFormatSections}
                      gridColumns={gridColumns}
                      sidebarOpen={catalogSidebarOpen}
                      gridClassName={catalogGridClassName(gridColumns, catalogSidebarOpen)}
                      renderProduct={(product) =>
                        storefrontMode ? (
                          <StoreCatalogProductCard product={product} />
                        ) : (
                          <ProductHighlightCard product={product} />
                        )
                      }
                    />
                  ) : (
                    <div className={catalogGridClassName(gridColumns, catalogSidebarOpen)}>
                      {pagedCatalogProducts.map((product) =>
                        storefrontMode ? (
                          <StoreCatalogProductCard key={product.id} product={product} />
                        ) : (
                          <ProductHighlightCard key={product.id} product={product} />
                        ),
                      )}
                    </div>
                  )}

                  {!showFormatSections ? (
                    <CatalogProductPagination
                      page={safeCatalogPage}
                      totalPages={catalogTotalPages}
                      totalItems={
                        useServerPagination ? (catalogData?.total ?? 0) : paginationProducts.length
                      }
                      pageSize={catalogPageSize}
                      onPageChange={setCatalogPage}
                      className="mt-6"
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

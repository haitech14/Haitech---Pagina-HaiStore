import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { CatalogFilterOption } from '@/components/catalog-filter-option';
import { CatalogSidebarNav } from '@/components/catalog-sidebar-nav';
import { CategoryCatalogFormatSections } from '@/components/category/category-catalog-format-sections';
import {
  CategoryCatalogToolbar,
  type CatalogViewMode,
  type CategorySortValue,
} from '@/components/category/category-catalog-toolbar';
import { CategoryQuickFilters } from '@/components/category/category-quick-filters';
import { CatalogProductPagination } from '@/components/category/catalog-product-pagination';
import { CategoryHeroBanner } from '@/components/category-hero-banner';
import { RentalCategoryGrid } from '@/components/rental-category-grid';
import { SubcategoryTabs } from '@/components/subcategory-tabs';
import {
  CategoryProductsTable,
  CategoryProductsTableSkeleton,
} from '@/components/category-products-table';
import { ProductCard } from '@/components/product-card';
import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/context/auth-context';
import { getCategoryHeroContent, getSubcategoryHeroContent } from '@/data/category-hero';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useQuery } from '@tanstack/react-query';

import { useCategoryCatalog } from '@/hooks/use-category-catalog';
import { searchCatalogProducts } from '@/lib/catalog-search-api';
import { applyViewAsPriceToProducts, shouldApplyViewAsPriceTransform, viewAsRolesQueryKey } from '@/lib/view-as-role';
import {
  findCategoryBySlug,
  findStoreSubcategoryBySlug,
  resolveCategoryPageProductLabels,
} from '@/lib/category-product-labels';
import {
  ALL_SUBCATEGORIES_QUERY,
  findStoreCategoryBySlug,
  formatSubcategoryTabLabel,
  parseCategorySubSearchParam,
} from '@/lib/store-category-display';
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
import { catalogGridClassName, type CatalogGridColumns } from '@/lib/category-grid-layout';
import {
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
  buildCatalogFormatSections,
  buildCatalogSpecFilterTabs,
  buildModelQuickFilters,
  CATALOG_SPEC_FILTER_TAB_KEYS,
  countProductsForAttributeKey,
  EXCLUDED_QUICK_ATTRIBUTE_KEYS,
  getModeloEquipoChipLabel,
  getQuickFilterChipLabel,
  isModeloEquipoAttributeKey,
  isProduccionAttributeKey,
  isRendimientoAttributeKey,
  PRODUCTION_FILTER_OPTIONS,
  productMatchesCatalogFilters,
  shouldShowCatalogSpecFilterTabs,
  shouldShowProductionFilters,
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
};

export function CategoryPage({ catalogSlug }: CategoryPageProps = {}) {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = catalogSlug ?? routeSlug;
  const catalogSidebarLayout = shouldShowCatalogSpecFilterTabs(slug);
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
  const { data: categoryTreeData, isLoading: categoryTreeLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<CategorySortValue>('price-asc');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('grid');
  const [gridColumns, setGridColumns] = useState<CatalogGridColumns>(
    catalogSidebarLayout ? 5 : 6,
  );
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(catalogSidebarLayout);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const isMobile = useIsMobile();
  const isDesktopNav = useIsDesktopNav();
  const filtersAsideRef = useRef<HTMLElement>(null);
  const openCreateProductRef = useRef<(() => void) | null>(null);
  const { isAdmin, viewAsRoles, effectiveRole } = useAuth();

  const bindOpenCreate = useCallback((openCreate: (() => void) | null) => {
    openCreateProductRef.current = openCreate;
  }, []);

  const storeCategory = useMemo(
    () => (slug ? findStoreCategoryBySlug(categoryTree, slug) : undefined),
    [categoryTree, slug],
  );

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

  const isRentalCategory = slug === RENTAL_PARENT_SLUG;

  const productLabels = useMemo(() => {
    if (!category) return EMPTY_LABEL_LIST;
    return resolveCategoryPageProductLabels(category, storeCategory, subSlug, categoryTree);
  }, [category, storeCategory, subSlug, categoryTree]);

  const catalogPageSize = getResponsiveCatalogPageSize(isMobile, gridColumns);
  const showFormatSectionsEarly =
    shouldShowCatalogSpecFilterTabs(slug) && viewMode === 'grid';

  const { data: catalogData, isLoading: catalogLoading, isError: catalogError } = useCategoryCatalog({
    enabled: Boolean(slug) && !isRentalCategory && !isInventorySearch && productLabels.length > 0,
    slug: slug ?? '',
    subSlug,
    labels: productLabels,
    condition: estadoFilter,
    inStockOnly,
    priceMin,
    priceMax,
    attributeKeys: selectedAttributes,
    productionKey: selectedProduction,
    search: catalogSearch,
    sortBy,
    page: showFormatSectionsEarly ? 1 : catalogPage,
    limit: showFormatSectionsEarly ? 500 : catalogPageSize,
  });

  const { data: searchData, isLoading: searchLoading, isError: searchError } = useQuery({
    queryKey: ['catalog-search', searchQuery, searchCategoryFilter, viewAsRolesQueryKey(viewAsRoles)],
    queryFn: () =>
      searchCatalogProducts(searchQuery, {
        categoryFilter: searchCategoryFilter,
        limit: 100,
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

  const useServerCatalog = !isInventorySearch && !isRentalCategory && productLabels.length > 0;
  const products = isInventorySearch
    ? (searchData?.products ?? EMPTY_PRODUCT_LIST)
    : (catalogData?.products ?? EMPTY_PRODUCT_LIST);
  const isLoading = isInventorySearch ? searchLoading : catalogLoading;
  const isError = isInventorySearch ? searchError : catalogError;

  const baseProducts = useMemo(() => {
    if (!products.length) return EMPTY_PRODUCT_LIST;

    if (isInventorySearch) {
      // El servidor ya filtró y ordenó; solo re-filtrar categoría si el árbol aporta reglas extra.
      if (searchCategoryFilter === 'all' || !categoryTree.length) {
        return products;
      }
      return filterProductsBySearch(products, searchQuery, {
        categoryFilter: searchCategoryFilter,
        categoryTree,
      });
    }

    if (useServerCatalog) {
      return products;
    }

    return applyEquipmentSubcategorySlugFilter(
      products.filter((product) => {
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
    useServerCatalog,
    searchQuery,
    searchCategoryFilter,
    categoryTree,
    slug,
    subSlug,
  ]);

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
          !isModeloEquipoAttributeKey(attr.key) && !isRendimientoAttributeKey(attr.key),
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

  const availableAttributeKeys = useMemo(
    () => availableAttributes.map((attr) => attr.key).join('|'),
    [availableAttributes],
  );

  useEffect(() => {
    setSelectedAttributes([]);
    setSelectedProduction(null);
    setPriceMin(null);
    setPriceMax(null);
    setCatalogSearch('');
  }, [slug, subSlug]);

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
    if (selectedAttributes.length > 0 || selectedProduction) {
      list = list.filter((product) =>
        productMatchesCatalogFilters(product, selectedAttributes, selectedProduction),
      );
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
    selectedProduction,
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

  const parentHeroFallback = useMemo(() => {
    if (!category) return null;
    const fallbackImage = storeCategory?.image ?? category.image;
    return {
      name: storeCategory?.name ?? category.name,
      tagline: storeCategory?.tagline ?? category.tagline,
      ...(fallbackImage ? { image: fallbackImage } : {}),
    };
  }, [category, storeCategory]);

  const parentHeroContent = useMemo(() => {
    if (!category || !parentHeroFallback) return null;
    return getCategoryHeroContent(category.slug, parentHeroFallback);
  }, [category, parentHeroFallback]);

  const subcategoryHeroes = useMemo(() => {
    if (!hasSubcategoryHeroes || !storeCategory || !category || !parentHeroFallback) {
      return null;
    }

    return (storeCategory.children ?? []).map((sub) => {
      const content = getSubcategoryHeroContent(
        category.slug,
        {
          name: sub.name,
          slug: sub.slug,
          tagline: sub.tagline,
          image: sub.image,
          inventoryLabels: sub.inventoryLabels,
        },
        parentHeroFallback,
        products ?? [],
      );

      return {
        slug: sub.slug,
        content: {
          ...content,
          title: formatSubcategoryTabLabel(sub.name, parentHeroFallback.name),
        },
      };
    });
  }, [
    hasSubcategoryHeroes,
    storeCategory,
    category,
    parentHeroFallback,
    products,
  ]);

  const heroContent = useMemo(() => {
    if (!category || !parentHeroFallback) return null;

    if (hasSubcategoryHeroes && activeSubcategory) {
      return getSubcategoryHeroContent(
        category.slug,
        {
          name: activeSubcategory.name,
          slug: activeSubcategory.slug,
          tagline: activeSubcategory.tagline,
          image: activeSubcategory.image,
          inventoryLabels: activeSubcategory.inventoryLabels,
        },
        parentHeroFallback,
        products ?? [],
      );
    }

    if (hasSubcategoryHeroes && !activeSubcategory) {
      return null;
    }

    return (
      parentHeroContent ??
      getCategoryHeroContent(category.slug, parentHeroFallback)
    );
  }, [
    category,
    parentHeroFallback,
    activeSubcategory,
    hasSubcategoryHeroes,
    parentHeroContent,
    products,
  ]);

  const inStockProductCount = useMemo(
    () => baseProducts.filter((product) => product.stock > 0).length,
    [baseProducts],
  );
  const quickAttributeFilters = useMemo(
    () => buildCatalogQuickFilters(slug, availableAttributes),
    [slug, availableAttributes],
  );
  const modelQuickFilters = useMemo(
    () => buildModelQuickFilters(availableAttributes),
    [availableAttributes],
  );
  const showProductionFilters = shouldShowProductionFilters(slug);
  const productionFiltersWithCounts = useMemo(
    () =>
      PRODUCTION_FILTER_OPTIONS.map((option) => ({
        ...option,
        count: countProductsForAttributeKey(baseProducts, option.key),
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

  const modelFilterChips = useMemo(
    () =>
      modelQuickFilters.map((attr) => ({
        key: attr.key,
        label: getModeloEquipoChipLabel(attr),
        count: countProductsForAttributeKey(baseProducts, attr.key),
      })),
    [modelQuickFilters, baseProducts],
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

  const selectSubcategory = useCallback(
    (nextSubSlug: string | null) => {
      const next = new URLSearchParams(searchParams);
      if (nextSubSlug) next.set('sub', nextSubSlug);
      else next.set('sub', ALL_SUBCATEGORIES_QUERY);
      setSearchParams(next, { replace: true, preventScrollReset: true });
    },
    [searchParams, setSearchParams],
  );

  const toggleAttribute = useCallback((key: string) => {
    setSelectedAttributes((prev) =>
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
    if (!shouldShowCatalogSpecFilterTabs(slug)) return [];
    return buildCatalogSpecFilterTabs(baseProducts);
  }, [slug, baseProducts]);

  const showFormatSections = showFormatSectionsEarly;

  const paginationProducts = useMemo(() => {
    if (!showFormatSections) return filteredProducts;
    return getCatalogLayoutOrderedProducts(filteredProducts);
  }, [filteredProducts, showFormatSections]);

  const useServerPagination = useServerCatalog && !showFormatSections;
  const catalogTotalPages = useServerPagination
    ? (catalogData?.totalPages ?? 1)
    : getCatalogTotalPages(paginationProducts.length, catalogPageSize);
  const safeCatalogPage = clampCatalogPage(catalogPage, catalogTotalPages);
  const pagedCatalogProducts = useServerPagination
    ? filteredProducts
    : getCatalogPageSlice(paginationProducts, safeCatalogPage, catalogPageSize);

  const catalogSidebarOpen = catalogSidebarLayout
    ? isDesktopNav
    : filtersPanelOpen && isDesktopNav;

  const catalogProductsForDisplay = useMemo(() => {
    if (!showFormatSections) {
      return pagedCatalogProducts;
    }
    return getCatalogLayoutOrderedProducts(filteredProducts);
  }, [showFormatSections, pagedCatalogProducts, filteredProducts]);

  const catalogFormatSections = useMemo(
    () => buildCatalogFormatSections(catalogProductsForDisplay),
    [catalogProductsForDisplay],
  );

  useEffect(() => {
    setCatalogPage(1);
  }, [
    slug,
    subSlug,
    selectedAttributes,
    selectedProduction,
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

  const clearAllFilters = useCallback(() => {
    setSelectedAttributes([]);
    setSelectedProduction(null);
    setInStockOnly(false);
    setPriceMin(null);
    setPriceMax(null);
    selectSubcategory(null);
  }, [selectSubcategory]);

  const toggleProduction = useCallback((key: string) => {
    setSelectedProduction((prev) => (prev === key ? null : key));
  }, []);

  const toggleCategoryFilters = useCallback(() => {
    if (catalogSidebarLayout && isDesktopNav) return;
    if (isDesktopNav) {
      setFiltersPanelOpen((open) => {
        const next = !open;
        setGridColumns(next ? 5 : 6);
        return next;
      });
      return;
    }
    setFiltersSheetOpen(true);
  }, [catalogSidebarLayout, isDesktopNav]);

  if (!slug || !category) {
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
    !rentalSubcategory
  ) {
    const catalogBasePath = catalogSlug ? '/tienda' : `/categoria/${slug}`;
    return <Navigate to={catalogBasePath} replace />;
  }

  const pageTitle = isInventorySearch
    ? `Resultados para «${searchQuery}»`
    : (rentalSubcategory?.title ?? activeSubcategory?.name ?? category.name);
  const defaultCategoryForNewProduct =
    activeSubcategory?.name ?? storeCategory?.name ?? category.name ?? null;
  const hasAttributeFilters = selectedAttributes.length > 0 || selectedProduction != null;
  const hasPriceFilter =
    (priceMin != null && priceMin !== availablePriceRange.min) ||
    (priceMax != null && priceMax !== availablePriceRange.max);
  const hasSidebarFilters =
    (rawSubSlug != null && rawSubSlug !== ALL_SUBCATEGORIES_QUERY) ||
    hasPriceFilter ||
    inStockOnly;

  const formatSpecFilterTabs = specFilterTabs.filter((tab) => tab.key.includes('Formato papel::'));
  const colorSpecFilterTabs = specFilterTabs.filter((tab) => tab.key.startsWith('Color::'));

  const categoryFiltersContent = (
    <>
      <section aria-label="Catálogo por categoría">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {catalogSidebarLayout ? 'Categorías' : 'Catálogo'}
        </h3>
        <div className="mt-2 max-h-[min(22rem,50vh)] overflow-y-auto rounded-lg border border-border/70 bg-muted/15 p-1.5 pr-0.5">
          {categoryTree.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">Cargando categorías…</p>
          ) : (
            <CatalogSidebarNav
              categoryTree={categoryTree}
              activeCategorySlug={slug ?? ''}
              subSlug={subSlug}
              allSubcategoriesSelected={isAllSubcategoriesView}
              onSelectSub={selectSubcategory}
            />
          )}
        </div>
      </section>

      {showProductionFilters ? (
        <section aria-label="Producción mensual">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {catalogSidebarLayout ? 'Producción (Páginas/Mes)' : 'Producción'}
          </h3>
          <div className="mt-2 space-y-1">
            {!catalogSidebarLayout ? (
              <CatalogFilterOption
                id="filter-produccion-all"
                label="Todas"
                count={baseProducts.length}
                active={selectedProduction === null}
                mode="radio"
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
                disabled={option.count === 0}
                onToggle={() => toggleProduction(option.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {catalogSidebarLayout && formatSpecFilterTabs.length > 0 ? (
        <section aria-label="Formato de papel">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Formato de Papel
          </h3>
          <div className="mt-2 space-y-1">
            {formatSpecFilterTabs.map((tab) => (
              <CatalogFilterOption
                key={tab.key}
                id={`filter-formato-${tab.key}`}
                label={getSpecFilterDisplayLabel(tab.key)}
                count={tab.count}
                active={selectedSpecFilters.includes(tab.key)}
                disabled={tab.count === 0}
                onToggle={() => toggleSpecFilter(tab.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {catalogSidebarLayout && colorSpecFilterTabs.length > 0 ? (
        <section aria-label="Color de impresión">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Color
          </h3>
          <div className="mt-2 space-y-1">
            {colorSpecFilterTabs.map((tab) => (
              <CatalogFilterOption
                key={tab.key}
                id={`filter-color-${tab.key}`}
                label={getSpecFilterDisplayLabel(tab.key)}
                count={tab.count}
                active={selectedSpecFilters.includes(tab.key)}
                disabled={tab.count === 0}
                onToggle={() => toggleSpecFilter(tab.key)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {!catalogSidebarLayout ? (
        <section aria-label="Disponibilidad">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Disponibilidad
          </h3>
          <div className="mt-2 space-y-1">
            <CatalogFilterOption
              id="filter-in-stock-only"
              label="Solo en stock"
              count={inStockProductCount}
              active={inStockOnly}
              disabled={inStockProductCount === 0}
              onToggle={() => setInStockOnly((prev) => !prev)}
            />
          </div>
        </section>
      ) : null}

      {!catalogSidebarLayout ? (
        <section aria-label="Atributos del producto">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Atributos
          </h3>
          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-0.5">
            {sidebarAttributeOptions.length === 0 ? (
              <p className="rounded-md border border-dashed px-3 py-4 text-center text-xs text-muted-foreground">
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
                  disabled={attr.count === 0}
                  onToggle={() => toggleAttribute(attr.key)}
                />
              ))
            )}
          </div>
        </section>
      ) : null}

      {!catalogSidebarLayout ? (
        <section aria-label="Precio">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Precio (USD)
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Mínimo</span>
              <input
                type="number"
                min={availablePriceRange.min}
                max={availablePriceRange.max}
                value={priceMin ?? availablePriceRange.min}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setPriceMin(
                    Number.isFinite(next)
                      ? Math.max(availablePriceRange.min, next)
                      : availablePriceRange.min,
                  );
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              />
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Máximo</span>
              <input
                type="number"
                min={availablePriceRange.min}
                max={availablePriceRange.max}
                value={priceMax ?? availablePriceRange.max}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  setPriceMax(
                    Number.isFinite(next)
                      ? Math.min(availablePriceRange.max, next)
                      : availablePriceRange.max,
                  );
                }}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
              />
            </label>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Rango disponible: {availablePriceRange.min} - {availablePriceRange.max} USD
          </p>
        </section>
      ) : null}

      {hasSidebarFilters || hasAttributeFilters ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full rounded-lg font-semibold"
          onClick={clearAllFilters}
        >
          Limpiar filtros
        </Button>
      ) : null}
    </>
  );

  const activeFilterChips: ActiveFilterChip[] = [];
  if (catalogSidebarLayout && activeSubcategory && storeCategory) {
    activeFilterChips.push({
      key: `sub:${activeSubcategory.slug}`,
      label: formatSubcategoryTabLabel(activeSubcategory.name, storeCategory.name),
      onRemove: () => selectSubcategory(null),
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
  }

  const heroSubcategoriesTabs =
    storeCategory && (storeCategory.children?.length ?? 0) > 0 && activeSubcategory ? (
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

  return (
    <div className="flex flex-col gap-8 pb-12 pt-6 sm:gap-10 sm:pb-16 sm:pt-8">
      <div className="container flex flex-col gap-6 sm:gap-8">
        {subcategoryHeroes && !activeSubcategory ? (
          <div id={CATEGORY_HERO_ID} className="scroll-mt-28 sm:scroll-mt-32">
            <h1 className="sr-only">{storeCategory?.name ?? category.name}</h1>
            <div
              className="grid gap-3 sm:gap-4 lg:grid-cols-3"
              role="group"
              aria-label={`Subcategorías de ${storeCategory?.name ?? category.name}`}
            >
              {subcategoryHeroes.map(({ slug, content }) => (
                <CategoryHeroBanner
                  key={slug}
                  content={content}
                  inline
                  interactive
                  selected={subSlug === slug}
                  onActivate={() => selectSubcategory(slug)}
                  headingLevel="h2"
                />
              ))}
            </div>
          </div>
        ) : heroContent ? (
          <div id={CATEGORY_HERO_ID} className="scroll-mt-28 sm:scroll-mt-32">
            <CategoryHeroBanner content={heroContent} />
          </div>
        ) : null}

        <div
          className={cn(
            'grid gap-5 lg:gap-6',
            showProductCatalog &&
              (catalogSidebarLayout ? isDesktopNav : filtersPanelOpen)
              ? 'lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)]'
              : 'lg:grid-cols-1',
          )}
        >
          {showProductCatalog ? (
          <aside
            ref={filtersAsideRef}
            className={cn(
              'hidden h-fit rounded-xl border bg-card p-4 shadow-sm lg:sticky lg:top-24 lg:block',
              !catalogSidebarLayout && !filtersPanelOpen && 'lg:hidden',
            )}
          >
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Filtros
            </h2>
            <div id="category-filters-panel" className="mt-4 space-y-5">
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
              <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
                {categoryFiltersContent}
              </div>
            </SheetContent>
          </Sheet>
          ) : null}

          <section
            id={CATEGORY_PRODUCTS_ID}
            className="scroll-mt-28 sm:scroll-mt-32"
            aria-labelledby="productos-categoria-titulo"
          >
            <span id="productos-categoria-titulo" className="sr-only">
              {isRentalCategory ? 'Alquiler de equipos' : 'Productos'}
            </span>

            {isRentalCategory && !hasSubcategoryHeroes ? (
              <div className="mb-8">
                <RentalCategoryGrid activeSubSlug={subSlug} />
              </div>
            ) : null}

            {showProductCatalog ? (
            <>
            <CategoryCatalogToolbar
              subcategoryTabs={catalogSidebarLayout ? undefined : heroSubcategoriesTabs}
              productCount={filteredProducts.length}
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
                setSelectedProduction(null);
              }}
              onToggleAttribute={toggleAttribute}
              onToggleProduction={toggleProduction}
              catalogSidebarLayout={catalogSidebarLayout}
              activeFilterChips={activeFilterChips}
              filtersActive={hasAttributeFilters || hasPriceFilter || inStockOnly}
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

            {!catalogSidebarLayout ? (
              <CategoryQuickFilters
                modelFilters={modelFilterChips}
                selectedAttributes={selectedAttributes}
                onToggleAttribute={toggleAttribute}
              />
            ) : null}
            </>
            ) : null}

            {showProductCatalog && isError && (
              <p role="alert" className="text-destructive">
                No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
              </p>
            )}

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
                defaultCategory={defaultCategoryForNewProduct}
                bindOpenCreate={bindOpenCreate}
              />
            ) : showProductCatalog && filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed px-6 py-10 text-center">
                <p className="font-medium text-foreground">
                  No hay productos en «{pageTitle}» por ahora.
                </p>
                <Button asChild variant="link" className="mt-3 text-red-600">
                  <Link to="/tienda">Explorar todo el catálogo</Link>
                </Button>
              </div>
            ) : showProductCatalog ? (
              <>
                {viewMode === 'list' ? (
                  <div className="flex flex-col gap-4">
                    {pagedCatalogProducts.map((product) => (
                      <ProductCard key={product.id} product={product} layout="list" />
                    ))}
                  </div>
                ) : showFormatSections ? (
                  <CategoryCatalogFormatSections
                    sections={catalogFormatSections}
                    categorySlug={slug}
                    gridColumns={gridColumns}
                    sidebarOpen={catalogSidebarOpen}
                    renderProduct={(product) => (
                      <ProductHighlightCard product={product} />
                    )}
                  />
                ) : (
                  <div className={catalogGridClassName(gridColumns, catalogSidebarOpen)}>
                    {pagedCatalogProducts.map((product) => (
                      <ProductHighlightCard key={product.id} product={product} />
                    ))}
                  </div>
                )}

                {!showFormatSections ? (
                  <CatalogProductPagination
                    page={safeCatalogPage}
                    totalPages={catalogTotalPages}
                    totalItems={useServerPagination ? (catalogData?.total ?? 0) : paginationProducts.length}
                    pageSize={catalogPageSize}
                    onPageChange={setCatalogPage}
                    className="mt-6"
                  />
                ) : null}
              </>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}

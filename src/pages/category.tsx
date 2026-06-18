import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';

import { CatalogFilterOption } from '@/components/catalog-filter-option';
import { CatalogSidebarNav } from '@/components/catalog-sidebar-nav';
import { CategoryCatalogFiltersRow } from '@/components/category/category-catalog-filters-row';
import { CategoryCatalogFormatSections } from '@/components/category/category-catalog-format-sections';
import {
  CategoryCatalogToolbar,
  type CatalogViewMode,
  type CategorySortValue,
} from '@/components/category/category-catalog-toolbar';
import { CategorySpecFilterTabs } from '@/components/category/category-spec-filter-tabs';
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
import { useProducts } from '@/hooks/use-products';
import {
  findCategoryBySlug,
  findStoreSubcategoryBySlug,
  resolveCategoryPageProductLabels,
} from '@/lib/category-product-labels';
import { findStoreCategoryBySlug, findDefaultNewSubcategorySlug, formatSubcategoryTabLabel } from '@/lib/store-category-display';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const subSlug = searchParams.get('sub');
  const searchQuery = searchParams.get('buscar')?.trim() ?? '';
  const searchCategoryFilter = searchParams.get('cat')?.trim() || 'all';
  const isInventorySearch = searchQuery.length >= MIN_PRODUCT_SEARCH_LENGTH;
  const estadoFilter = useCategoryConditionFilter();

  const category = slug ? findCategoryBySlug(slug) : undefined;
  const catalogFamily = slug ? catalogFamilyForCategorySlug(slug) : null;
  const { data: categoryTreeData, isLoading: categoryTreeLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;
  const { data: products, isLoading, isError } = useProducts();
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [selectedProduction, setSelectedProduction] = useState<string | null>(null);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<CategorySortValue>('price-asc');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('grid');
  const [gridColumns, setGridColumns] = useState<CatalogGridColumns>(6);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [catalogPage, setCatalogPage] = useState(1);
  const isMobile = useIsMobile();
  const isDesktopNav = useIsDesktopNav();
  const filtersAsideRef = useRef<HTMLElement>(null);
  const openCreateProductRef = useRef<(() => void) | null>(null);
  const { isAdmin } = useAuth();

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
    return resolveCategoryPageProductLabels(category, storeCategory, subSlug);
  }, [category, storeCategory, subSlug]);

  const baseProducts = useMemo(() => {
    if (!products?.length) return EMPTY_PRODUCT_LIST;

    if (isInventorySearch) {
      return filterProductsBySearch(products, searchQuery, {
        categoryFilter: searchCategoryFilter,
        categoryTree,
      });
    }

    return products.filter((product) => {
      if (slug === 'repuestos' && isPrinterEquipmentProduct(product)) {
        return false;
      }
      return productLabels.some((label) => productMatchesCategoryFilter(product, label));
    });
  }, [
    products,
    productLabels,
    isInventorySearch,
    searchQuery,
    searchCategoryFilter,
    categoryTree,
    slug,
  ]);

  const availableAttributes = useMemo(() => {
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
  }, [baseProducts]);

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
    if (baseProducts.length === 0) return { min: 0, max: 0 };
    const prices = baseProducts.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [baseProducts]);

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
    Boolean(storeCategory?.children.length) && !isInventorySearch;
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

    return storeCategory.children.map((sub) => {
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
      else next.delete('sub');
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

  const showFormatSections = shouldShowCatalogSpecFilterTabs(slug) && viewMode === 'grid';

  const paginationProducts = useMemo(() => {
    if (!showFormatSections) return filteredProducts;
    return getCatalogLayoutOrderedProducts(filteredProducts);
  }, [filteredProducts, showFormatSections]);

  const catalogPageSize = getResponsiveCatalogPageSize(isMobile, gridColumns);
  const catalogTotalPages = getCatalogTotalPages(paginationProducts.length, catalogPageSize);
  const safeCatalogPage = clampCatalogPage(catalogPage, catalogTotalPages);
  const pagedCatalogProducts = getCatalogPageSlice(
    paginationProducts,
    safeCatalogPage,
    catalogPageSize,
  );

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
    if (isDesktopNav) {
      setFiltersPanelOpen((open) => !open);
      return;
    }
    setFiltersSheetOpen(true);
  }, [isDesktopNav]);

  if (!slug || !category) {
    return <Navigate to="/" replace />;
  }

  const defaultNewSubSlug =
    slug === 'multifuncionales' && !subSlug && !isInventorySearch && !categoryTreeLoading
      ? findDefaultNewSubcategorySlug(storeCategory)
      : null;

  if (defaultNewSubSlug) {
    const catalogBasePath = catalogSlug ? '/tienda' : `/categoria/${slug}`;
    const next = new URLSearchParams(searchParams);
    next.set('sub', defaultNewSubSlug);
    return <Navigate to={`${catalogBasePath}?${next.toString()}`} replace />;
  }

  if (subSlug && storeCategory && !activeSubcategory && !rentalSubcategory) {
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
  const hasSidebarFilters = subSlug != null || hasPriceFilter || inStockOnly;

  const categoryFiltersContent = (
    <>
      <section aria-label="Catálogo por categoría">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Catálogo
        </h3>
        <div className="mt-2 max-h-[min(22rem,50vh)] overflow-y-auto rounded-lg border border-border/70 bg-muted/15 p-1.5 pr-0.5">
          {categoryTree.length === 0 ? (
            <p className="px-2 py-3 text-xs text-muted-foreground">Cargando categorías…</p>
          ) : (
            <CatalogSidebarNav
              categoryTree={categoryTree}
              activeCategorySlug={slug ?? ''}
              subSlug={subSlug}
              onSelectSub={selectSubcategory}
            />
          )}
        </div>
      </section>

      {showProductionFilters ? (
        <section aria-label="Producción mensual">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Producción
          </h3>
          <div className="mt-2 space-y-1">
            <CatalogFilterOption
              id="filter-produccion-all"
              label="Todas"
              count={baseProducts.length}
              active={selectedProduction === null}
              mode="radio"
              onToggle={() => setSelectedProduction(null)}
            />
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

  const heroSubcategoriesTabs =
    storeCategory && storeCategory.children.length > 0 && activeSubcategory ? (
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
            showProductCatalog && filtersPanelOpen
              ? 'lg:grid-cols-[minmax(17rem,20rem)_minmax(0,1fr)]'
              : 'lg:grid-cols-1',
          )}
        >
          {showProductCatalog ? (
          <aside
            ref={filtersAsideRef}
            className={cn(
              'hidden h-fit rounded-xl border bg-card p-4 shadow-sm lg:sticky lg:top-24 lg:block',
              !filtersPanelOpen && 'lg:hidden',
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
            {filtersPanelOpen && specFilterTabs.length > 0 ? (
              <CategoryCatalogFiltersRow
                className="mb-4"
                subcategories={null}
                filters={
                  <CategorySpecFilterTabs
                    heading="Filtros"
                    align="end"
                    tabs={specFilterTabs}
                    selectedKeys={selectedSpecFilters}
                    onToggle={toggleSpecFilter}
                    ariaLabel="Filtros de formato y color"
                    groupLabel="Formato y color"
                  />
                }
              />
            ) : null}

            <CategoryCatalogToolbar
              subcategoryTabs={heroSubcategoriesTabs}
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
              {...(showFormatSections
                ? {
                    catalogSpecTabs: specFilterTabs,
                    selectedCatalogSpecKeys: selectedSpecFilters,
                    onToggleCatalogSpec: toggleSpecFilter,
                  }
                : {})}
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

            <CategoryQuickFilters
              modelFilters={modelFilterChips}
              selectedAttributes={selectedAttributes}
              onToggleAttribute={toggleAttribute}
            />
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
                      ? catalogGridClassName(gridColumns)
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
                    gridColumns={gridColumns}
                    renderProduct={(product) => (
                      <ProductHighlightCard product={product} layout="card" />
                    )}
                  />
                ) : (
                  <div className={catalogGridClassName(gridColumns)}>
                    {pagedCatalogProducts.map((product) => (
                      <ProductHighlightCard key={product.id} product={product} layout="card" />
                    ))}
                  </div>
                )}

                {!showFormatSections ? (
                  <CatalogProductPagination
                    page={safeCatalogPage}
                    totalPages={catalogTotalPages}
                    totalItems={paginationProducts.length}
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

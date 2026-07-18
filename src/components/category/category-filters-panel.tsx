import {
  startTransition,
  Suspense,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { CatalogFilterOption } from '@/components/catalog-filter-option';
import { CatalogFilterGroup } from '@/components/catalog-filter-group';
import { CatalogFilterSection } from '@/components/catalog-filter-section';
import { CatalogSidebarNav } from '@/components/catalog-sidebar-nav';
import { Button } from '@/components/ui/button';
import { RangeSlider } from '@/components/ui/range-slider';
import {
  getSpecFilterDisplayLabel,
  MOST_VIEWED_OFFER_ATTR_KEY,
} from '@/lib/category-catalog-filters';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

type FilterTab = { key: string; count: number };
type AttrOption = { key: string; displayLabel: string; count: number };
type BrandOption = { key: string; label: string; count: number };
type CountOption = { key: string; sidebarLabel: string; count: number };

export type CategoryFiltersPanelProps = {
  filterSectionLabelClass: string;
  catalogSidebarLayout: boolean;
  storefrontMode: boolean;
  categoryTreeLoading: boolean;
  categoryTree: StoreCategoryTreeNode[];
  categoryTreeError: boolean;
  categoryTreeFetching: boolean;
  refetchCategoryTree: () => void;
  sidebarCategoryTree: StoreCategoryTreeNode[];
  sidebarActiveCategorySlug: string;
  subSlug: string | null;
  isAllSubcategoriesView: boolean;
  isStoreAll: boolean;
  selectRootCategory: (slug: string | null) => void;
  selectSubcategory: (slug: string | null) => void;
  prefetchSubcategoryCatalog: (slug: string) => void;
  showCatalogSpecFilters: boolean;
  colorSpecFilterTabs: FilterTab[];
  formatSpecFilterTabs: FilterTab[];
  selectedSpecFilters: string[];
  toggleSpecFilter: (key: string) => void;
  showSpeedFilters: boolean;
  speedFiltersWithCounts: CountOption[];
  selectedSpeeds: string[];
  toggleSpeed: (key: string) => void;
  showProductionFilters: boolean;
  productionFiltersWithCounts: CountOption[];
  selectedProduction: string | null;
  toggleProduction: (key: string) => void;
  availabilityFilter: 'in-stock' | 'on-request' | null;
  setAvailabilityFilter: Dispatch<SetStateAction<'in-stock' | 'on-request' | null>>;
  inStockProductCount: number;
  onRequestProductCount: number;
  sidebarAttributeOptions: AttrOption[];
  selectedAttributes: string[];
  toggleAttribute: (key: string) => void;
  hasPriceFilter: boolean;
  priceMin: number | null;
  priceMax: number | null;
  availablePriceRange: { min: number; max: number };
  setPriceMin: Dispatch<SetStateAction<number | null>>;
  setPriceMax: Dispatch<SetStateAction<number | null>>;
  mostViewedOfferFilter: { key: string; count: number } | null;
  toggleMostViewedOffer: () => void;
  brandFilterOptions: BrandOption[];
  selectedBrands: string[];
  toggleBrand: (key: string) => void;
  hasSidebarFilters: boolean;
  hasAttributeFilters: boolean;
  hasBrandFilters: boolean;
  hasSearchFilter: boolean;
  hasSortFilter: boolean;
  clearAllFilters: () => void;
};

/** Panel de filtros storefront/categoría (chunk aparte del grid). */
export function CategoryFiltersPanel(props: CategoryFiltersPanelProps): ReactNode {
  const {
    filterSectionLabelClass,
    catalogSidebarLayout,
    storefrontMode,
    categoryTreeLoading,
    categoryTree,
    categoryTreeError,
    categoryTreeFetching,
    refetchCategoryTree,
    sidebarCategoryTree,
    sidebarActiveCategorySlug,
    subSlug,
    isAllSubcategoriesView,
    isStoreAll,
    selectRootCategory,
    selectSubcategory,
    prefetchSubcategoryCatalog,
    showCatalogSpecFilters,
    colorSpecFilterTabs,
    formatSpecFilterTabs,
    selectedSpecFilters,
    toggleSpecFilter,
    showSpeedFilters,
    speedFiltersWithCounts,
    selectedSpeeds,
    toggleSpeed,
    showProductionFilters,
    productionFiltersWithCounts,
    selectedProduction,
    toggleProduction,
    availabilityFilter,
    setAvailabilityFilter,
    inStockProductCount,
    onRequestProductCount,
    sidebarAttributeOptions,
    selectedAttributes,
    toggleAttribute,
    hasPriceFilter,
    priceMin,
    priceMax,
    availablePriceRange,
    setPriceMin,
    setPriceMax,
    mostViewedOfferFilter,
    toggleMostViewedOffer,
    brandFilterOptions,
    selectedBrands,
    toggleBrand,
    hasSidebarFilters,
    hasAttributeFilters,
    hasBrandFilters,
    hasSearchFilter,
    hasSortFilter,
    clearAllFilters,
  } = props;

  return (
  <>
    <CatalogFilterSection
      title={catalogSidebarLayout ? 'Categorías' : 'Catálogo'}
      labelClassName={filterSectionLabelClass}
    >
      <div className="max-h-[min(16rem,42vh)] overflow-y-auto rounded-md border border-border/70 bg-background shadow-sm [scrollbar-width:thin]">
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
    </CatalogFilterSection>

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
        defaultOpen
        openWhenActive={availabilityFilter != null}
      >
        <CatalogFilterGroup>
          <CatalogFilterOption
            id="filter-in-stock"
            label="En stock"
            count={inStockProductCount}
            active={availabilityFilter === 'in-stock'}
            mode="radio"
            compact={!storefrontMode}
            disabled={inStockProductCount === 0}
            onToggle={() =>
              startTransition(() => {
                setAvailabilityFilter((prev) => (prev === 'in-stock' ? null : 'in-stock'));
              })
            }
          />
          <CatalogFilterOption
            id="filter-on-request"
            label="A pedido"
            count={onRequestProductCount}
            active={availabilityFilter === 'on-request'}
            mode="radio"
            compact={!storefrontMode}
            disabled={onRequestProductCount === 0}
            onToggle={() =>
              startTransition(() => {
                setAvailabilityFilter((prev) => (prev === 'on-request' ? null : 'on-request'));
              })
            }
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

        <Suspense fallback={<div className="h-8 animate-pulse rounded bg-muted" aria-hidden="true" />}>
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
        </Suspense>
      </div>
      <p className="mt-2 text-[0.6875rem] text-muted-foreground">
        Rango disponible: {availablePriceRange.min} - {availablePriceRange.max} USD
      </p>
    </CatalogFilterSection>

    {mostViewedOfferFilter ? (
      <CatalogFilterSection
        title="Oferta"
        labelClassName={filterSectionLabelClass}
        defaultOpen
        openWhenActive={selectedAttributes.includes(MOST_VIEWED_OFFER_ATTR_KEY)}
      >
        <CatalogFilterGroup>
          <CatalogFilterOption
            id="filter-offer-most-viewed"
            label="En oferta"
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
}

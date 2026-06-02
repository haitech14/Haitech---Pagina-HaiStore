import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

import { CategoryHeroBanner } from '@/components/category-hero-banner';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategoryHeroContent } from '@/data/category-hero';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useProducts } from '@/hooks/use-products';
import {
  findCategoryBySlug,
  findStoreSubcategoryBySlug,
  resolveCategoryPageProductLabels,
} from '@/lib/category-product-labels';
import { findStoreCategoryBySlug } from '@/lib/store-category-display';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { useCategoryConditionFilter } from '@/components/product-condition-tabs';
import {
  CATEGORY_HERO_ID,
  CATEGORY_PRODUCTS_ID,
  scrollToCategoryHero,
} from '@/lib/category-path';
import { productMatchesCondition } from '@/lib/product-condition';
import { cn } from '@/lib/utils';
import type { StoreCategoryTreeNode } from '@/types/store-category';

type CategorySortValue = 'price-asc' | 'price-desc' | 'name-asc';
type CatalogViewMode = 'grid' | 'list';

function flattenCategoryTree(
  nodes: StoreCategoryTreeNode[],
  depth = 0,
): Array<{ node: StoreCategoryTreeNode; depth: number }> {
  const result: Array<{ node: StoreCategoryTreeNode; depth: number }> = [];
  for (const node of nodes) {
    result.push({ node, depth });
    if (node.children?.length) {
      result.push(...flattenCategoryTree(node.children, depth + 1));
    }
  }
  return result;
}

function ProductSkeleton() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <div className="mb-3 aspect-video animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-1/3 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const subSlug = searchParams.get('sub');
  const estadoFilter = useCategoryConditionFilter();

  const category = slug ? findCategoryBySlug(slug) : undefined;
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const { data: products, isLoading, isError } = useProducts();
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<CategorySortValue>('price-asc');
  const [viewMode, setViewMode] = useState<CatalogViewMode>('grid');

  const storeCategory = useMemo(
    () => (slug ? findStoreCategoryBySlug(categoryTree, slug) : undefined),
    [categoryTree, slug],
  );

  const activeSubcategory = useMemo(
    () =>
      subSlug && storeCategory
        ? findStoreSubcategoryBySlug(storeCategory, subSlug)
        : undefined,
    [storeCategory, subSlug],
  );

  const productLabels = useMemo(() => {
    if (!category) return [];
    return resolveCategoryPageProductLabels(category, storeCategory, subSlug);
  }, [category, storeCategory, subSlug]);

  const baseProducts = useMemo(() => {
    if (!products?.length) return [];
    return products.filter((product) =>
      productLabels.some((label) => productMatchesCategoryFilter(product, label)),
    );
  }, [products, productLabels]);

  const availableAttributes = useMemo(() => {
    const map = new Map<string, { key: string; label: string; count: number }>();
    for (const product of baseProducts) {
      for (const attr of product.attributes ?? []) {
        const key = `${attr.name}::${attr.value}`;
        const label = `${attr.name}: ${attr.value}`;
        const prev = map.get(key);
        map.set(key, { key, label, count: (prev?.count ?? 0) + 1 });
      }
    }
    return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'es'));
  }, [baseProducts]);

  const availablePriceRange = useMemo(() => {
    if (baseProducts.length === 0) return { min: 0, max: 0 };
    const prices = baseProducts.map((product) => product.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [baseProducts]);

  useEffect(() => {
    setSelectedAttributes((prev) => prev.filter((key) => availableAttributes.some((attr) => attr.key === key)));
    setPriceMin(availablePriceRange.min);
    setPriceMax(availablePriceRange.max);
  }, [availableAttributes, availablePriceRange.min, availablePriceRange.max]);

  const filteredProducts = useMemo(() => {
    const min = priceMin ?? availablePriceRange.min;
    const max = priceMax ?? availablePriceRange.max;
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);

    let list = baseProducts;
    if (estadoFilter) {
      list = list.filter((product) => productMatchesCondition(product, estadoFilter));
    }
    if (selectedAttributes.length > 0) {
      list = list.filter((product) => {
        const attrs = new Set((product.attributes ?? []).map((attr) => `${attr.name}::${attr.value}`));
        return selectedAttributes.every((key) => attrs.has(key));
      });
    }
    list = list.filter((product) => {
      if (product.price < safeMin) return false;
      if (product.price > safeMax) return false;
      return true;
    });
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
    selectedAttributes,
    priceMin,
    priceMax,
    sortBy,
    availablePriceRange.min,
    availablePriceRange.max,
  ]);

  useLayoutEffect(() => {
    const behavior: ScrollBehavior = location.hash ? 'smooth' : 'auto';

    const focusHero = () => scrollToCategoryHero(behavior);
    focusHero();
    const retry = window.setTimeout(focusHero, 150);
    return () => window.clearTimeout(retry);
  }, [slug, location.hash, location.pathname]);

  const heroContent = useMemo(() => {
    if (!category) return null;

    const fallbackImage = storeCategory?.image ?? category.image;
    const base = getCategoryHeroContent(category.slug, {
      name: storeCategory?.name ?? category.name,
      tagline: storeCategory?.tagline ?? category.tagline,
      ...(fallbackImage ? { image: fallbackImage } : {}),
    });

    if (activeSubcategory) {
      const subImage = activeSubcategory.image ?? base.image;
      const { badge: _badge, ...baseWithoutBadge } = base;
      return {
        ...baseWithoutBadge,
        title: activeSubcategory.name,
        subtitle:
          activeSubcategory.tagline ??
          `Productos de ${activeSubcategory.name} en HaiStore.`,
        image: subImage,
        imageAlt: `Productos de ${activeSubcategory.name}`,
      };
    }

    return base;
  }, [category, storeCategory, activeSubcategory]);

  if (!slug || !category) {
    return <Navigate to="/" replace />;
  }

  if (subSlug && storeCategory && !activeSubcategory) {
    return <Navigate to={`/categoria/${slug}`} replace />;
  }

  const pageTitle = activeSubcategory?.name ?? category.name;
  const subcategories = storeCategory?.children ?? [];
  const treeSubcategories = useMemo(
    () => flattenCategoryTree(subcategories),
    [subcategories],
  );
  const hasAttributeFilters = selectedAttributes.length > 0;
  const hasPriceFilter =
    priceMin !== availablePriceRange.min || priceMax !== availablePriceRange.max;
  const hasAnyFilter = subSlug != null || hasAttributeFilters || hasPriceFilter;
  const quickAttributeFilters = useMemo(() => availableAttributes.slice(0, 6), [availableAttributes]);

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

  const clearAllFilters = useCallback(() => {
    setSelectedAttributes([]);
    setPriceMin(availablePriceRange.min);
    setPriceMax(availablePriceRange.max);
    selectSubcategory(null);
  }, [availablePriceRange.max, availablePriceRange.min, selectSubcategory]);

  return (
    <div className="flex flex-col gap-8 pb-12 pt-6 sm:gap-10 sm:pb-16 sm:pt-8">
      <div className="container flex flex-col gap-6 sm:gap-8">
        <nav aria-label="Miga de pan" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link to="/" className="hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span className="font-medium text-foreground">{pageTitle}</span>
            </li>
          </ol>
        </nav>

        {heroContent && (
          <div id={CATEGORY_HERO_ID} className="scroll-mt-28 sm:scroll-mt-32">
            <CategoryHeroBanner content={heroContent} />
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
          <aside className="h-fit rounded-xl border bg-card p-4 shadow-sm lg:sticky lg:top-24">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Filtros
              </h2>
              <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
            <div className="mt-4 space-y-4">
              <section aria-label="Subcategorías">
                <h3 className="text-sm font-semibold text-foreground">Subcategorías</h3>
                <div className="mt-2 space-y-1.5 rounded-lg border border-border/70 bg-background p-1.5">
                  <button
                    type="button"
                    onClick={() => selectSubcategory(null)}
                    className={cn(
                      'flex min-h-11 w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                      subSlug === null
                        ? 'border-red-600 bg-red-50 text-red-700'
                        : 'border-border bg-background hover:border-red-300',
                    )}
                  >
                    <span>Ver todo</span>
                    <span className="text-xs text-muted-foreground">{baseProducts.length}</span>
                  </button>

                  {treeSubcategories.map(({ node, depth }) => {
                    const isActive = subSlug === node.slug;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        onClick={() => selectSubcategory(node.slug)}
                        className={cn(
                          'flex min-h-11 w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
                          isActive
                            ? 'border-red-600 bg-red-50 text-red-700'
                            : 'border-border bg-background hover:border-red-300',
                        )}
                        style={{ paddingLeft: `${12 + depth * 16}px` }}
                      >
                        <span className="flex items-center gap-1.5">
                          {depth > 0 ? (
                            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                          ) : null}
                          <span className="line-clamp-2">{node.name}</span>
                        </span>
                        <span className="ml-2 flex shrink-0 items-center gap-1.5">
                          <span className="text-xs text-muted-foreground">{node.productCount ?? 0}</span>
                          {isActive ? (
                            <CheckCircle2 className="size-3.5 text-red-600" aria-hidden="true" />
                          ) : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section aria-label="Atributos">
                <h3 className="text-sm font-semibold text-foreground">Atributos</h3>
                <div className="mt-2 max-h-64 space-y-1.5 overflow-auto pr-1">
                  {availableAttributes.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sin atributos disponibles.</p>
                  ) : (
                    availableAttributes.map((attr) => {
                      const active = selectedAttributes.includes(attr.key);
                      return (
                        <label
                          key={attr.key}
                          className={cn(
                            'flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                            active
                              ? 'border-red-600 bg-red-50 text-red-700'
                              : 'border-border bg-background hover:border-red-300',
                          )}
                        >
                          <span className="flex items-center gap-2 pr-2">
                            <Checkbox
                              checked={active}
                              onCheckedChange={() => toggleAttribute(attr.key)}
                              aria-label={attr.label}
                            />
                            <span className="line-clamp-2">{attr.label}</span>
                          </span>
                          <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                            {attr.count}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </section>

              <section aria-label="Precio">
                <h3 className="text-sm font-semibold text-foreground">Precio (USD)</h3>
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
                        setPriceMin(Number.isFinite(next) ? Math.max(availablePriceRange.min, next) : availablePriceRange.min);
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
                        setPriceMax(Number.isFinite(next) ? Math.min(availablePriceRange.max, next) : availablePriceRange.max);
                      }}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    />
                  </label>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Rango disponible: {availablePriceRange.min} - {availablePriceRange.max} USD
                </p>
              </section>

              {hasAnyFilter ? (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 w-full rounded-lg font-semibold"
                  onClick={clearAllFilters}
                >
                  Limpiar filtros
                </Button>
              ) : null}
            </div>
          </aside>

          <section
            id={CATEGORY_PRODUCTS_ID}
            className="scroll-mt-28 sm:scroll-mt-32"
            aria-labelledby="productos-categoria-titulo"
          >
            <span id="productos-categoria-titulo" className="sr-only">
              Productos
            </span>

            <div className="mb-4 rounded-xl border bg-card/70 p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {filteredProducts.length} producto{filteredProducts.length === 1 ? '' : 's'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mostrando resultados en {pageTitle}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                    Ordenar por
                  </span>
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as CategorySortValue)}>
                    <SelectTrigger className="h-10 w-[190px] bg-background">
                      <SelectValue placeholder="Selecciona orden" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-asc">Precio: menor a mayor</SelectItem>
                      <SelectItem value="price-desc">Precio: mayor a menor</SelectItem>
                      <SelectItem value="name-asc">Nombre A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="hidden items-center gap-1 rounded-md border bg-background p-1 sm:flex">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      aria-pressed={viewMode === 'grid'}
                      aria-label="Vista de grilla"
                      className={cn(
                        'inline-flex size-8 items-center justify-center rounded-md transition-colors',
                        viewMode === 'grid'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <LayoutGrid className="size-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      aria-pressed={viewMode === 'list'}
                      aria-label="Vista de lista"
                      className={cn(
                        'inline-flex size-8 items-center justify-center rounded-md transition-colors',
                        viewMode === 'list'
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted',
                      )}
                    >
                      <List className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {quickAttributeFilters.length > 0 ? (
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border bg-card/60 p-3">
                <Button
                  type="button"
                  size="sm"
                  variant={selectedAttributes.length === 0 ? 'default' : 'outline'}
                  className={cn(
                    'h-8 rounded-md px-3 text-xs font-semibold',
                    selectedAttributes.length === 0 && 'bg-blue-950 hover:bg-blue-900',
                  )}
                  onClick={() => setSelectedAttributes([])}
                >
                  Todos
                </Button>
                {quickAttributeFilters.map((attr) => {
                  const active = selectedAttributes.includes(attr.key);
                  return (
                    <Button
                      key={attr.key}
                      type="button"
                      size="sm"
                      variant={active ? 'secondary' : 'outline'}
                      className={cn('h-8 rounded-md px-3 text-xs', active && 'border-red-200 bg-red-50 text-red-700')}
                      onClick={() => toggleAttribute(attr.key)}
                    >
                      {attr.label.split(': ')[1] ?? attr.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}

            {isError && (
              <p role="alert" className="text-destructive">
                No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
              </p>
            )}

            {isLoading ? (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    : 'grid-cols-1',
                )}
              >
                {Array.from({ length: 10 }).map((_, index) => (
                  <ProductSkeleton key={index} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-lg border border-dashed px-6 py-10 text-center">
                <p className="font-medium text-foreground">
                  No hay productos en «{pageTitle}» por ahora.
                </p>
                <Button asChild variant="link" className="mt-3 text-red-600">
                  <Link to="/tienda">Explorar todo el catálogo</Link>
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  'grid gap-4',
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                    : 'grid-cols-1 sm:grid-cols-2',
                )}
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

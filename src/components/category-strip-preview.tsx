import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { ProductCatalogCard } from '@/components/product/product-catalog-card';
import { CatalogProductPagination } from '@/components/category/catalog-product-pagination';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { findCategoryBySlug, resolveCategoryPageProductLabels } from '@/lib/category-product-labels';
import {
  EMPTY_STORE_CATEGORY_TREE,
  useStoreCategoriesTree,
} from '@/hooks/use-store-categories';
import { useCategoryCatalog } from '@/hooks/use-category-catalog';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { catalogGridClassName } from '@/lib/category-grid-layout';
import { findStoreCategoryBySlug } from '@/lib/store-category-display';
import {
  CATALOG_PRODUCTS_PER_PAGE,
  clampCatalogPage,
} from '@/lib/catalog-product-pagination';

interface CategoryStripPreviewProps {
  categorySlug: string;
  activeSubSlug?: string | null;
  selectedSpecFilters?: string[];
}

export function CategoryStripPreview({
  categorySlug,
  activeSubSlug = null,
  selectedSpecFilters = [],
}: CategoryStripPreviewProps) {
  const [page, setPage] = useState(1);
  const category = findCategoryBySlug(categorySlug);
  const { data: categoryTreeData, isLoading: treeLoading } = useStoreCategoriesTree();
  const categoryTree = categoryTreeData ?? EMPTY_STORE_CATEGORY_TREE;

  const storeCategory = useMemo(
    () => findStoreCategoryBySlug(categoryTree, categorySlug),
    [categoryTree, categorySlug],
  );

  const productLabels = useMemo(() => {
    if (!category) return [];
    return resolveCategoryPageProductLabels(category, storeCategory, activeSubSlug);
  }, [category, storeCategory, activeSubSlug]);

  const { data: catalogData, isLoading: productsLoading, isError } = useCategoryCatalog({
    enabled: productLabels.length > 0,
    slug: categorySlug,
    labels: productLabels,
    attributeKeys: selectedSpecFilters,
    sortBy: 'price-asc',
    page,
    limit: CATALOG_PRODUCTS_PER_PAGE,
  });

  const filteredProducts = catalogData?.products ?? [];
  const totalPages = catalogData?.totalPages ?? 1;
  const safePage = clampCatalogPage(page, totalPages);
  const pagedProducts = filteredProducts;

  useEffect(() => {
    setPage(1);
  }, [categorySlug, activeSubSlug, selectedSpecFilters]);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const isLoading = treeLoading || productsLoading;
  const viewAllHref = activeSubSlug
    ? categoryPath(categorySlug, activeSubSlug)
    : categoryLandingPath(categorySlug);

  if (!category) return null;

  if (categorySlug === 'servicio-tecnico') {
    return (
      <div className="mt-8 rounded-xl border border-border/70 bg-muted/20 px-5 py-8 text-center sm:px-8">
        <h3 className="text-lg font-bold text-foreground">{category.name}</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">{category.tagline}</p>
        <Button asChild className="mt-5 min-h-11 bg-red-600 hover:bg-red-500">
          <Link to="/contacto?tema=servicio">
            Solicitar servicio técnico
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-6">
      {isError ? (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
        </p>
      ) : isLoading ? (
        <div className={catalogGridClassName(5)}>
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-xl border border-border/60 p-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-6 w-1/3" />
            </div>
          ))}
        </div>
      ) : pagedProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-10 text-center">
          <p className="font-medium text-foreground">
            No hay productos en esta categoría por ahora.
          </p>
          <Button asChild variant="link" className="mt-2 text-red-600">
            <Link to="/tienda">Explorar todo el catálogo</Link>
          </Button>
        </div>
      ) : (
        <>
          <ul className={catalogGridClassName(5)} role="list">
            {pagedProducts.map((product) => (
              <li key={product.id}>
                <ProductCatalogCard product={product} />
              </li>
            ))}
          </ul>

          <CatalogProductPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            pageSize={CATALOG_PRODUCTS_PER_PAGE}
            onPageChange={setPage}
          />

          <div className="flex justify-center pt-1">
            <Button asChild variant="link" className="min-h-11 gap-1.5 text-red-600">
              <Link to={viewAllHref}>
                Ver catálogo completo
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

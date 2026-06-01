import { useLayoutEffect, useMemo } from 'react';
import { Link, Navigate, useLocation, useParams, useSearchParams } from 'react-router-dom';

import { CategoryHeroBanner } from '@/components/category-hero-banner';
import { ProductCard } from '@/components/product-card';
import { SubcategoriesGrid } from '@/components/subcategories-grid';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { getCategoryHeroContent } from '@/data/category-hero';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { useProducts } from '@/hooks/use-products';
import {
  findCategoryBySlug,
  getCategoryProductLabels,
} from '@/lib/category-product-labels';
import {
  collectInventoryLabels,
  findStoreCategoryBySlug,
} from '@/lib/store-category-display';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { sortProductsByOrder } from '@/lib/inventory-product-order';
import { CATEGORY_HERO_ID, scrollToCategoryHero } from '@/lib/category-path';
import type { Category } from '@/data/categories';

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

function resolveProductLabels(
  category: Category,
  storeCategory: ReturnType<typeof findStoreCategoryBySlug>,
  subSlug: string | null,
): string[] {
  if (storeCategory && subSlug) {
    const sub = storeCategory.children?.find((row) => row.slug === subSlug);
    if (sub) {
      const labels = sub.inventoryLabels ?? [];
      return labels.length > 0 ? labels : [sub.name];
    }
  }

  if (storeCategory) {
    return collectInventoryLabels(storeCategory);
  }

  return [...getCategoryProductLabels(category)];
}

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const subSlug = searchParams.get('sub');

  const category = slug ? findCategoryBySlug(slug) : undefined;
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const { data: products, isLoading, isError } = useProducts();

  const storeCategory = useMemo(
    () => (slug ? findStoreCategoryBySlug(categoryTree, slug) : undefined),
    [categoryTree, slug],
  );

  const activeSubcategory = useMemo(
    () =>
      subSlug && storeCategory
        ? storeCategory.children?.find((row) => row.slug === subSlug)
        : undefined,
    [storeCategory, subSlug],
  );

  const productLabels = useMemo(() => {
    if (!category) return [];
    return resolveProductLabels(category, storeCategory, subSlug);
  }, [category, storeCategory, subSlug]);

  const filteredProducts = useMemo(() => {
    if (!products?.length || productLabels.length === 0) return [];
    return sortProductsByOrder(
      products.filter((product) =>
        productLabels.some((label) => productMatchesCategoryFilter(product, label)),
      ),
    );
  }, [products, productLabels]);

  useLayoutEffect(() => {
    if (subSlug) return;

    const focusHero = () => scrollToCategoryHero(location.hash ? 'smooth' : 'auto');

    focusHero();
    const retry = window.setTimeout(focusHero, 150);
    return () => window.clearTimeout(retry);
  }, [slug, subSlug, location.hash, location.pathname]);

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

        {subcategories.length > 0 && (
          <SubcategoriesGrid
            parentSlug={category.slug}
            parentImage={storeCategory?.image ?? category.image ?? null}
            subcategories={subcategories}
            activeSubSlug={subSlug}
            products={products ?? []}
          />
        )}

        <section aria-labelledby="productos-categoria-titulo">
          <header className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 id="productos-categoria-titulo" className="text-xl font-bold tracking-tight sm:text-2xl">
                Productos
              </h2>
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length > 0
                  ? `${filteredProducts.length} producto${filteredProducts.length === 1 ? '' : 's'} en ${pageTitle}`
                  : `Catálogo de ${pageTitle}`}
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <Link to="/tienda">Ver tienda completa</Link>
            </Button>
          </header>

          {isError && (
            <p role="alert" className="text-destructive">
              No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomeFeaturedProducts } from '@/hooks/use-home-featured-products';
import { HOME_HIGHLIGHTED_ROW_SIZE, MIN_HOME_FEATURED } from '@/lib/home-featured-products';
import { cn } from '@/lib/utils';

const MOBILE_GRID_CLASS = 'grid grid-cols-2 gap-3 sm:grid-cols-3';

const DESKTOP_STRIP_CLASS =
  'xl:grid xl:grid-cols-6 xl:gap-0 xl:overflow-hidden xl:rounded-xl xl:border xl:border-border/50 xl:bg-white xl:shadow-[0_2px_12px_rgba(15,31,61,0.08)]';

export function HomeHighlightedSection() {
  const { data: highlightedProducts = [], isLoading, isError } = useHomeFeaturedProducts();

  if (!isLoading && highlightedProducts.length < MIN_HOME_FEATURED) {
    return null;
  }

  const lastIndex = highlightedProducts.length - 1;

  return (
    <section aria-labelledby="lo-mas-destacado-titulo" className="bg-white">
      <div className="container px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="lo-mas-destacado-titulo"
              className="text-balance text-xl font-bold tracking-tight sm:text-2xl"
            >
              <span className="relative inline-block text-red-600">
                Lo
                <span
                  className="absolute -bottom-1 left-0 h-0.5 w-full bg-red-600"
                  aria-hidden="true"
                />
              </span>
              <span className="text-[#0f1f3d]"> más destacado</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Equipos en stock con cotización inmediata
            </p>
          </div>
          <Link
            to="/categoria/multifuncionales"
            className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            Ver todos los multifuncionales →
          </Link>
        </div>

        {isError ? (
          <p role="alert" className="text-sm text-destructive">
            No se pudieron cargar los productos. Inténtalo de nuevo más tarde.
          </p>
        ) : isLoading ? (
          <ul className={cn(MOBILE_GRID_CLASS, DESKTOP_STRIP_CLASS)}>
            {Array.from({ length: HOME_HIGHLIGHTED_ROW_SIZE }).map((_, index) => (
              <li
                key={index}
                className={cn(index > 0 && 'xl:border-l xl:border-border/50')}
              >
                <div className="flex flex-col items-center gap-2 rounded-xl border border-border/50 bg-white p-2 shadow-sm xl:rounded-none xl:border-0 xl:shadow-none">
                  <Skeleton className="aspect-square w-full bg-neutral-100" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={cn(MOBILE_GRID_CLASS, DESKTOP_STRIP_CLASS)} role="list">
            {highlightedProducts.map((product, index) => (
              <li
                key={product.id}
                className={cn(
                  'min-w-0',
                  index > 0 && 'xl:border-l xl:border-border/50',
                  index === 0 && 'xl:rounded-l-xl',
                  index === lastIndex && 'xl:rounded-r-xl',
                )}
              >
                <ProductHighlightCard product={product} layout="strip" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import { HomeCatalogLoadError } from '@/components/home-catalog-load-error';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomeHighlightedDisplay } from '@/hooks/use-home-highlighted-display';
import { HOME_HIGHLIGHTED_ROW_SIZE } from '@/lib/home-highlighted-selection';

export function HomeHighlightedSection() {
  const {
    products: highlightedProducts,
    subtitle,
    displayMode,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useHomeHighlightedDisplay();

  const isEmpty = !isLoading && displayMode === 'empty';
  const showCarousel = highlightedProducts.length > 0;

  return (
    <section aria-labelledby="visto-recientemente-titulo">
      <div className="container px-3 pb-8 sm:px-4 sm:pb-10">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-[0_2px_12px_rgba(15,31,61,0.06)] sm:p-5 md:p-6">
          <div className="mb-4 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="mb-2 inline-flex items-center rounded-full border border-red-600/20 bg-red-50 px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-red-600 sm:text-[0.6875rem]">
                Tu actividad
              </span>
              <h2
                id="visto-recientemente-titulo"
                className="text-balance text-xl font-bold tracking-tight text-foreground sm:text-2xl"
              >
                Visto recientemente
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            </div>
            {showCarousel ? (
              <Link
                to="/tienda"
                className="shrink-0 text-sm font-semibold text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                Explorar catálogo →
              </Link>
            ) : null}
          </div>

          {isError && highlightedProducts.length === 0 ? (
            <HomeCatalogLoadError onRetry={() => void refetch()} isRetrying={isFetching} />
          ) : isLoading && highlightedProducts.length === 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
              {Array.from({ length: HOME_HIGHLIGHTED_ROW_SIZE }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-white p-2">
                  <Skeleton className="aspect-square w-full bg-neutral-100" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : isEmpty ? (
            <p className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground" role="status">
              No hay productos disponibles para mostrar en este momento.
            </p>
          ) : (
            <ProductCarouselSection
              sectionId="visto-recientemente"
              title="Visto recientemente"
              products={highlightedProducts}
              hideHeader
              showNavArrows
            />
          )}
        </div>
      </div>
    </section>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { HomeLandingProductCard } from '@/components/home/home-landing-product-card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFeaturedProducts, type FeaturedProduct } from '@/data/featured-products';
import { HOME_LANDING_LINKS } from '@/data/home-landing-sections';
import { useHomeFeaturedProducts } from '@/hooks/use-home-featured-products';
import { enrichFeaturedFromCatalog } from '@/lib/featured-catalog-enrich';
import { productToFeatured } from '@/lib/store-products';
import { cn } from '@/lib/utils';

const FEATURED_HOME_LIMIT = 5;

const FEATURED_GRID_CLASS =
  'grid grid-cols-2 gap-3 sm:gap-3.5 md:grid-cols-3 lg:grid-cols-5 lg:gap-4';

function HomeFeaturedProductsSkeleton() {
  return (
    <ul className={FEATURED_GRID_CLASS} role="list">
      {Array.from({ length: FEATURED_HOME_LIMIT }).map((_, index) => (
        <li key={index}>
          <div className="overflow-hidden rounded-xl border border-border/50 bg-white p-3 shadow-[0_2px_14px_rgba(15,31,61,0.07)]">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="mt-2.5 h-4 w-full" />
            <Skeleton className="mt-1.5 h-3 w-28" />
            <Skeleton className="mt-2 h-5 w-24" />
            <Skeleton className="mt-3 h-10 w-full rounded-lg" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function HomeFeaturedProductsSection() {
  const { data: liveFeatured = [], isLoading } = useHomeFeaturedProducts();

  const products = useMemo(() => {
    const merged: FeaturedProduct[] = [];
    const seen = new Set<string>();

    const pushUnique = (item: FeaturedProduct) => {
      if (seen.has(item.id) || merged.length >= FEATURED_HOME_LIMIT) return;
      seen.add(item.id);
      merged.push(enrichFeaturedFromCatalog(item));
    };

    for (const product of liveFeatured) {
      pushUnique(productToFeatured(product));
    }

    for (const item of getFeaturedProducts()) {
      pushUnique(item);
    }

    return merged.slice(0, FEATURED_HOME_LIMIT);
  }, [liveFeatured]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section aria-labelledby="home-featured-products-title" className="home-landing-sans bg-white">
      <div className="container pb-8 pt-4 sm:pb-10 sm:pt-6">
        <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <h2
            id="home-featured-products-title"
            className="home-section-title text-xl font-bold uppercase tracking-tight sm:text-2xl lg:text-[1.75rem] lg:leading-none"
          >
            <span className="relative inline-block pb-2 text-[#111111]">
              Productos
              <span
                className="absolute bottom-0 left-0 h-1 w-10 rounded-full bg-[#E30613]"
                aria-hidden="true"
              />
            </span>{' '}
            <span className="text-[#E30613]">destacados</span>
          </h2>

          <Link
            to={HOME_LANDING_LINKS.allProducts}
            className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-[#E30613] transition-colors hover:text-[#c90511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2"
          >
            Ver todos los productos
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading && products.length === 0 ? (
          <HomeFeaturedProductsSkeleton />
        ) : (
          <ul className={cn(FEATURED_GRID_CLASS, 'items-stretch')} role="list">
            {products.map((product, index) => (
              <li key={product.id} className="flex min-w-0">
                <HomeLandingProductCard product={product} index={index} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

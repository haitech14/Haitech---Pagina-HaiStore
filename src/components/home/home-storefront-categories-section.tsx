import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import {
  HOME_STOREFRONT_CATEGORIES,
  type HomeStorefrontCategoryCard,
} from '@/data/home-storefront-mockup';
import { prefetchCategoryFromHref } from '@/lib/prefetch-category-page';
import { cn } from '@/lib/utils';

/** 2 filas × 4 columnas en desktop (8 categorías visibles, sin carrusel). */
const GRID_VISIBLE_COUNT = 8;

function CategoryCard({
  category,
  priority = false,
  onPrefetch,
}: {
  category: HomeStorefrontCategoryCard;
  priority?: boolean;
  onPrefetch: (href: string) => void;
}) {
  return (
    <Link
      to={category.href}
      onMouseEnter={() => onPrefetch(category.href)}
      onFocus={() => onPrefetch(category.href)}
      className={cn(
        'group relative flex min-h-[11rem] items-center justify-center overflow-visible bg-transparent sm:min-h-[13.5rem] lg:min-h-[15.5rem]',
        'origin-center transition-transform duration-300 ease-out will-change-transform',
        'hover:scale-[0.88] motion-reduce:transition-none motion-reduce:hover:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
      )}
      aria-label={category.label}
    >
      <img
        src={category.imageSrc}
        alt=""
        width={640}
        height={480}
        sizes="(max-width: 640px) 48vw, 24vw"
        className="h-[10rem] w-auto max-w-[98%] object-contain object-center sm:h-[12.5rem] lg:h-[14.5rem]"
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
      />

      <span
        className={cn(
          'pointer-events-none absolute inset-0 z-[1] flex items-center justify-center px-1.5',
          'text-center text-sm font-extrabold uppercase tracking-[0.05em] text-white',
          'sm:text-base lg:text-lg xl:text-xl',
        )}
        style={{
          textShadow:
            '0 1px 2px rgba(0,0,0,0.85), 0 0 8px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.9)',
        }}
      >
        {category.label}
      </span>
    </Link>
  );
}

export function HomeStorefrontCategoriesSection() {
  const queryClient = useQueryClient();
  const categories = HOME_STOREFRONT_CATEGORIES.slice(0, GRID_VISIBLE_COUNT);

  const prefetchCategoryHref = useCallback(
    (href: string) => {
      prefetchCategoryFromHref(queryClient, href);
    },
    [queryClient],
  );

  return (
    <section aria-labelledby="home-storefront-categories-title" className="bg-white">
      <div className="container py-6 sm:py-8">
        <header className="mb-4 text-center sm:mb-5">
          <p className="text-sm font-medium text-[#6B7280] sm:text-base">Categorías</p>
          <h2
            id="home-storefront-categories-title"
            className="mt-1 text-balance text-xl font-extrabold tracking-tight text-[#111111] sm:text-2xl lg:text-[1.75rem]"
          >
            Explora nuestra gama de productos
          </h2>
        </header>

        <ul
          className="grid grid-cols-2 grid-rows-4 gap-x-3 gap-y-0 sm:grid-cols-4 sm:grid-rows-2 sm:gap-x-4 sm:gap-y-0"
          role="list"
        >
          {categories.map((category, index) => (
            <li key={category.id} className="min-w-0">
              <CategoryCard
                category={category}
                priority={index < 4}
                onPrefetch={prefetchCategoryHref}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

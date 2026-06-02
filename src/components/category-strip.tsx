import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

import { categories, type Category } from '@/data/categories';
import { categoryPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';

function CategoryImage({ category }: { category: Category }) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(category.image) && !hasError;

  return (
    <div className="flex aspect-[16/10] items-center justify-center bg-white p-3 sm:p-4">
      {showImage ? (
        <img
          src={category.image}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <category.icon
          className="size-16 text-muted-foreground/20 transition-colors group-hover:text-red-600/25"
          aria-hidden="true"
          strokeWidth={1.25}
        />
      )}
    </div>
  );
}

export function CategoryStrip() {
  return (
    <section aria-labelledby="categorias-titulo" className="bg-background">
      <div className="container py-10 sm:py-12">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
            <h2
              id="categorias-titulo"
              className="text-balance text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl"
            >
              <span className="text-red-600">Explora</span>{' '}
              <span className="text-foreground">nuestras categorías</span>
            </h2>
            <span className="h-px w-10 bg-red-600 sm:w-14" aria-hidden="true" />
          </div>
          <p className="mt-3 text-pretty text-sm text-muted-foreground sm:text-base">
            Elige una categoría para ver su página con subcategorías y productos.
          </p>
        </header>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-6 lg:gap-4" role="list">
          {categories.map((category) => (
            <li key={category.slug} className="min-w-0">
              <Link
                to={categoryPath(category.slug)}
                className={cn(
                  'group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border/70 bg-white text-left shadow-[0_8px_24px_-16px_hsl(var(--foreground)/0.45)] transition-all hover:-translate-y-0.5 hover:border-red-600/30 hover:shadow-[0_14px_28px_-16px_hsl(var(--foreground)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                )}
              >
                <CategoryImage category={category} />

                <div className="flex min-h-14 items-center justify-between gap-2 border-t border-border/60 bg-white px-3 py-3 sm:px-4">
                  <p className="text-pretty text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-foreground sm:text-xs">
                    {category.name}
                  </p>
                  <span
                    className="grid size-6 shrink-0 place-items-center rounded-full border border-red-600/40 bg-white sm:size-7"
                    aria-hidden="true"
                  >
                    <ChevronRight
                      className="size-4 text-red-600 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

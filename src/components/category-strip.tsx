import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { categories, type Category } from '@/data/categories';
import { categoryPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';

function CategoryImage({ category }: { category: Category }) {
  const [hasError, setHasError] = useState(false);
  const showImage = Boolean(category.image) && !hasError;

  return (
    <div className="flex aspect-[4/3] items-center justify-center bg-white p-4">
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section aria-labelledby="categorias-titulo" className="bg-background">
      <div className="container py-10 sm:py-12">
        <header className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
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

        <div className="relative">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Categorías anteriores"
            className="absolute -left-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:border-red-600/50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:flex lg:-left-3"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>

          <div className="overflow-hidden sm:mx-11 lg:mx-12" ref={emblaRef}>
            <ul className="flex gap-3 sm:gap-4" role="list">
              {categories.map((category) => (
                <li
                  key={category.slug}
                  className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_20%]"
                >
                  <Link
                    to={categoryPath(category.slug)}
                    className={cn(
                      'group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border/80 bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-600/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
                    )}
                  >
                    <span className="block h-1 bg-red-600" aria-hidden="true" />

                    <CategoryImage category={category} />

                    <div className="flex items-center justify-between gap-2 border-t border-border/60 bg-card px-3 py-3 sm:px-4">
                      <p className="text-pretty text-[0.65rem] font-bold uppercase leading-tight tracking-wide text-foreground sm:text-xs">
                        {category.name}
                      </p>
                      <ChevronRight
                        className="size-4 shrink-0 text-red-600 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={scrollNext}
            aria-label="Más categorías"
            className="absolute -right-1 top-1/2 z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:border-red-600/50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 sm:flex lg:-right-3"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
}

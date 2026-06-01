import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import { SubcategoryAutoImage } from '@/components/subcategory-auto-image';
import { Badge } from '@/components/ui/badge';
import { categoryPath } from '@/lib/category-path';
import { resolveSubcategoryImage } from '@/lib/subcategory-product-image';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

interface SubcategoriesGridProps {
  parentSlug: string;
  parentImage?: string | null;
  subcategories: StoreCategoryTreeNode[];
  activeSubSlug: string | null;
  products?: Product[];
}

const cardLinkClass =
  'flex h-full w-full flex-col overflow-hidden rounded-md border bg-card text-left shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500';

export function SubcategoriesGrid({
  parentSlug,
  parentImage,
  subcategories,
  activeSubSlug,
  products = [],
}: SubcategoriesGridProps) {
  const subcategoryImages = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const sub of subcategories) {
      map.set(
        sub.id,
        resolveSubcategoryImage(
          {
            name: sub.name,
            slug: sub.slug,
            image: sub.image,
            inventoryLabels: sub.inventoryLabels,
          },
          products,
          parentImage,
        ),
      );
    }
    return map;
  }, [subcategories, products, parentImage]);

  if (subcategories.length === 0) return null;

  return (
    <section aria-labelledby="subcategorias-titulo">
      <h2
        id="subcategorias-titulo"
        className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
      >
        Subcategorías
      </h2>

      <ul
        className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5 md:grid-cols-5 lg:grid-cols-6"
        role="list"
      >
        <li>
          <Link
            to={categoryPath(parentSlug)}
            aria-current={activeSubSlug === null ? 'page' : undefined}
            className={cn(
              cardLinkClass,
              'hover:border-red-600/40',
              activeSubSlug === null
                ? 'border-red-600 ring-1 ring-red-600/25'
                : 'border-border/80',
            )}
          >
            <SubcategoryAutoImage
              name="Ver todo"
              slug={`${parentSlug}-all`}
              image={parentImage}
              compact
            />
            <div className="border-t border-border/60 px-2 py-1.5">
              <p className="text-[0.6rem] font-bold uppercase leading-tight text-foreground sm:text-[0.65rem]">
                Ver todo
              </p>
              <p className="text-[0.55rem] text-muted-foreground">Todos</p>
            </div>
          </Link>
        </li>

        {subcategories.map((sub) => {
          const isActive = activeSubSlug === sub.slug;
          return (
            <li key={sub.id}>
              <Link
                to={categoryPath(parentSlug, sub.slug)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  cardLinkClass,
                  'hover:-translate-y-0.5 hover:border-red-600/30 hover:shadow-md',
                  isActive
                    ? 'border-red-600 ring-1 ring-red-600/25'
                    : 'border-border/80',
                )}
              >
                <span className="block h-0.5 bg-red-600" aria-hidden="true" />
                <SubcategoryAutoImage
                  name={sub.name}
                  slug={sub.slug}
                  image={subcategoryImages.get(sub.id) ?? sub.image}
                  compact
                />
                <div className="flex items-center justify-between gap-1 border-t border-border/60 px-2 py-1.5">
                  <p className="line-clamp-2 text-[0.6rem] font-bold uppercase leading-tight text-foreground sm:text-[0.65rem]">
                    {sub.name}
                  </p>
                  {(sub.productCount ?? 0) > 0 && (
                    <Badge
                      variant="secondary"
                      className="h-4 shrink-0 px-1 text-[0.55rem] leading-none"
                    >
                      {sub.productCount}
                    </Badge>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

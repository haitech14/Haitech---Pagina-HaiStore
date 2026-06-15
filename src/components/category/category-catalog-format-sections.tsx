import type { ReactNode } from 'react';

import { catalogGridClassName, type CatalogGridColumns } from '@/lib/category-grid-layout';
import type { CatalogFormatSectionGroup } from '@/lib/category-catalog-filters';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface CategoryCatalogFormatSectionsProps {
  sections: CatalogFormatSectionGroup[];
  gridColumns: CatalogGridColumns;
  renderProduct: (product: Product) => ReactNode;
  className?: string;
}

function SectionHeading({
  title,
  count,
  level = 'main',
}: {
  title: string;
  count: number;
  level?: 'main' | 'sub';
}) {
  const isMain = level === 'main';

  return (
    <div className={cn('flex flex-wrap items-end gap-2', isMain ? 'mb-3 sm:mb-4' : 'mb-2.5 sm:mb-3')}>
      <h3
        className={cn(
          'text-balance font-bold tracking-tight text-[#0f1f3d]',
          isMain ? 'text-base sm:text-lg' : 'text-sm sm:text-base',
        )}
      >
        {title}
      </h3>
      <span className="pb-0.5 text-xs text-muted-foreground sm:text-sm">
        ({count} {count === 1 ? 'producto' : 'productos'})
      </span>
      {isMain ? (
        <span className="mb-1 hidden h-px min-w-[2rem] flex-1 bg-red-600/70 sm:block" aria-hidden="true" />
      ) : null}
    </div>
  );
}

export function CategoryCatalogFormatSections({
  sections,
  gridColumns,
  renderProduct,
  className,
}: CategoryCatalogFormatSectionsProps) {
  const visibleSections = sections
    .map((section) => ({
      ...section,
      subsections: section.subsections.filter((subsection) => subsection.products.length > 0),
    }))
    .filter((section) => section.subsections.length > 0);

  if (visibleSections.length === 0) return null;

  return (
    <div className={cn('space-y-8 sm:space-y-10', className)}>
      {visibleSections.map((section) => (
        <section key={section.id} aria-labelledby={`catalog-format-${section.id}`}>
          <SectionHeading
            title={section.title}
            count={section.subsections.reduce((total, item) => total + item.products.length, 0)}
            level="main"
          />
          <span id={`catalog-format-${section.id}`} className="sr-only">
            {section.title}
          </span>

          <div className="space-y-6 sm:space-y-8">
            {section.subsections.map((subsection) => (
              <div key={subsection.id} aria-labelledby={`catalog-format-${subsection.id}`}>
                <SectionHeading
                  title={subsection.title}
                  count={subsection.products.length}
                  level="sub"
                />
                <span id={`catalog-format-${subsection.id}`} className="sr-only">
                  {subsection.title}
                </span>
                <div className={catalogGridClassName(gridColumns)}>
                  {subsection.products.map((product) => (
                    <div key={product.id} className="min-w-0">
                      {renderProduct(product)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

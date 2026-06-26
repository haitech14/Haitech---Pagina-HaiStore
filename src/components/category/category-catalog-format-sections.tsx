import type { ReactNode } from 'react';

import { catalogGridClassName, type CatalogGridColumns } from '@/lib/category-grid-layout';
import type { CatalogFormatSectionGroup } from '@/lib/category-catalog-filters';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

function formatProductCount(count: number): string {
  return `${count} ${count === 1 ? 'producto' : 'productos'}`;
}

interface CategoryCatalogFormatSectionsProps {
  sections: CatalogFormatSectionGroup[];
  gridColumns: CatalogGridColumns;
  sidebarOpen?: boolean;
  gridClassName?: string;
  renderProduct: (product: Product) => ReactNode;
  className?: string;
}

export function CategoryCatalogFormatSections({
  sections,
  gridColumns,
  sidebarOpen = false,
  gridClassName,
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
    <div className={cn('space-y-6 sm:space-y-8', className)}>
      {visibleSections.map((section) => {
        const sectionCount = section.subsections.reduce(
          (total, item) => total + item.products.length,
          0,
        );

        return (
          <section key={section.id} aria-labelledby={`catalog-format-${section.id}`}>
            <h2 id={`catalog-format-${section.id}`} className="sr-only">
              {section.title} ({formatProductCount(sectionCount)})
            </h2>

            <div className="space-y-6 sm:space-y-8">
              {section.subsections.map((subsection) => (
                <div key={subsection.id} aria-labelledby={`catalog-format-${subsection.id}`}>
                  <h3 id={`catalog-format-${subsection.id}`} className="sr-only">
                    {section.title} {subsection.title} ({formatProductCount(subsection.products.length)})
                  </h3>
                  <div className={gridClassName ?? catalogGridClassName(gridColumns, sidebarOpen)}>
                    {subsection.products.map((product) => (
                      <div key={`${subsection.id}-${product.id}`} className="min-w-0">
                        {renderProduct(product)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

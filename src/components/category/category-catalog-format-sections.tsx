import type { ReactNode } from 'react';

import {
  CatalogFormatMainHeader,
  CatalogFormatSubHeader,
} from '@/components/category/catalog-format-section-header';
import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { catalogGridClassName, type CatalogGridColumns } from '@/lib/category-grid-layout';
import type { CatalogFormatSectionGroup } from '@/lib/category-catalog-filters';
import { categoryPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface CategoryCatalogFormatSectionsProps {
  sections: CatalogFormatSectionGroup[];
  gridColumns: CatalogGridColumns;
  renderProduct: (product: Product) => ReactNode;
  className?: string;
  categorySlug?: string;
}

export function CategoryCatalogFormatSections({
  sections,
  gridColumns,
  renderProduct,
  className,
  categorySlug = 'multifuncionales',
}: CategoryCatalogFormatSectionsProps) {
  const visibleSections = sections
    .map((section) => ({
      ...section,
      subsections: section.subsections.filter((subsection) => subsection.products.length > 0),
    }))
    .filter((section) => section.subsections.length > 0);

  if (visibleSections.length === 0) return null;

  let revealIndex = 0;

  return (
    <div className={cn('space-y-8 sm:space-y-10', className)}>
      {visibleSections.map((section) => {
        const sectionCount = section.subsections.reduce(
          (total, item) => total + item.products.length,
          0,
        );

        return (
        <section key={section.id} aria-labelledby={`catalog-format-${section.id}`}>
          <CatalogFormatMainHeader title={section.title} count={sectionCount} />
          <span id={`catalog-format-${section.id}`} className="sr-only">
            {section.title}
          </span>

          <div className="space-y-6 sm:space-y-8">
            {section.subsections.map((subsection) => (
              <div key={subsection.id} aria-labelledby={`catalog-format-${subsection.id}`}>
                <CatalogFormatSubHeader
                  title={subsection.title}
                  count={subsection.products.length}
                  viewAllHref={categoryPath(categorySlug)}
                  className="mb-3 sm:mb-4"
                />
                <span id={`catalog-format-${subsection.id}`} className="sr-only">
                  {subsection.title}
                </span>
                <div className={catalogGridClassName(gridColumns)}>
                  {subsection.products.map((product) => {
                    const delayMs = Math.min(revealIndex * 55, 440);
                    revealIndex += 1;
                    return (
                      <ScrollReveal key={`${subsection.id}-${product.id}`} delayMs={delayMs} className="min-w-0">
                        {renderProduct(product)}
                      </ScrollReveal>
                    );
                  })}
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

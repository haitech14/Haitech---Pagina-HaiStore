import type { ReactNode } from 'react';

import { ScrollReveal } from '@/components/ui/scroll-reveal';
import { catalogGridClassName, type CatalogGridColumns } from '@/lib/category-grid-layout';
import {
  dedupeCatalogProductsById,
  type CatalogFormatSectionGroup,
} from '@/lib/category-catalog-filters';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

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
  const orderedProducts = dedupeCatalogProductsById(
    sections
      .map((section) => ({
        ...section,
        subsections: section.subsections.filter((subsection) => subsection.products.length > 0),
      }))
      .filter((section) => section.subsections.length > 0)
      .flatMap((section) => section.subsections.flatMap((subsection) => subsection.products)),
  );

  if (orderedProducts.length === 0) return null;

  return (
    <div className={cn(className)}>
      <div className={gridClassName ?? catalogGridClassName(gridColumns, sidebarOpen)}>
        {orderedProducts.map((product, index) => {
          const delayMs = Math.min(index * 55, 440);
          return (
            <ScrollReveal key={product.id} delayMs={delayMs} className="min-w-0">
              {renderProduct(product)}
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

import {
  CatalogFormatMainHeader,
  CatalogFormatSubHeader,
} from '@/components/category/catalog-format-section-header';
import { ProductHighlightCard } from '@/components/product/product-highlight-card';
import { useProducts } from '@/hooks/use-products';
import {
  buildCatalogFormatSections,
  findProductCatalogFormatPlacement,
} from '@/lib/category-catalog-filters';
import { categoryPath } from '@/lib/category-path';
import { isPrinterEquipment } from '@/lib/build-product-detail';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';

interface ProductDetailRelatedProps {
  product: Product;
  className?: string;
}

const RELATED_LIMIT = 8;
const CATEGORY_SLUG = 'multifuncionales';

export function ProductDetailRelated({ product, className }: ProductDetailRelatedProps) {
  const { data: products = [], isLoading } = useProducts();

  const catalogContext = useMemo(() => {
    if (!isPrinterEquipment(product)) return null;

    const catalogProducts = products.filter((row) => isPrinterEquipment(row));
    const sections = buildCatalogFormatSections(catalogProducts);
    const placement = findProductCatalogFormatPlacement(product, sections);
    if (!placement) return null;

    const sectionCount = placement.section.subsections.reduce(
      (total, subsection) => total + subsection.products.length,
      0,
    );

    const related = placement.subsection.products
      .filter((row) => row.id !== product.id)
      .slice(0, RELATED_LIMIT);

    return {
      sectionTitle: placement.section.title,
      sectionCount,
      subsectionTitle: placement.subsection.title,
      subsectionCount: placement.subsection.products.length,
      related,
    };
  }, [product, products]);

  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  if (isLoading) {
    return (
      <section
        aria-label="Productos relacionados"
        aria-busy="true"
        className={cn('mt-8 border-t border-border/60 pt-8', className)}
      >
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-5 w-56 animate-pulse rounded bg-muted/80" />
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] animate-pulse rounded-xl bg-muted/50" />
          ))}
        </div>
      </section>
    );
  }

  if (!catalogContext || catalogContext.related.length === 0) return null;

  return (
    <section
      aria-labelledby="productos-relacionados-titulo"
      className={cn('mt-8 border-t border-border/60 pt-8', className)}
    >
      <CatalogFormatMainHeader
        title={catalogContext.sectionTitle}
        count={catalogContext.sectionCount}
        className="mb-4 sm:mb-5"
      />
      <span id="productos-relacionados-titulo" className="sr-only">
        {catalogContext.sectionTitle}
      </span>

      <CatalogFormatSubHeader
        title={catalogContext.subsectionTitle}
        count={catalogContext.subsectionCount}
        viewAllHref={categoryPath(CATEGORY_SLUG)}
        className="mb-4 sm:mb-5"
      />

      <div className="overflow-hidden" ref={emblaRef}>
        <ul className="flex touch-pan-y gap-3 sm:gap-4">
          {catalogContext.related.map((item) => (
            <li
              key={item.id}
              className="min-w-0 flex-[0_0_72%] sm:flex-[0_0_45%] lg:flex-[0_0_32%] xl:flex-[0_0_24%]"
            >
              <ProductHighlightCard product={item} layout="card" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

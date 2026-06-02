import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import { ProductConditionTabList } from '@/components/product-condition-tab-list';
import type { FeaturedProduct } from '@/data/featured-products';
import { categoryPathWithCondition } from '@/lib/category-path';
import type { HomeCatalogSectionConfig } from '@/lib/home-catalog-sections';
import {
  PRODUCT_CONDITIONS,
  type ProductCondition,
} from '@/lib/product-condition';

interface CatalogSectionWithTabsProps {
  section: HomeCatalogSectionConfig;
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>;
}

function firstTabWithProducts(
  map: Record<ProductCondition, FeaturedProduct[]>,
): ProductCondition {
  return PRODUCT_CONDITIONS.find((key) => map[key].length > 0) ?? 'nuevas';
}

const EMPTY_TAB_MESSAGES_BY_SECTION: Partial<
  Record<HomeCatalogSectionConfig['id'], Record<ProductCondition, string>>
> = {
  multifuncionales: {
    nuevas: 'Aún no hay multifuncionales nuevos en esta categoría.',
    seminuevas: 'Próximamente: multifuncionales seminuevos disponibles aquí.',
    remanufacturadas: 'Próximamente: multifuncionales remanufacturados disponibles aquí.',
  },
  impresoras: {
    nuevas: 'Aún no hay impresoras nuevas en esta categoría.',
    seminuevas: 'Próximamente: impresoras seminuevas disponibles aquí.',
    remanufacturadas: 'Próximamente: impresoras remanufacturadas disponibles aquí.',
  },
  'toner-suministros': {
    nuevas: 'Aún no hay tóner ni suministros nuevos en esta categoría.',
    seminuevas: 'Próximamente: suministros seminuevos disponibles aquí.',
    remanufacturadas: 'Próximamente: suministros remanufacturados disponibles aquí.',
  },
  repuestos: {
    nuevas: 'Aún no hay repuestos nuevos en esta categoría.',
    seminuevas: 'Próximamente: repuestos seminuevos disponibles aquí.',
    remanufacturadas: 'Próximamente: repuestos remanufacturados disponibles aquí.',
  },
};

export function CatalogSectionWithTabs({
  section,
  productsByCondition,
}: CatalogSectionWithTabsProps) {
  const [activeCondition, setActiveCondition] = useState<ProductCondition>(() =>
    firstTabWithProducts(productsByCondition),
  );

  const activeProducts = productsByCondition[activeCondition];
  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        PRODUCT_CONDITIONS.map((key) => [key, productsByCondition[key].length]),
      ) as Record<ProductCondition, number>,
    [productsByCondition],
  );

  const titleId = `${section.id}-titulo`;
  const emptyMessage =
    EMPTY_TAB_MESSAGES_BY_SECTION[section.id]?.[activeCondition] ??
    `No hay productos en esta categoría por ahora.`;

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:gap-6">
        <div className="flex min-w-0 flex-col gap-3">
          <div>
            <h2
              id={titleId}
              className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-[1.75rem]"
            >
              {section.title}
            </h2>
            <p className="mt-1 text-sm text-neutral-500 sm:mt-2 sm:text-[0.95rem]">
              {section.subtitle}
            </p>
          </div>

          <ProductConditionTabList
            idPrefix={section.id}
            activeCondition={activeCondition}
            onSelect={setActiveCondition}
            counts={tabCounts}
            ariaLabel={`Filtrar ${section.title} por condición`}
            className="w-full sm:w-fit"
          />
        </div>

        <Link
          to={categoryPathWithCondition(section.categoryPathSlug, activeCondition)}
          className="inline-flex shrink-0 items-center gap-1 self-start text-sm font-semibold text-red-600 transition-colors hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:pt-1"
        >
          Ver {section.title.toLowerCase()}
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        role="tabpanel"
        id={`${section.id}-panel-${activeCondition}`}
        aria-labelledby={`${section.id}-tab-${activeCondition}`}
      >
        {activeProducts.length > 0 ? (
          <ProductCarouselSection
            sectionId={`${section.id}-${activeCondition}`}
            title=""
            products={activeProducts}
            hideHeader
          />
        ) : (
          <p className="py-12 text-center text-sm text-neutral-500" role="status">
            {emptyMessage}
          </p>
        )}
      </div>
    </section>
  );
}

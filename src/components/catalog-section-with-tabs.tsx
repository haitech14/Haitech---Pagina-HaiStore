import { useMemo, useState } from 'react';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import { ProductConditionTabList } from '@/components/product-condition-tab-list';
import type { FeaturedProduct } from '@/data/featured-products';
import type { HomeCatalogSectionConfig } from '@/lib/home-catalog-sections';
import {
  getConditionsForCatalogFamily,
  type ProductCondition,
} from '@/lib/product-condition';

interface CatalogSectionWithTabsProps {
  section: HomeCatalogSectionConfig;
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>;
  /** Opcional: limitar las condiciones visibles (p. ej. sin «Partes»). */
  conditionsOverride?: readonly ProductCondition[];
}

function firstTabWithProducts(
  map: Record<ProductCondition, FeaturedProduct[]>,
  conditions: readonly ProductCondition[],
): ProductCondition {
  return conditions.find((key) => map[key].length > 0) ?? conditions[0] ?? 'originales';
}

const EMPTY_TAB_MESSAGES_BY_SECTION: Partial<
  Record<HomeCatalogSectionConfig['id'], Record<ProductCondition, string>>
> = {
  multifuncionales: {
    originales: 'Aún no hay multifuncionales nuevos en esta categoría.',
    compatibles: 'Aún no hay multifuncionales seminuevos en esta categoría.',
    remanufacturados: 'Aún no hay multifuncionales remanufacturados en esta categoría.',
    partes: 'Próximamente: partes para multifuncionales aquí.',
  },
  impresoras: {
    originales: 'Aún no hay impresoras nuevas en esta categoría.',
    compatibles: 'Aún no hay impresoras seminuevas en esta categoría.',
    remanufacturados: 'Aún no hay impresoras remanufacturadas en esta categoría.',
    partes: 'Próximamente: partes para impresoras aquí.',
  },
  'toner-suministros': {
    originales: 'Aún no hay tóner ni consumibles originales en esta categoría.',
    compatibles: 'Aún no hay tóner ni cartuchos compatibles en esta categoría.',
    remanufacturados: 'Aún no hay tóner remanufacturado o recargas en esta categoría.',
    partes: 'Aún no hay partes de consumibles en esta categoría.',
  },
  repuestos: {
    originales: 'Aún no hay repuestos originales en esta categoría.',
    compatibles: 'Aún no hay repuestos compatibles en esta categoría.',
    remanufacturados: 'Aún no hay repuestos remanufacturados en esta categoría.',
    partes: 'Aún no hay partes y componentes en esta categoría.',
  },
};

export function CatalogSectionWithTabs({
  section,
  productsByCondition,
  conditionsOverride,
}: CatalogSectionWithTabsProps) {
  const sectionConditions = useMemo(
    () => conditionsOverride ?? getConditionsForCatalogFamily(section.id),
    [conditionsOverride, section.id],
  );

  const [activeCondition, setActiveCondition] = useState<ProductCondition>(() =>
    firstTabWithProducts(productsByCondition, sectionConditions),
  );

  const activeProducts = productsByCondition[activeCondition];
  const tabCounts = useMemo(
    () =>
      Object.fromEntries(
        sectionConditions.map((key) => [key, productsByCondition[key].length]),
      ) as Record<ProductCondition, number>,
    [productsByCondition, sectionConditions],
  );

  const titleId = `${section.id}-titulo`;
  const emptyMessage =
    EMPTY_TAB_MESSAGES_BY_SECTION[section.id]?.[activeCondition] ??
    `No hay productos en esta categoría por ahora.`;

  return (
    <section aria-labelledby={titleId}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h2
          id={titleId}
          className="text-balance text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl"
        >
          {section.title}
        </h2>

        <ProductConditionTabList
          idPrefix={section.id}
          activeCondition={activeCondition}
          onSelect={setActiveCondition}
          counts={tabCounts}
          catalogFamily={section.id}
          conditions={sectionConditions}
          ariaLabel={`Filtrar ${section.title} por condición`}
          className="w-full sm:w-auto"
        />
      </div>

      {section.subtitle ? (
        <p className="mb-5 text-sm text-neutral-500 sm:mb-6 sm:text-[0.95rem]">{section.subtitle}</p>
      ) : null}

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

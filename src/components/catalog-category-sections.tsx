import { Fragment, useMemo } from 'react';

import { CatalogSectionWithTabs } from '@/components/catalog-section-with-tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomeCatalogSections } from '@/hooks/use-home-catalog-sections';
import {
  HOME_CATALOG_SECTIONS,
  type HomeCatalogSectionConfig,
} from '@/lib/home-catalog-sections';
import {
  getConditionsForCatalogFamily,
  type ProductCondition,
} from '@/lib/product-condition';
import type { FeaturedProduct } from '@/data/featured-products';

interface CatalogCategorySectionsProps {
  sectionsConfig?: HomeCatalogSectionConfig[];
  limit?: number;
}

function sectionHasProducts(
  section: HomeCatalogSectionConfig,
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>,
): boolean {
  const conditions = getConditionsForCatalogFamily(section.id);
  return conditions.some((condition) => productsByCondition[condition]?.length > 0);
}

function CatalogSectionSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-4 w-72 max-w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-full" />
        <Skeleton className="h-9 w-28 rounded-full" />
        <Skeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function CatalogCategorySections({
  sectionsConfig = HOME_CATALOG_SECTIONS,
  limit = 10,
}: CatalogCategorySectionsProps) {
  const sectionIds = useMemo(
    () => sectionsConfig.map((section) => section.id),
    [sectionsConfig],
  );

  const { data, isLoading, isError } = useHomeCatalogSections(sectionIds, limit);

  const sections = useMemo(() => {
    const apiSections = data?.sections ?? [];
    const byId = new Map(apiSections.map((entry) => [entry.id, entry.productsByCondition]));

    return sectionsConfig
      .map((section) => {
        const productsByCondition = byId.get(section.id);
        if (!productsByCondition) return null;
        return { section, productsByCondition };
      })
      .filter(
        (entry): entry is NonNullable<typeof entry> =>
          entry != null && sectionHasProducts(entry.section, entry.productsByCondition),
      );
  }, [data?.sections, sectionsConfig]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-14 sm:gap-16">
        {sectionsConfig.map((section) => (
          <CatalogSectionSkeleton key={section.id} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-destructive">
        No se pudieron cargar los productos de esta sección. Inténtalo de nuevo más tarde.
      </p>
    );
  }

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      {sections.map(({ section, productsByCondition }) => (
        <Fragment key={section.id}>
          <CatalogSectionWithTabs section={section} productsByCondition={productsByCondition} />
        </Fragment>
      ))}
    </div>
  );
}

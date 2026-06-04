import { Fragment, useMemo } from 'react';

import { CatalogSectionWithTabs } from '@/components/catalog-section-with-tabs';
import { PromotionsHeroBanner } from '@/components/promotions-hero-banner';
import { useProducts } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { collectInventoryLabels, findStoreCategoryBySlug } from '@/lib/store-category-display';
import {
  HOME_CATALOG_SECTIONS,
  type HomeCatalogSectionConfig,
  resolveHomeSectionInventoryLabels,
} from '@/lib/home-catalog-sections';
import {
  PRODUCT_CONDITIONS,
  type ProductCondition,
} from '@/lib/product-condition';
import type { FeaturedProduct } from '@/data/featured-products';
import { filterStoreProductsForHomeSection } from '@/lib/store-products';
import type { Product } from '@/types/product';
import type { StoreCategoryTreeNode } from '@/types/store-category';

interface CatalogCategorySectionsProps {
  sectionsConfig?: HomeCatalogSectionConfig[];
}

function sectionHasProducts(
  productsByCondition: Record<ProductCondition, FeaturedProduct[]>,
): boolean {
  return PRODUCT_CONDITIONS.some((condition) => productsByCondition[condition].length > 0);
}

function buildSectionData(
  sectionsConfig: HomeCatalogSectionConfig[],
  storeProducts: Product[] | undefined,
  categoryTree: StoreCategoryTreeNode[],
) {
  const products = storeProducts ?? [];

  return sectionsConfig
    .map((section) => {
    const treeLabels = section.inventoryCategorySlugs.flatMap((slug) => {
      const storeCategory = findStoreCategoryBySlug(categoryTree ?? [], slug);
      return storeCategory ? collectInventoryLabels(storeCategory) : [];
    });
    const staticLabels = resolveHomeSectionInventoryLabels(section);
    const categoryLabels = [...new Set([...staticLabels, ...treeLabels])];

    const productsByCondition = PRODUCT_CONDITIONS.reduce(
      (acc, condition) => {
        acc[condition] = filterStoreProductsForHomeSection(
          products,
          section.id,
          categoryLabels,
          condition,
        );
        return acc;
      },
      {} as Record<ProductCondition, ReturnType<typeof filterStoreProductsForHomeSection>>,
    );

      return { section, productsByCondition };
    })
    .filter(({ productsByCondition }) => sectionHasProducts(productsByCondition));
}

export function CatalogCategorySections({
  sectionsConfig = HOME_CATALOG_SECTIONS,
}: CatalogCategorySectionsProps) {
  const { data: storeProducts, isLoading, isError } = useProducts();
  const { data: categoryTree = [] } = useStoreCategoriesTree();

  const sections = useMemo(
    () => buildSectionData(sectionsConfig, storeProducts, categoryTree),
    [sectionsConfig, storeProducts, categoryTree],
  );

  if (isLoading || isError || !storeProducts?.length || sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      {sections.map(({ section, productsByCondition }) => (
        <Fragment key={section.id}>
          {section.id === 'multifuncionales' ? <PromotionsHeroBanner embedded /> : null}
          <CatalogSectionWithTabs section={section} productsByCondition={productsByCondition} />
        </Fragment>
      ))}
    </div>
  );
}

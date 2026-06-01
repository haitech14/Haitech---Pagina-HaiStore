import { useMemo } from 'react';

import { ProductCarouselSection } from '@/components/product-carousel-section';
import { categories } from '@/data/categories';
import { useProducts } from '@/hooks/use-products';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { getCatalogFeaturedByCategories } from '@/lib/catalog-featured';
import { getCategoryProductLabels } from '@/lib/category-product-labels';
import { categoryPath } from '@/lib/category-path';
import { collectInventoryLabels, findStoreCategoryBySlug } from '@/lib/store-category-display';
import { filterStoreProductsByCategories } from '@/lib/store-products';

const HOME_CATEGORY_SLUGS = ['multifuncionales', 'impresoras', 'toner-suministros'] as const;

export function CatalogCategorySections() {
  const { data: storeProducts } = useProducts();
  const { data: categoryTree = [] } = useStoreCategoriesTree();

  const sections = useMemo(() => {
    return HOME_CATEGORY_SLUGS.map((slug) => {
      const category = categories.find((entry) => entry.slug === slug);
      if (!category) return null;

      const storeCategory = findStoreCategoryBySlug(categoryTree, slug);
      const treeLabels = storeCategory ? collectInventoryLabels(storeCategory) : [];
      const staticLabels = getCategoryProductLabels(category);
      const labels = [...new Set([...staticLabels, ...treeLabels])];
      const fromStore = storeProducts
        ? filterStoreProductsByCategories(storeProducts, labels, 10)
        : undefined;
      const products =
        fromStore !== undefined
          ? fromStore
          : getCatalogFeaturedByCategories(labels, 10);

      return {
        id: slug,
        title: category.name,
        subtitle: category.tagline,
        products,
        viewAllHref: categoryPath(slug),
        viewAllLabel: `Ver ${category.name.toLowerCase()}`,
      };
    }).filter((section): section is NonNullable<typeof section> => section != null);
  }, [storeProducts, categoryTree]);

  const visible = sections.filter((section) => section.products.length > 0);

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-14 sm:gap-16">
      {visible.map((section) => (
        <ProductCarouselSection
          key={section.id}
          sectionId={section.id}
          title={section.title}
          subtitle={section.subtitle}
          products={section.products}
          viewAllHref={section.viewAllHref}
          viewAllLabel={section.viewAllLabel}
        />
      ))}
    </div>
  );
}

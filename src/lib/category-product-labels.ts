import { categories, type Category } from '@/data/categories';

export function getCategoryProductLabels(category: Category): readonly string[] {
  if (category.inventoryCategories?.length) {
    return category.inventoryCategories;
  }
  return [category.name];
}

export function findCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

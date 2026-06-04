import type { ServiceCategory, ServicePriceItem } from '@/types/service';

export type ServiceCategoryWithOrder = ServiceCategory & { sortOrder?: number };

export interface ServiceCategoryTreeNode {
  category: ServiceCategoryWithOrder;
  subcategories: ServicePriceItem[];
}

/** Código visible de categoría (id o sort_order como respaldo). */
export function serviceCategoryCode(category: ServiceCategoryWithOrder): string {
  return category.id;
}

export function compareServiceCategoryByCode(
  a: ServiceCategoryWithOrder,
  b: ServiceCategoryWithOrder,
): number {
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
  if (orderA !== orderB) return orderA - orderB;
  return a.id.localeCompare(b.id, 'es', { sensitivity: 'base' });
}

export function compareServicePriceItemByCode(a: ServicePriceItem, b: ServicePriceItem): number {
  return a.code.localeCompare(b.code, 'es', { numeric: true, sensitivity: 'base' });
}

export function buildServiceCategoryTree(
  categories: ServiceCategoryWithOrder[],
  priceItems: ServicePriceItem[],
): ServiceCategoryTreeNode[] {
  return [...categories]
    .sort(compareServiceCategoryByCode)
    .map((category) => ({
      category,
      subcategories: priceItems
        .filter((item) => item.categoryId === category.id)
        .sort(compareServicePriceItemByCode),
    }));
}

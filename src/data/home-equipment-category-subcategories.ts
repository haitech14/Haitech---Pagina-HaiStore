import type {
  HomeFeaturedEquipmentCategoryFilterId,
  HomeFeaturedEquipmentConditionFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import { HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS } from '@/lib/home-equipment-category-links';
import { categoryPath } from '@/lib/category-path';

export type HomeEquipmentSubcategoryId = HomeFeaturedEquipmentConditionFilterId;

export type HomeEquipmentSubcategory = {
  id: HomeEquipmentSubcategoryId;
  label: string;
  /** Enlace opcional a la subcategoría en tienda. */
  href?: string;
};

const CONDITION_SUBCATEGORY_LABELS: Record<HomeFeaturedEquipmentConditionFilterId, string> = {
  nuevas: 'Nuevas',
  seminuevas: 'Seminuevas',
  remanufacturadas: 'Remanufacturadas',
};

const MULTIFUNCIONALES_CONDITION_SLUGS: Record<HomeFeaturedEquipmentConditionFilterId, string> = {
  nuevas: 'multifuncionales-nuevas',
  seminuevas: 'multifuncionales-seminuevas',
  remanufacturadas: 'multifuncionales-remanufacturadas',
};

const IMPRESORAS_CONDITION_SLUGS: Record<HomeFeaturedEquipmentConditionFilterId, string> = {
  nuevas: 'impresoras-laser-nuevas',
  seminuevas: 'impresoras-laser-seminuevas',
  remanufacturadas: 'impresoras-laser-remanufacturadas',
};

function buildConditionSubcategories(
  categorySlug: string,
  slugByCondition: Record<HomeFeaturedEquipmentConditionFilterId, string>,
): HomeEquipmentSubcategory[] {
  const conditions: HomeFeaturedEquipmentConditionFilterId[] = [
    'nuevas',
    'seminuevas',
    'remanufacturadas',
  ];

  return conditions.map((condition) => ({
    id: condition,
    label: CONDITION_SUBCATEGORY_LABELS[condition],
    href: categoryPath(categorySlug, slugByCondition[condition]),
  }));
}

export const HOME_EQUIPMENT_SUBCATEGORIES_BY_CATEGORY: Partial<
  Record<HomeFeaturedEquipmentCategoryFilterId, HomeEquipmentSubcategory[]>
> = {
  multifuncionales: buildConditionSubcategories(
    HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS.multifuncionales,
    MULTIFUNCIONALES_CONDITION_SLUGS,
  ),
  'impresora-laser': buildConditionSubcategories(
    HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS['impresora-laser'],
    IMPRESORAS_CONDITION_SLUGS,
  ),
};

export const HOME_EQUIPMENT_DEFAULT_SUBCATEGORY: HomeEquipmentSubcategoryId = 'nuevas';

export function getHomeEquipmentSubcategories(
  categoryId: HomeFeaturedEquipmentCategoryFilterId,
): HomeEquipmentSubcategory[] {
  return HOME_EQUIPMENT_SUBCATEGORIES_BY_CATEGORY[categoryId] ?? [];
}

export function homeEquipmentSubcategoriesVisible(
  categoryId: HomeFeaturedEquipmentCategoryFilterId,
): boolean {
  return getHomeEquipmentSubcategories(categoryId).length > 1;
}

import { Cylinder, type LucideIcon } from 'lucide-react';

import { resolveHomeConsumablesCategoryImage } from '@/data/home-consumables-category-images';
import { resolveHomeEquipmentCategoryImage } from '@/data/home-equipment-category-images';
import type {
  HomeFindConsumablesCategoryId,
  HomeFindEquipmentCategoryId,
  HomeFindSparePartsCategoryId,
} from '@/data/home-find-what-you-need';
import type { HomeFeaturedConsumablesCategoryFilterId } from '@/data/home-featured-quick-filters-consumables';

export function resolveHomeFindEquipmentCategoryImage(
  categoryId: HomeFindEquipmentCategoryId,
): string {
  return resolveHomeEquipmentCategoryImage(categoryId);
}

export function resolveHomeFindConsumablesCategoryImage(
  categoryId: HomeFindConsumablesCategoryId,
): string {
  return resolveHomeConsumablesCategoryImage(categoryId);
}

const SPARE_PARTS_CONSUMABLES_IMAGE_MAP: Partial<
  Record<HomeFindSparePartsCategoryId, HomeFeaturedConsumablesCategoryFilterId>
> = {
  'kit-mantenimiento': 'unidad-imagen-kit-mantenimiento',
  fusoras: 'unidad-fusora',
  tarjetas: 'tarjetas',
  'unidades-imagen': 'unidad-imagen-kit-mantenimiento',
};

export function resolveHomeFindSparePartsCategoryImage(
  categoryId: HomeFindSparePartsCategoryId,
): string | undefined {
  const consumableId = SPARE_PARTS_CONSUMABLES_IMAGE_MAP[categoryId];
  if (!consumableId) return undefined;
  return resolveHomeConsumablesCategoryImage(consumableId);
}

export function resolveHomeFindSparePartsCategoryIcon(
  categoryId: HomeFindSparePartsCategoryId,
): LucideIcon | undefined {
  if (categoryId === 'rodillos') return Cylinder;
  return undefined;
}

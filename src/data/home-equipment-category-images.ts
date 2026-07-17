import type { HomeFeaturedEquipmentCategoryFilterId } from '@/data/home-featured-quick-filters-equipment';

const EQUIPMENT_CHIP_IMAGE_BASE = '/home/category-chips/equipment';

export const HOME_EQUIPMENT_CATEGORY_IMAGES: Record<
  HomeFeaturedEquipmentCategoryFilterId,
  string
> = {
  multifuncionales: `${EQUIPMENT_CHIP_IMAGE_BASE}/multifuncionales.webp`,
  'impresora-laser': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-laser.webp`,
  'impresora-tinta': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-tinta.webp`,
  'impresora-termica': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-termica.webp`,
  'impresora-matricial': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-matricial.webp`,
  escaneres: `${EQUIPMENT_CHIP_IMAGE_BASE}/escaneres.webp`,
  plotter: `${EQUIPMENT_CHIP_IMAGE_BASE}/plotter.webp`,
  'multifuncional-planos': `${EQUIPMENT_CHIP_IMAGE_BASE}/multifuncional-planos.webp`,
  'pantallas-interactivas': `${EQUIPMENT_CHIP_IMAGE_BASE}/pantallas-interactivas.webp`,
  videoconferencia: `${EQUIPMENT_CHIP_IMAGE_BASE}/videoconferencia.webp`,
  laptops: `${EQUIPMENT_CHIP_IMAGE_BASE}/laptops.webp`,
  accesorios: `${EQUIPMENT_CHIP_IMAGE_BASE}/accesorios.webp`,
};

export function resolveHomeEquipmentCategoryImage(
  filterId: HomeFeaturedEquipmentCategoryFilterId,
): string {
  return HOME_EQUIPMENT_CATEGORY_IMAGES[filterId];
}

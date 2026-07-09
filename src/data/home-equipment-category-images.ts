import type { HomeFeaturedEquipmentCategoryFilterId } from '@/data/home-featured-quick-filters-equipment';

const EQUIPMENT_CHIP_IMAGE_BASE = '/home/category-chips/equipment';

export const HOME_EQUIPMENT_CATEGORY_IMAGES: Record<
  HomeFeaturedEquipmentCategoryFilterId,
  string
> = {
  multifuncionales: `${EQUIPMENT_CHIP_IMAGE_BASE}/multifuncionales.png`,
  'impresora-laser': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-laser.png`,
  'impresora-tinta': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-tinta.png`,
  'impresora-termica': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-termica.png`,
  'impresora-matricial': `${EQUIPMENT_CHIP_IMAGE_BASE}/impresora-matricial.png`,
  escaneres: `${EQUIPMENT_CHIP_IMAGE_BASE}/escaneres.png`,
  plotter: `${EQUIPMENT_CHIP_IMAGE_BASE}/plotter.png`,
  'multifuncional-planos': `${EQUIPMENT_CHIP_IMAGE_BASE}/multifuncional-planos.png`,
  'pantallas-interactivas': `${EQUIPMENT_CHIP_IMAGE_BASE}/pantallas-interactivas.png`,
  videoconferencia: `${EQUIPMENT_CHIP_IMAGE_BASE}/videoconferencia.png`,
  laptops: `${EQUIPMENT_CHIP_IMAGE_BASE}/laptops.png`,
  accesorios: `${EQUIPMENT_CHIP_IMAGE_BASE}/accesorios.png`,
};

export function resolveHomeEquipmentCategoryImage(
  filterId: HomeFeaturedEquipmentCategoryFilterId,
): string {
  return HOME_EQUIPMENT_CATEGORY_IMAGES[filterId];
}

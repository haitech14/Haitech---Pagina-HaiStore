import type { HomeFeaturedEquipmentCategoryFilterId } from '@/data/home-featured-quick-filters-equipment';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';

/** Slugs de tienda asociados a cada chip de equipos (filtros rápidos del home). */
export const HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS: Record<
  HomeFeaturedEquipmentCategoryFilterId,
  string
> = {
  multifuncionales: 'multifuncionales',
  'impresora-laser': 'impresoras',
  'impresora-tinta': 'impresoras',
  'impresora-termica': 'impresoras',
  'impresora-matricial': 'impresoras',
  escaneres: 'escaneres',
  plotter: 'formato-ancho',
  'multifuncional-planos': 'formato-ancho',
  'pantallas-interactivas': 'soluciones-colaboracion',
  videoconferencia: 'equipamiento-videoconferencias',
  laptops: 'computadoras-laptop',
  accesorios: 'accesorios',
};

export function homeEquipmentCategoryLandingPath(
  filterId: HomeFeaturedEquipmentCategoryFilterId,
): string {
  if (filterId === 'impresora-termica') {
    return categoryPath('impresoras', 'impresoras-termicas');
  }
  return categoryLandingPath(HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS[filterId]);
}

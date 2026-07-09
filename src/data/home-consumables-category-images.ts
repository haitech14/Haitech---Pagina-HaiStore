import type { HomeFeaturedConsumablesCategoryFilterId } from '@/data/home-featured-quick-filters-consumables';

const CONSUMABLES_CHIP_IMAGE_BASE = '/home/category-chips/consumables';

export const HOME_CONSUMABLES_CATEGORY_IMAGES: Record<
  HomeFeaturedConsumablesCategoryFilterId,
  string
> = {
  toner: `${CONSUMABLES_CHIP_IMAGE_BASE}/toner.png`,
  'repuestos-cat': `${CONSUMABLES_CHIP_IMAGE_BASE}/repuestos.png`,
  tintas: `${CONSUMABLES_CHIP_IMAGE_BASE}/tintas.png`,
  'unidad-imagen-kit-mantenimiento': `${CONSUMABLES_CHIP_IMAGE_BASE}/unidad-imagen-kit-mantenimiento.png`,
  'unidad-fusora': `${CONSUMABLES_CHIP_IMAGE_BASE}/unidad-fusora.png`,
  'unidad-transferencia': `${CONSUMABLES_CHIP_IMAGE_BASE}/unidad-transferencia.png`,
  tarjetas: `${CONSUMABLES_CHIP_IMAGE_BASE}/tarjetas.png`,
};

export function resolveHomeConsumablesCategoryImage(
  filterId: HomeFeaturedConsumablesCategoryFilterId,
): string {
  return HOME_CONSUMABLES_CATEGORY_IMAGES[filterId];
}

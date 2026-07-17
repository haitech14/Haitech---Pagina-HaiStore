import type { HomeFeaturedConsumablesCategoryFilterId } from '@/data/home-featured-quick-filters-consumables';

const CONSUMABLES_CHIP_IMAGE_BASE = '/home/category-chips/consumables';

export const HOME_CONSUMABLES_CATEGORY_IMAGES: Record<
  HomeFeaturedConsumablesCategoryFilterId,
  string
> = {
  toner: `${CONSUMABLES_CHIP_IMAGE_BASE}/toner.webp`,
  'repuestos-cat': `${CONSUMABLES_CHIP_IMAGE_BASE}/repuestos.webp`,
  tintas: `${CONSUMABLES_CHIP_IMAGE_BASE}/tintas.webp`,
  'unidad-imagen-kit-mantenimiento': `${CONSUMABLES_CHIP_IMAGE_BASE}/unidad-imagen-kit-mantenimiento.webp`,
  'unidad-fusora': `${CONSUMABLES_CHIP_IMAGE_BASE}/unidad-fusora.webp`,
  'unidad-transferencia': `${CONSUMABLES_CHIP_IMAGE_BASE}/unidad-transferencia.webp`,
  tarjetas: `${CONSUMABLES_CHIP_IMAGE_BASE}/tarjetas.webp`,
};

export function resolveHomeConsumablesCategoryImage(
  filterId: HomeFeaturedConsumablesCategoryFilterId,
): string {
  return HOME_CONSUMABLES_CATEGORY_IMAGES[filterId];
}

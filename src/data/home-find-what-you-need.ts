import type { HomeFeaturedConsumablesCategoryFilterId } from '@/data/home-featured-quick-filters-consumables';
import type { HomeFeaturedEquipmentCategoryFilterId } from '@/data/home-featured-quick-filters-equipment';
import { categoryLandingPath } from '@/lib/category-path';

export type HomeFindMainTabId = 'equipos' | 'consumibles' | 'repuestos';

export type HomeFindEquipmentCategoryId = Extract<
  HomeFeaturedEquipmentCategoryFilterId,
  'multifuncionales' | 'escaneres' | 'plotter' | 'pantallas-interactivas' | 'videoconferencia'
>;

export type HomeFindConsumablesCategoryId = Extract<
  HomeFeaturedConsumablesCategoryFilterId,
  'toner' | 'tintas'
>;

export type HomeFindSparePartsCategoryId =
  | 'kit-mantenimiento'
  | 'unidades-imagen'
  | 'fusoras'
  | 'transferencia'
  | 'tarjetas'
  | 'rodillos';

export type HomeFindSparePartsFilterId = 'originales' | 'compatibles' | 'disponibles' | 'a-pedido';

export const HOME_FIND_SECTION_TITLE = 'Encuentra lo que necesitas';

export const HOME_FIND_MAIN_TABS: ReadonlyArray<{ id: HomeFindMainTabId; label: string }> = [
  { id: 'equipos', label: 'Equipos' },
  { id: 'consumibles', label: 'Tóner y consumibles' },
  { id: 'repuestos', label: 'Repuestos' },
];

export const HOME_FIND_EQUIPMENT_CATEGORIES: ReadonlyArray<{
  id: HomeFindEquipmentCategoryId;
  label: string;
}> = [
  { id: 'multifuncionales', label: 'Multifuncionales' },
  { id: 'escaneres', label: 'Escáneres' },
  { id: 'plotter', label: 'Plotter' },
  { id: 'pantallas-interactivas', label: 'Pantallas' },
  { id: 'videoconferencia', label: 'Videoconferencia' },
];

export const HOME_FIND_CONSUMABLES_CATEGORIES: ReadonlyArray<{
  id: HomeFindConsumablesCategoryId;
  label: string;
}> = [
  { id: 'toner', label: 'Tóner' },
  { id: 'tintas', label: 'Tintas' },
];

export const HOME_FIND_SPARE_PARTS_CATEGORIES: ReadonlyArray<{
  id: HomeFindSparePartsCategoryId;
  label: string;
}> = [
  { id: 'kit-mantenimiento', label: 'Kits de mantenimiento' },
  { id: 'unidades-imagen', label: 'Unidades de imagen' },
  { id: 'fusoras', label: 'Fusoras' },
  { id: 'transferencia', label: 'Transferencia' },
  { id: 'tarjetas', label: 'Tarjetas' },
  { id: 'rodillos', label: 'Rodillos' },
];

export const HOME_FIND_CATALOG_LINKS: Record<
  HomeFindMainTabId,
  { href: string; label: string; allCategoriesHref: string }
> = {
  equipos: {
    href: '/tienda',
    label: 'Ver todos los equipos',
    allCategoriesHref: '/tienda',
  },
  consumibles: {
    href: categoryLandingPath('toner-suministros'),
    label: 'Ver todos los consumibles',
    allCategoriesHref: categoryLandingPath('toner-suministros'),
  },
  repuestos: {
    href: categoryLandingPath('repuestos'),
    label: 'Ver todos los repuestos',
    allCategoriesHref: categoryLandingPath('repuestos'),
  },
};

export const HOME_FIND_DEFAULT_TAB: HomeFindMainTabId = 'equipos';

export const HOME_FIND_VISIBLE_CATEGORY_LIMIT = 6;

export const HOME_FIND_PRODUCT_DISPLAY_LIMIT = 5;

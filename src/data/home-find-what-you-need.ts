import type { HomeFeaturedConsumablesCategoryFilterId } from '@/data/home-featured-quick-filters-consumables';
import {
  HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS,
  type HomeFeaturedEquipmentCategoryFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import { categoryLandingPath } from '@/lib/category-path';

export type HomeFindMainTabId = 'equipos' | 'consumibles' | 'repuestos';

export type HomeFindEquipmentCategoryId = HomeFeaturedEquipmentCategoryFilterId;

export type HomeFindConsumablesCategoryId = Extract<
  HomeFeaturedConsumablesCategoryFilterId,
  'toner' | 'tintas'
>;

export type HomeFindSparePartsCategoryId =
  | 'kits-unidades-imagen'
  | 'fusoras'
  | 'transferencia'
  | 'tarjetas'
  | 'rodillos';

export type HomeFindSparePartsFilterId = 'originales' | 'compatibles';

export const HOME_FIND_SECTION_TITLE = 'Explora nuestras categorías';

export const HOME_FIND_MAIN_TABS: ReadonlyArray<{ id: HomeFindMainTabId; label: string }> = [
  { id: 'equipos', label: 'Equipos' },
  { id: 'consumibles', label: 'Tóner y consumibles' },
  { id: 'repuestos', label: 'Repuestos' },
];

const HOME_FIND_EQUIPMENT_CATEGORY_LABEL_OVERRIDES: Partial<
  Record<HomeFindEquipmentCategoryId, string>
> = {
  multifuncionales: 'Impresora Multifuncional Láser',
  'pantallas-interactivas': 'Pantallas',
};

export const HOME_FIND_EQUIPMENT_CATEGORIES: ReadonlyArray<{
  id: HomeFindEquipmentCategoryId;
  label: string;
}> = HOME_FEATURED_EQUIPMENT_CATEGORY_FILTERS.map((filter) => ({
  id: filter.id,
  label: HOME_FIND_EQUIPMENT_CATEGORY_LABEL_OVERRIDES[filter.id] ?? filter.label,
}));

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
  { id: 'kits-unidades-imagen', label: 'Kits y unidades de imagen' },
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

/** Banners hero (fila) que sustituyen las pestañas Equipos / Tóner / Repuestos. */
export const HOME_FIND_CATEGORY_HERO_BANNERS: ReadonlyArray<{
  id: HomeFindMainTabId;
  label: string;
  imageSrc: string;
  imageAlt: string;
  href: string;
}> = [
  {
    id: 'equipos',
    label: 'Equipos',
    imageSrc: '/home/category-hero-banners/equipos.webp',
    imageAlt: 'Equipos — Soluciones de impresión para tu negocio. Ver catálogo.',
    href: HOME_FIND_CATALOG_LINKS.equipos.href,
  },
  {
    id: 'consumibles',
    label: 'Tóner y consumibles',
    imageSrc: '/home/category-hero-banners/toner-consumibles.webp',
    imageAlt: 'Tóner y consumibles — Consumibles de impresión de alta calidad. Ver catálogo.',
    href: HOME_FIND_CATALOG_LINKS.consumibles.href,
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    imageSrc: '/home/category-hero-banners/repuestos.webp',
    imageAlt: 'Repuestos — Piezas y componentes para tus equipos. Ver catálogo.',
    href: HOME_FIND_CATALOG_LINKS.repuestos.href,
  },
];

export const HOME_FIND_DEFAULT_TAB: HomeFindMainTabId = 'equipos';

export const HOME_FIND_VISIBLE_CATEGORY_LIMIT = 5;

/** Varias páginas de 5 productos visibles en desktop (carrusel + bullets). */
export const HOME_FIND_PRODUCT_DISPLAY_LIMIT = 15;

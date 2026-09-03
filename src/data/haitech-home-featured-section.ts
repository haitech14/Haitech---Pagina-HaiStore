import { storeShowcasePath } from '@/lib/store-showcase-path';
import type { HaitechShopProductTabId } from '@/data/haitech-home-shop';

const CHIP = '/home/category-chips/equipment';

export type HaitechHomeFeaturedCategoryChipId =
  | 'multifuncionales'
  | 'impresoras'
  | 'toner'
  | 'repuestos'
  | 'formato-ancho'
  | 'laptops'
  | 'escaneres'
  | 'accesorios'
  | 'software'
  | 'monitores'
  | 'pantallas-interactivas'
  | 'videoconferencia';

export type HaitechHomeFeaturedCategoryChip = {
  id: HaitechHomeFeaturedCategoryChipId;
  label: string;
  image: string;
  href: string;
  /** Productos fijos (orden del mockup). */
  fixedProductIds?: readonly string[];
  /** Filtro por tab en HAITECH_SHOP_FAVORITE_PRODUCTS. */
  tabId?: HaitechShopProductTabId;
};

/** Chips de categoría sobre «Productos Destacados» (mockup home). */
export const HAITECH_HOME_FEATURED_CATEGORY_CHIPS: readonly HaitechHomeFeaturedCategoryChip[] = [
  {
    id: 'multifuncionales',
    label: 'Multifuncionales',
    image: `${CHIP}/multifuncionales.webp`,
    href: storeShowcasePath({ categoryId: 'multifuncionales' }),
    fixedProductIds: ['m-320f', 'im-430f', 'mp-305-plus', 'im-460f'],
  },
  {
    id: 'impresoras',
    label: 'Impresoras',
    image: '/categories/impresoras.png',
    href: storeShowcasePath({ categoryId: 'impresoras' }),
  },
  {
    id: 'toner',
    label: 'Toner',
    image: '/categories/toner-suministros.png',
    href: storeShowcasePath({ categoryId: 'toner' }),
    tabId: 'toner',
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    image: '/categories/repuestos.png',
    href: storeShowcasePath({ categoryId: 'repuestos' }),
  },
  {
    id: 'formato-ancho',
    label: 'Formato Ancho',
    image: '/categories/formato-ancho.png',
    href: storeShowcasePath({ categoryId: 'formato-ancho' }),
  },
  {
    id: 'laptops',
    label: 'PC / Laptops',
    image: `${CHIP}/laptops.webp`,
    href: storeShowcasePath({ categoryId: 'laptops' }),
  },
  {
    id: 'escaneres',
    label: 'Escáneres',
    image: `${CHIP}/escaneres.webp`,
    href: storeShowcasePath({ categoryId: 'escaneres' }),
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    image: `${CHIP}/accesorios.webp`,
    href: storeShowcasePath({ categoryId: 'accesorios' }),
  },
  {
    id: 'software',
    label: 'Software',
    image: '/categories/software.png',
    href: storeShowcasePath({ categoryId: 'software' }),
  },
  {
    id: 'monitores',
    label: 'Monitores',
    image: '/categories/monitores.png',
    href: storeShowcasePath({ categoryId: 'monitores' }),
  },
  {
    id: 'pantallas-interactivas',
    label: 'Pantallas Interactivas',
    image: `${CHIP}/pantallas-interactivas.webp`,
    href: storeShowcasePath({ categoryId: 'pantallas-interactivas' }),
  },
  {
    id: 'videoconferencia',
    label: 'Videoconferencia',
    image: `${CHIP}/videoconferencia.webp`,
    href: storeShowcasePath({ categoryId: 'videoconferencia' }),
  },
] as const;

export const HAITECH_HOME_FEATURED_DEFAULT_CHIP: HaitechHomeFeaturedCategoryChipId =
  'multifuncionales';

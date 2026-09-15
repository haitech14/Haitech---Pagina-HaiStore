import { storeShowcasePath } from '@/lib/store-showcase-path';
import type { HaitechShopProductTabId } from '@/data/haitech-home-shop';

const CHIP = '/home/category-circles';

export type HaitechHomeFeaturedCategoryChipId =
  | 'multifuncionales'
  | 'impresoras'
  | 'toner'
  | 'repuestos'
  | 'formato-ancho'
  | 'laptops'
  | 'escaneres'
  | 'accesorios'
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
    image: `${CHIP}/cat-multifuncionales.png`,
    href: storeShowcasePath({ categoryId: 'multifuncionales' }),
    fixedProductIds: ['m-320f', 'im-430f', 'mp-305-plus', 'im-460f'],
  },
  {
    id: 'impresoras',
    label: 'Impresoras',
    image: `${CHIP}/cat-impresoras.png`,
    href: storeShowcasePath({ categoryId: 'impresoras' }),
  },
  {
    id: 'toner',
    label: 'Toner',
    image: `${CHIP}/cat-toner.png`,
    href: storeShowcasePath({ categoryId: 'toner' }),
    tabId: 'toner',
  },
  {
    id: 'repuestos',
    label: 'Repuestos',
    image: `${CHIP}/cat-repuestos.png`,
    href: storeShowcasePath({ categoryId: 'repuestos' }),
  },
  {
    id: 'formato-ancho',
    label: 'Formato Ancho',
    image: `${CHIP}/cat-formato-ancho.png`,
    href: storeShowcasePath({ categoryId: 'formato-ancho' }),
  },
  {
    id: 'laptops',
    label: 'PC / Laptops',
    image: `${CHIP}/cat-laptops.png`,
    href: storeShowcasePath({ categoryId: 'laptops' }),
  },
  {
    id: 'escaneres',
    label: 'Escáneres',
    image: `${CHIP}/cat-escaneres.png`,
    href: storeShowcasePath({ categoryId: 'escaneres' }),
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    image: `${CHIP}/cat-accesorios.png`,
    href: storeShowcasePath({ categoryId: 'accesorios' }),
  },
  {
    id: 'monitores',
    label: 'Monitores',
    image: `${CHIP}/cat-monitores.png`,
    href: storeShowcasePath({ categoryId: 'monitores' }),
  },
  {
    id: 'pantallas-interactivas',
    label: 'Pantallas Interactivas',
    image: `${CHIP}/cat-pantallas-interactivas.png`,
    href: storeShowcasePath({ categoryId: 'pantallas-interactivas' }),
  },
  {
    id: 'videoconferencia',
    label: 'Videoconferencia',
    image: `${CHIP}/cat-videoconferencia.png`,
    href: storeShowcasePath({ categoryId: 'videoconferencia' }),
  },
] as const;

export const HAITECH_HOME_FEATURED_DEFAULT_CHIP: HaitechHomeFeaturedCategoryChipId =
  'multifuncionales';

import { categoryLandingPath } from '@/lib/category-path';
import { storeShowcasePath } from '@/lib/store-showcase-path';
import type { HaitechShopProductTabId } from '@/data/haitech-home-shop';

const CHIP = '/home/category-chips/equipment';

export type HaitechHomeFeaturedCategoryChipId =
  | 'multifuncionales'
  | 'impresoras'
  | 'toner'
  | 'repuestos'
  | 'formato-ancho';

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
] as const;

export const HAITECH_HOME_FEATURED_DEFAULT_CHIP: HaitechHomeFeaturedCategoryChipId =
  'multifuncionales';

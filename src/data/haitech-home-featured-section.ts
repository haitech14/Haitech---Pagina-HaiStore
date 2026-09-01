import { categoryLandingPath } from '@/lib/category-path';
import { storeMostViewedOffersPath } from '@/lib/category-path';
import { storeShowcasePath } from '@/lib/store-showcase-path';
import type { HaitechShopProductTabId } from '@/data/haitech-home-shop';

const CHIP = '/home/category-chips/equipment';

export type HaitechHomeFeaturedCategoryChipId =
  | 'multifuncionales'
  | 'laptops'
  | 'computadoras'
  | 'monitores'
  | 'accesorios'
  | 'almacenamiento'
  | 'redes'
  | 'software'
  | 'ofertas';

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
    id: 'laptops',
    label: 'Laptops',
    image: `${CHIP}/laptops.webp`,
    href: storeShowcasePath({
      categoryId: 'laptops',
      laptopSpecFilters: { device: 'laptop', cpu: null },
    }),
  },
  {
    id: 'computadoras',
    label: 'Computadoras',
    image: `${CHIP}/laptops.webp`,
    href: storeShowcasePath({
      categoryId: 'laptops',
      laptopSpecFilters: { device: 'pc', cpu: null },
    }),
  },
  {
    id: 'monitores',
    label: 'Monitores',
    image: '/categories/monitores.png',
    href: storeShowcasePath({ categoryId: 'monitores' }),
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    image: `${CHIP}/accesorios.webp`,
    href: storeShowcasePath({ categoryId: 'accesorios' }),
    tabId: 'accesorios',
  },
  {
    id: 'almacenamiento',
    label: 'Almacenamiento',
    image: `${CHIP}/accesorios.webp`,
    href: categoryLandingPath('accesorios'),
  },
  {
    id: 'redes',
    label: 'Redes',
    image: `${CHIP}/accesorios.webp`,
    href: categoryLandingPath('tecnologia'),
  },
  {
    id: 'software',
    label: 'Software',
    image: '/categories/software.png',
    href: categoryLandingPath('software'),
  },
  {
    id: 'ofertas',
    label: 'Ofertas',
    image: `${CHIP}/multifuncionales.webp`,
    href: storeMostViewedOffersPath(),
    tabId: 'ofertas',
  },
] as const;

export const HAITECH_HOME_FEATURED_DEFAULT_CHIP: HaitechHomeFeaturedCategoryChipId =
  'multifuncionales';

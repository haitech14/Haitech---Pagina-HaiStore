import { categoryLandingPath } from '@/lib/category-path';

/** Tokens visuales home ecommerce HAITECH. */
export const HAITECH_SHOP = {
  brand: '#E30613',
  accent: '#FF6B00',
  accentActive: '#FF6600',
  text: '#343434',
  textMuted: '#6B6B6B',
  grayBg: '#F5F5F5',
  cardBorder: '#E5E5E5',
  promoGreenBg: '#E8F8EE',
  promoGreenText: '#1B7A3D',
  discountRed: '#E30613',
  maxWidth: '1400px',
} as const;

export type HaitechShopProductTabId =
  | 'ofertas'
  | 'mas-vendidos'
  | 'multifuncionales'
  | 'impresoras'
  | 'toner';

export const HAITECH_SHOP_PRODUCT_TABS: readonly {
  id: HaitechShopProductTabId;
  label: string;
}[] = [
  { id: 'ofertas', label: 'Ofertas top' },
  { id: 'mas-vendidos', label: 'Más vendidos' },
  { id: 'multifuncionales', label: 'Multifuncionales' },
  { id: 'impresoras', label: 'Impresoras' },
  { id: 'toner', label: 'Tóner' },
] as const;

export type HaitechShopProduct = {
  id: string;
  name: string;
  image: string;
  colorSwatch?: string;
  colorLabel?: string;
  price: number;
  compareAt?: number;
  discountLabel?: string;
  promoTag?: string;
  tabIds: readonly HaitechShopProductTabId[];
  href?: string;
};

export function formatHaitechPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Solo equipos RICOH, tóner RICOH y repuestos RICOH.
 * (Sin alquiler ni marcas ajenas.)
 */
export const HAITECH_SHOP_FAVORITE_PRODUCTS: readonly HaitechShopProduct[] = [
  {
    id: 'im-430f',
    name: 'Multifuncional RICOH IM 430F',
    image: '/products/ricoh-im-430f.webp',
    colorSwatch: '#1a1a1a',
    price: 3399,
    compareAt: 3799,
    discountLabel: '11% DSCT',
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'im-550f',
    name: 'Multifuncional RICOH IM 550F',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    colorSwatch: '#222',
    price: 5499,
    compareAt: 6199,
    discountLabel: '11% DSCT',
    promoTag: '+ REGALO',
    tabIds: ['ofertas', 'multifuncionales'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'm-320f',
    name: 'Multifuncional RICOH M 320F',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    colorSwatch: '#111',
    price: 1499,
    compareAt: 1799,
    discountLabel: '17% DSCT',
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales', 'impresoras'],
    href: categoryLandingPath('impresoras'),
  },
  {
    id: 'im-460f',
    name: 'Multifuncional RICOH IM 460F',
    image: '/products/71289ec2-dbca-4780-b319-eb3d259fadb5.webp',
    colorSwatch: '#2c2c2c',
    price: 4199,
    compareAt: 4599,
    discountLabel: '9% DSCT',
    tabIds: ['mas-vendidos', 'multifuncionales'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'toner-im430',
    name: 'Tóner original RICOH IM 430F',
    image: '/products/ricoh-im-430f-rend-14-500.webp',
    colorSwatch: '#0a0a0a',
    price: 189,
    compareAt: 229,
    discountLabel: '17% DSCT',
    tabIds: ['ofertas', 'toner', 'mas-vendidos'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'toner-im550',
    name: 'Tóner original RICOH IM 550F / IM 600F',
    image: '/products/ricoh-im-550f-im-600f-rend-40-000.webp',
    colorSwatch: '#1a1a1a',
    price: 112.9,
    compareAt: 139,
    discountLabel: '19% DSCT',
    promoTag: '+ REGALO',
    tabIds: ['ofertas', 'toner'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'mc320fw',
    name: 'Multifuncional color RICOH M C320FW',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    colorSwatch: '#1a1a1a',
    price: 3299,
    compareAt: 3699,
    discountLabel: '11% DSCT',
    tabIds: ['impresoras', 'ofertas', 'multifuncionales'],
    href: categoryLandingPath('impresoras'),
  },
  {
    id: 'im-c2010',
    name: 'Multifuncional color RICOH IM C2010',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    colorSwatch: '#333',
    price: 8999,
    compareAt: 9999,
    discountLabel: '10% DSCT',
    tabIds: ['multifuncionales', 'mas-vendidos'],
    href: categoryLandingPath('multifuncionales'),
  },
];

/** Carrusel “Lo último” — solo RICOH / tóner / repuestos RICOH. */
export const HAITECH_SHOP_LATEST_PRODUCTS: readonly HaitechShopProduct[] = [
  {
    id: 'im-600f',
    name: 'Multifuncional RICOH IM 600F',
    image: '/products/b32a43a1-09e4-49f6-8950-3639c9534700.webp',
    colorSwatch: '#111',
    price: 6899,
    compareAt: 7499,
    discountLabel: '8% DSCT',
    tabIds: ['ofertas'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'unidad-imagen-430',
    name: 'Unidad de imagen RICOH IM 430F',
    image: '/products/ricoh-im-430f.webp',
    price: 249,
    compareAt: 299,
    discountLabel: '17% DSCT',
    tabIds: ['ofertas'],
    href: categoryLandingPath('repuestos'),
  },
  {
    id: 'im-2500',
    name: 'Multifuncional RICOH IM 2500 ARDF',
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    colorSwatch: '#222',
    price: 12499,
    compareAt: 13499,
    discountLabel: '7% DSCT',
    tabIds: ['ofertas'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'toner-negro-spc352',
    name: 'Tóner negro original RICOH SP C352',
    image: '/products/de-negro-ricoh-sp-c352.webp',
    colorSwatch: '#0a0a0a',
    price: 84.9,
    compareAt: 99,
    discountLabel: '14% DSCT',
    promoTag: '+ REGALO',
    tabIds: ['ofertas'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'm-320f-latest',
    name: 'Multifuncional RICOH M 320F',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    colorSwatch: '#1a1a1a',
    price: 1499,
    compareAt: 1799,
    discountLabel: '17% DSCT',
    tabIds: ['ofertas'],
    href: categoryLandingPath('impresoras'),
  },
  {
    id: 'toner-im430-latest',
    name: 'Tóner original RICOH IM 430F',
    image: '/products/ricoh-im-430f-rend-14-500.webp',
    price: 69.9,
    compareAt: 89,
    discountLabel: '21% DSCT',
    tabIds: ['ofertas'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'im-430f-latest',
    name: 'Multifuncional RICOH IM 430F',
    image: '/products/ricoh-im-430f.webp',
    colorSwatch: '#1a1a1a',
    price: 3399,
    compareAt: 3799,
    discountLabel: '11% DSCT',
    tabIds: ['ofertas'],
    href: categoryLandingPath('multifuncionales'),
  },
];

export const HAITECH_SHOP_PROMO_BANNERS = [
  {
    id: 'multi-oferta',
    title: 'HASTA S/ 500 DSCTO.',
    subtitle: 'En multifuncionales RICOH',
    cta: 'Comprar ahora',
    href: categoryLandingPath('multifuncionales'),
    gradient: 'linear-gradient(135deg, #1a0533 0%, #4a148c 40%, #7b1fa2 70%, #e91e63 100%)',
  },
  {
    id: 'toner-oferta',
    title: 'TÓNER RICOH',
    subtitle: 'Originales con stock',
    cta: 'Comprar ahora',
    href: categoryLandingPath('toner-suministros'),
    gradient: 'linear-gradient(135deg, #0d1b2a 0%, #1b3a4b 45%, #415a77 100%)',
  },
  {
    id: 'repuestos',
    title: 'REPUESTOS RICOH',
    subtitle: 'Unidades, fusores y más',
    cta: 'Comprar ahora',
    href: categoryLandingPath('repuestos'),
    gradient: 'linear-gradient(135deg, #1b0000 0%, #7f0000 40%, #c62828 75%, #ff6b00 100%)',
  },
] as const;

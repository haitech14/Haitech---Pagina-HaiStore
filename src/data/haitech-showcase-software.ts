import type { HaitechShopProduct } from '@/data/haitech-home-shop';

const SOFTWARE_DVD_BASE = '/products/software';

/** Pool vitrina Software Ricoh (/tienda/software). */
export const HAITECH_SHOWCASE_SOFTWARE: readonly HaitechShopProduct[] = [
  {
    id: 'sw-accounting-nx-lite',
    name: 'RICOH Accounting NX Lite',
    brand: 'RICOH',
    code: 'ACC-NX-LITE',
    stock: 0,
    image: `${SOFTWARE_DVD_BASE}/ricoh-accounting-nx-lite.svg`,
    price: 0,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['software'],
    href: '/software?seccion=integracion-ricoh',
  },
  {
    id: 'sw-accounting-nx-enterprise',
    name: 'RICOH Accounting NX Enterprise',
    brand: 'RICOH',
    code: 'ACC-NX-ENT',
    stock: 0,
    image: `${SOFTWARE_DVD_BASE}/ricoh-accounting-nx-enterprise.svg`,
    price: 0,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['software'],
    href: '/software?seccion=integracion-ricoh',
  },
  {
    id: 'sw-remote',
    name: 'RICOH @Remote',
    brand: 'RICOH',
    code: 'REMOTE-NX',
    stock: 0,
    image: `${SOFTWARE_DVD_BASE}/ricoh-remote.svg`,
    price: 0,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['software'],
    href: '/software/ricoh-remote-enterprise',
  },
  {
    id: 'sw-smart-suite',
    name: 'RICOH Smart Suite',
    brand: 'RICOH',
    code: 'SMART-SUITE',
    stock: 0,
    image: `${SOFTWARE_DVD_BASE}/ricoh-smart-suite.svg`,
    price: 0,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['software'],
    href: '/software?seccion=impresion-y-captura',
  },
  {
    id: 'sw-device-manager-nx',
    name: 'RICOH Device Manager NX',
    brand: 'RICOH',
    code: 'DM-NX',
    stock: 0,
    image: `${SOFTWARE_DVD_BASE}/ricoh-device-manager-nx.svg`,
    price: 0,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['software'],
    href: '/software?seccion=integracion-ricoh',
  },
];

export const HAITECH_SHOWCASE_SOFTWARE_CATEGORY_IMAGE = `${SOFTWARE_DVD_BASE}/ricoh-software-category.svg`;

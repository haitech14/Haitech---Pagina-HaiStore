import { categoryLandingPath } from '@/lib/category-path';

/** Tokens visuales home ecommerce HAITECH. */
export const HAITECH_SHOP = {
  brand: '#E30613',
  accent: '#FF6B00',
  accentActive: '#FF6600',
  text: '#343434',
  textMuted: '#6B6B6B',
  grayBg: '#F5F5F5',
  cardBorder: '#E8E8E8',
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
  | 'toner'
  | 'accesorios';

export type HaitechShopFeatureId = 'copia' | 'escanea' | 'imprime' | 'rendimiento';

export const HAITECH_SHOP_PRODUCT_TABS: readonly {
  id: HaitechShopProductTabId;
  label: string;
  icon: 'star' | 'flame' | 'printer' | 'monitor' | 'droplet' | 'package';
}[] = [
  { id: 'ofertas', label: 'Ofertas top', icon: 'star' },
  { id: 'mas-vendidos', label: 'Más vendidos', icon: 'flame' },
  { id: 'multifuncionales', label: 'Multifuncionales', icon: 'printer' },
  { id: 'impresoras', label: 'Impresoras', icon: 'monitor' },
  { id: 'toner', label: 'Tóner', icon: 'droplet' },
  { id: 'accesorios', label: 'Accesorios', icon: 'package' },
] as const;

export const HAITECH_SHOP_EQUIPMENT_FEATURES: readonly {
  id: HaitechShopFeatureId;
  label: string;
}[] = [
  { id: 'copia', label: 'Copia' },
  { id: 'escanea', label: 'Escanea' },
  { id: 'imprime', label: 'Imprime' },
  { id: 'rendimiento', label: 'Rendimiento' },
] as const;

export const HAITECH_SHOP_TRUST_ITEMS = [
  {
    id: 'envio',
    title: 'Envíos a nivel nacional',
    subtitle: 'Despacho rápido y seguro',
    icon: 'truck',
  },
  {
    id: 'garantia',
    title: 'Garantía oficial Ricoh',
    subtitle: 'Equipos con respaldo de fábrica',
    icon: 'shield',
  },
  {
    id: 'soporte',
    title: 'Soporte técnico dedicado',
    subtitle: 'Asesoría comercial y postventa',
    icon: 'headset',
  },
  {
    id: 'pago',
    title: 'Pago seguro',
    subtitle: 'Factura y contraentrega',
    icon: 'lock',
  },
] as const;

export type HaitechShopProduct = {
  id: string;
  name: string;
  image: string;
  brand?: string;
  colorSwatch?: string;
  colorLabel?: string;
  price: number;
  compareAt?: number;
  discountLabel?: string;
  promoTag?: string;
  /** Badge superior, p.ej. MÁS VENDIDO */
  badge?: string;
  /** Condición del equipo (multifuncionales / impresoras). */
  condition?: 'nuevo' | 'seminuevo';
  features?: readonly HaitechShopFeatureId[];
  /** Specs de equipo multifuncional / impresora. */
  equipment?: {
    /** Velocidad de impresión, p. ej. `45 ppm`. */
    speedPpm?: string;
    /** Alimentador de documentos. */
    scannerType?: 'ARDF' | 'SPDF';
    /** Volumen mensual recomendado, p. ej. `20.000 pág/mes`. */
    monthlyYield?: string;
  };
  /** Specs de tóner: original, rendimiento y color. */
  toner?: {
    original: boolean;
    yieldLabel: string;
    colorLabel: string;
  };
  tabIds: readonly HaitechShopProductTabId[];
  href?: string;
};

export function formatHaitechPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const EQUIPMENT_FEATURES = ['copia', 'escanea', 'imprime', 'rendimiento'] as const;

/**
 * Solo equipos RICOH, tóner RICOH y repuestos RICOH.
 * (Sin alquiler ni marcas ajenas.)
 */
export const HAITECH_SHOP_FAVORITE_PRODUCTS: readonly HaitechShopProduct[] = [
  {
    id: 'im-430f',
    name: 'Multifuncional RICOH IM 430F',
    brand: 'RICOH',
    image: '/products/ricoh-im-430f.webp',
    colorSwatch: '#1a1a1a',
    price: 3399,
    compareAt: 3799,
    discountLabel: '11% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '45 ppm',
      scannerType: 'ARDF',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'im-550f',
    name: 'Multifuncional RICOH IM 550F',
    brand: 'RICOH',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    colorSwatch: '#222',
    price: 5499,
    compareAt: 6199,
    discountLabel: '11% DSCT',
    promoTag: '+ REGALO',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '55 ppm',
      scannerType: 'SPDF',
      monthlyYield: '30.000 pág/mes',
    },
    tabIds: ['ofertas', 'multifuncionales'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'm-320f',
    name: 'Multifuncional RICOH M 320F',
    brand: 'RICOH',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    colorSwatch: '#111',
    price: 1499,
    compareAt: 1799,
    discountLabel: '17% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '34 ppm',
      scannerType: 'ARDF',
      monthlyYield: '3.500 pág/mes',
    },
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales', 'impresoras'],
    href: categoryLandingPath('impresoras'),
  },
  {
    id: 'im-460f',
    name: 'Multifuncional RICOH IM 460F',
    brand: 'RICOH',
    image: '/products/71289ec2-dbca-4780-b319-eb3d259fadb5.webp',
    colorSwatch: '#2c2c2c',
    price: 4199,
    compareAt: 4599,
    discountLabel: '9% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '46 ppm',
      scannerType: 'ARDF',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['mas-vendidos', 'multifuncionales'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'toner-im430',
    name: 'Tóner original RICOH IM 430F',
    brand: 'RICOH',
    image: '/products/ricoh-im-430f-rend-14-500.webp',
    colorSwatch: '#0a0a0a',
    colorLabel: 'Negro',
    price: 189,
    compareAt: 229,
    discountLabel: '17% DSCT',
    toner: {
      original: true,
      yieldLabel: '14.500 pág.',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas', 'toner', 'mas-vendidos', 'accesorios'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'toner-im550',
    name: 'Tóner original RICOH IM 550F / IM 600F',
    brand: 'RICOH',
    image: '/products/ricoh-im-550f-im-600f-rend-40-000.webp',
    colorSwatch: '#1a1a1a',
    colorLabel: 'Negro',
    price: 112.9,
    compareAt: 139,
    discountLabel: '19% DSCT',
    promoTag: '+ REGALO',
    toner: {
      original: true,
      yieldLabel: '40.000 pág.',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas', 'toner', 'accesorios'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'mc320fw',
    name: 'Multifuncional color RICOH M C320FW',
    brand: 'RICOH',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    colorSwatch: '#1a1a1a',
    price: 3299,
    compareAt: 3699,
    discountLabel: '11% DSCT',
    features: EQUIPMENT_FEATURES,
    condition: 'nuevo',
    equipment: {
      speedPpm: '32 ppm',
      scannerType: 'ARDF',
      monthlyYield: '3.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas', 'multifuncionales'],
    href: categoryLandingPath('impresoras'),
  },
  {
    id: 'im-c2010',
    name: 'Multifuncional color RICOH IM C2010',
    brand: 'RICOH',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    colorSwatch: '#333',
    price: 8999,
    compareAt: 9999,
    discountLabel: '10% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '20 ppm',
      scannerType: 'SPDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
    href: categoryLandingPath('multifuncionales'),
  },
];

/** Carrusel “Lo último” — solo RICOH / tóner / repuestos RICOH. */
export const HAITECH_SHOP_LATEST_PRODUCTS: readonly HaitechShopProduct[] = [
  {
    id: 'im-600f',
    name: 'Multifuncional RICOH IM 600F',
    brand: 'RICOH',
    image: '/products/b32a43a1-09e4-49f6-8950-3639c9534700.webp',
    colorSwatch: '#111',
    price: 6899,
    compareAt: 7499,
    discountLabel: '8% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '60 ppm',
      scannerType: 'SPDF',
      monthlyYield: '40.000 pág/mes',
    },
    tabIds: ['ofertas'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'unidad-imagen-430',
    name: 'Unidad de imagen RICOH IM 430F',
    brand: 'RICOH',
    image: '/products/ricoh-im-430f.webp',
    price: 249,
    compareAt: 299,
    discountLabel: '17% DSCT',
    tabIds: ['ofertas', 'accesorios'],
    href: categoryLandingPath('repuestos'),
  },
  {
    id: 'im-2500',
    name: 'Multifuncional RICOH IM 2500 ARDF',
    brand: 'RICOH',
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    colorSwatch: '#222',
    price: 12499,
    compareAt: 13499,
    discountLabel: '7% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '25 ppm',
      scannerType: 'ARDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['ofertas'],
    href: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'toner-negro-spc352',
    name: 'Tóner negro original RICOH SP C352',
    brand: 'RICOH',
    image: '/products/de-negro-ricoh-sp-c352.webp',
    colorSwatch: '#0a0a0a',
    colorLabel: 'Negro',
    price: 84.9,
    compareAt: 99,
    discountLabel: '14% DSCT',
    promoTag: '+ REGALO',
    toner: {
      original: true,
      yieldLabel: 'Alto rendimiento',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas', 'accesorios'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'm-320f-latest',
    name: 'Multifuncional RICOH M 320F',
    brand: 'RICOH',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    colorSwatch: '#1a1a1a',
    price: 1499,
    compareAt: 1799,
    discountLabel: '17% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '34 ppm',
      scannerType: 'ARDF',
      monthlyYield: '3.500 pág/mes',
    },
    tabIds: ['ofertas'],
    href: categoryLandingPath('impresoras'),
  },
  {
    id: 'toner-im430-latest',
    name: 'Tóner original RICOH IM 430F',
    brand: 'RICOH',
    image: '/products/ricoh-im-430f-rend-14-500.webp',
    colorSwatch: '#0a0a0a',
    colorLabel: 'Negro',
    price: 69.9,
    compareAt: 89,
    discountLabel: '21% DSCT',
    toner: {
      original: true,
      yieldLabel: '14.500 pág.',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'im-430f-latest',
    name: 'Multifuncional RICOH IM 430F',
    brand: 'RICOH',
    image: '/products/ricoh-im-430f.webp',
    colorSwatch: '#1a1a1a',
    price: 3399,
    compareAt: 3799,
    discountLabel: '11% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '45 ppm',
      scannerType: 'ARDF',
      monthlyYield: '20.000 pág/mes',
    },
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

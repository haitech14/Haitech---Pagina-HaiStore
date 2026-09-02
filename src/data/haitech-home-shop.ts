import { categoryLandingPath } from '@/lib/category-path';
import { productPath } from '@/lib/product-path';

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
  maxWidth: '1500px',
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
  icon: 'star' | 'chart' | 'printer' | 'monitor' | 'droplet' | 'package';
}[] = [
  { id: 'ofertas', label: 'Ofertas top', icon: 'star' },
  { id: 'mas-vendidos', label: 'Más vendidos', icon: 'chart' },
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
    title: 'Envíos a todo el país',
    subtitle: 'Rápido y seguro',
    icon: 'truck',
  },
  {
    id: 'garantia',
    title: 'Garantía oficial',
    subtitle: 'Equipos certificados',
    icon: 'shield',
  },
  {
    id: 'soporte',
    title: 'Asesoría especializada',
    subtitle: 'Te ayudamos a elegir',
    icon: 'headset',
  },
  {
    id: 'pago',
    title: 'Múltiples medios de pago',
    subtitle: 'Compra segura',
    icon: 'lock',
  },
] as const;

export type HaitechShopProduct = {
  id: string;
  name: string;
  image: string;
  brand?: string;
  /** Código / SKU visible en card. */
  code?: string;
  /** Stock disponible (si falta, se omite la línea). */
  stock?: number;
  /** Desglose por almacén para el tooltip de stock. */
  stockLocations?: readonly { name: string; quantity: number }[];
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
    /** Formato de papel principal, o dual A4+A3. */
    paperSize?: 'A4' | 'A3' | 'A4 / A3' | 'A0' | 'A1';
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
  /** Categorías vitrina /tienda cuando no aplican tabIds (formato ancho, laptops, monitores). */
  showcaseCategoryIds?: readonly (
    | 'multifuncionales'
    | 'impresoras'
    | 'formato-ancho'
    | 'plotter'
    | 'multifuncional-planos'
    | 'laptops'
    | 'monitores'
    | 'accesorios'
    | 'software'
    | 'escaneres'
    | 'pantallas-interactivas'
    | 'videoconferencia'
  )[];
  /** Precio mínimo de un grupo con variantes (muestra «Desde» en vitrina). */
  hasVariants?: boolean;
  /** Variante usada para el precio en vitrina (p. ej. cilindro nuevo). */
  showcaseVariantLabel?: string;
  /** Subtítulo en card destacada del home, p. ej. Impresora Multifuncional. */
  productTypeLabel?: string;
  /** Título completo en card destacada (incluye marca y modelo). */
  featuredTitle?: string;
  /** Valoración para card destacada. */
  rating?: number;
  reviewCount?: number;
  /** Tipo dispositivo vitrina PC / Laptops. */
  showcaseLaptopDevice?: 'pc' | 'laptop';
  /** Procesador vitrina PC / Laptops. */
  showcaseLaptopCpu?: 'i5' | 'i7';
};

export function formatHaitechPen(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Almacenes por defecto en tooltips de stock (Lima / Piura). */
export function resolveHaitechShopStockLocations(
  product: Pick<HaitechShopProduct, 'stock' | 'stockLocations' | 'id'>,
): { name: string; quantity: number }[] {
  const explicit = (product.stockLocations ?? []).filter((row) => row.quantity > 0);
  if (explicit.length > 0) {
    return explicit.map((row) => ({ name: row.name, quantity: row.quantity }));
  }

  const total = Math.max(0, Math.floor(Number(product.stock) || 0));
  if (total <= 0) return [];

  // Distribución estable por id (no aleatoria) entre sedes Lima y Piura.
  const hash = Array.from(product.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const limaShare = 0.55 + (hash % 30) / 100;
  const lima = Math.max(1, Math.min(total - (total > 1 ? 1 : 0), Math.round(total * limaShare)));
  const piura = total - lima;

  const locations = [{ name: 'Lima', quantity: lima }];
  if (piura > 0) locations.push({ name: 'Piura', quantity: piura });
  return locations;
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
    code: '418491',
    stock: 12,
    image: '/products/ricoh-im-430f.webp',
    colorSwatch: '#1a1a1a',
    price: 3899,
    compareAt: 4379,
    discountLabel: '11% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '43 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales'],
    href: productPath('ricoh-im-430f'),
    productTypeLabel: 'Impresora Multifuncional',
    featuredTitle: 'RICOH IM 430F (SPDF)',
    rating: 5,
    reviewCount: 12,
  },
  {
    id: 'im-550f',
    name: 'Multifuncional RICOH IM 550F',
    brand: 'RICOH',
    code: '418460',
    stock: 8,
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    colorSwatch: '#222',
    price: 6149,
    compareAt: 6909,
    discountLabel: '11% DSCT',
    promoTag: '+ REGALO',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '55 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '30.000 pág/mes',
    },
    tabIds: ['ofertas', 'multifuncionales'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-550f-e1db5bdf73fb'),
  },
  {
    id: 'm-320f',
    name: 'Multifuncional RICOH M 320F',
    brand: 'RICOH',
    code: 'M320F',
    stock: 15,
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    colorSwatch: '#111',
    price: 1709,
    compareAt: 1919,
    discountLabel: '11% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '32 ppm',
      paperSize: 'A4',
      scannerType: 'ARDF',
      monthlyYield: '3.500 pág/mes',
    },
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales'],
    href: productPath('impresora-multifuncional-b-n-nueva-ricoh-m-320f-2df02df8c75e'),
    productTypeLabel: 'Impresora Multifuncional',
    featuredTitle: 'RICOH M 320F (SPDF)',
    rating: 5,
    reviewCount: 12,
  },
  {
    id: 'mp-305-plus',
    name: 'Multifuncional RICOH MP 305+',
    brand: 'RICOH',
    code: 'MP-305+',
    stock: 5,
    image: '/products/ab878d89-61e0-4e51-a941-03455e1da407.webp',
    colorSwatch: '#1a1a1a',
    price: 3899,
    compareAt: 4379,
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '30 ppm',
      paperSize: 'A4 / A3',
      scannerType: 'SPDF',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['ofertas', 'mas-vendidos', 'multifuncionales'],
    href: productPath('impresora-multifuncional-b-n-nueva-ricoh-mp-305-03455e1da407'),
    productTypeLabel: 'Impresora Multifuncional',
    featuredTitle: 'RICOH MP 305+ (SPDF)',
    rating: 5,
    reviewCount: 9,
  },
  {
    id: 'im-460f',
    name: 'Multifuncional RICOH IM 460F',
    brand: 'RICOH',
    code: '423509',
    stock: 6,
    image: '/products/71289ec2-dbca-4780-b319-eb3d259fadb5.webp',
    colorSwatch: '#2c2c2c',
    price: 4199,
    compareAt: 4599,
    discountLabel: '9% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '46 ppm',
      paperSize: 'A4 / A3',
      scannerType: 'SPDF',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['mas-vendidos', 'multifuncionales'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-460f-eb3d259fadb5'),
    productTypeLabel: 'Impresora Multifuncional',
    featuredTitle: 'RICOH IM 460F (SPDF)',
    rating: 5,
    reviewCount: 8,
  },
  {
    id: 'toner-im430',
    name: 'Tóner original RICOH IM 430F',
    brand: 'RICOH',
    code: '419078',
    stock: 42,
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
    href: productPath('419078'),
  },
  {
    id: 'toner-im550',
    name: 'Tóner original RICOH IM 550F / IM 600F',
    brand: 'RICOH',
    code: '418480',
    stock: 28,
    image: '/products/ricoh-im-550f-im-600f-rend-40-000.webp',
    colorSwatch: '#1a1a1a',
    colorLabel: 'Negro',
    price: 547.2,
    compareAt: 680.58,
    discountLabel: '19% DSCT',
    promoTag: '+ REGALO',
    toner: {
      original: true,
      yieldLabel: '40.000 pág.',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas', 'toner', 'accesorios'],
    href: productPath('418480'),
  },
  {
    id: 'toner-im430-compatible',
    name: 'Tóner compatible RICOH IM 430F',
    brand: 'RICOH',
    code: 'TON-C-430',
    stock: 55,
    image: '/products/ricoh-im-430f-rend-14-500.webp',
    colorSwatch: '#0a0a0a',
    colorLabel: 'Negro',
    price: 119,
    compareAt: 149,
    discountLabel: '20% DSCT',
    toner: {
      original: false,
      yieldLabel: '14.500 pág.',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas', 'toner', 'mas-vendidos'],
    href: categoryLandingPath('toner-compatibles'),
  },
  {
    id: 'toner-spc352-reman',
    name: 'Tóner remanufacturado RICOH SP C352',
    brand: 'RICOH',
    code: 'TON-R-C352',
    stock: 33,
    image: '/products/de-negro-ricoh-sp-c352.webp',
    colorSwatch: '#0a0a0a',
    colorLabel: 'Negro',
    price: 64.9,
    compareAt: 84.9,
    discountLabel: '24% DSCT',
    toner: {
      original: false,
      yieldLabel: 'Alto rendimiento',
      colorLabel: 'Negro',
    },
    tabIds: ['ofertas', 'toner'],
    href: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'mc320fw',
    name: 'Multifuncional color RICOH M C320FW',
    brand: 'RICOH',
    code: '418787',
    stock: 9,
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    colorSwatch: '#1a1a1a',
    price: 3299,
    compareAt: 3699,
    discountLabel: '11% DSCT',
    features: EQUIPMENT_FEATURES,
    condition: 'nuevo',
    equipment: {
      speedPpm: '32 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '3.000 pág/mes',
    },
    tabIds: ['ofertas', 'multifuncionales'],
    href: productPath('impresora-multifuncional-nueva-ricoh-m-c320fw-d4dae08723e4'),
  },
  {
    id: 'p-502',
    name: 'Impresora láser RICOH P 502',
    brand: 'RICOH',
    code: '418495',
    stock: 2,
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    colorSwatch: '#1a1a1a',
    price: 2389,
    compareAt: 2689,
    discountLabel: '11% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: ['imprime', 'rendimiento'],
    equipment: {
      speedPpm: '43 ppm',
      paperSize: 'A4',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas', 'mas-vendidos'],
    href: productPath('impresora-laser-b-n-nueva-ricoh-p-502-7e8b244ad8ea'),
  },
  {
    id: 'p-800',
    name: 'Impresora láser RICOH P 800',
    brand: 'RICOH',
    code: '418471',
    stock: 2,
    image: '/products/73ab69b8-602b-4203-a389-070ef7bb80b0.webp',
    colorSwatch: '#222',
    price: 3379,
    compareAt: 3799,
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['imprime', 'rendimiento'],
    equipment: {
      speedPpm: '60 ppm',
      paperSize: 'A4',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
    href: productPath('impresora-laser-b-n-nueva-ricoh-p-800-070ef7bb80b0'),
  },
  {
    id: 'p-801',
    name: 'Impresora láser RICOH P 801',
    brand: 'RICOH',
    code: '418474',
    stock: 1,
    image: '/products/be3457a0-76dd-4cf7-beca-31ad9aa7f541.webp',
    colorSwatch: '#222',
    price: 4439,
    compareAt: 4989,
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['imprime', 'rendimiento'],
    equipment: {
      speedPpm: '66 ppm',
      paperSize: 'A4',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
    href: productPath('impresora-laser-b-n-nueva-ricoh-p-801-31ad9aa7f541'),
  },
  {
    id: 'im-c2010',
    name: 'Multifuncional color RICOH IM C2010',
    brand: 'RICOH',
    code: '419346',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    colorSwatch: '#333',
    price: 17269,
    compareAt: 19399,
    discountLabel: '11% DSCT',
    badge: 'MÁS VENDIDO',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '20 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-c2010-95cb3256a7c1'),
  },
];

/** Carrusel “Lo último” — solo RICOH / tóner / repuestos RICOH. */
export const HAITECH_SHOP_LATEST_PRODUCTS: readonly HaitechShopProduct[] = [
  {
    id: 'im-600f',
    name: 'Multifuncional RICOH IM 600F',
    brand: 'RICOH',
    code: '418464',
    stock: 1,
    image: '/products/b32a43a1-09e4-49f6-8950-3639c9534700.webp',
    colorSwatch: '#111',
    price: 7179,
    compareAt: 8069,
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '60 ppm',
      scannerType: 'SPDF',
      monthlyYield: '40.000 pág/mes',
    },
    tabIds: ['ofertas', 'multifuncionales'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-600f-3639c9534700'),
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
    name: 'Multifuncional RICOH IM 2500',
    brand: 'RICOH',
    code: '418843',
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    colorSwatch: '#222',
    price: 13749,
    compareAt: 15449,
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '25 ppm',
      paperSize: 'A3',
      scannerType: 'ARDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['ofertas', 'multifuncionales'],
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

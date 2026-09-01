import type { HaitechShopProduct } from '@/data/haitech-home-shop';

const EXCHANGE_RATE = 3.42;
const IMPORT_EXCHANGE_RATE = 3.46;
const TECNICO_MARKUP_USD = 300;
const PUBLIC_MARKUP_USD = 200;
const SHOWCASE_MARKUP_PEN = Math.round(200 * EXCHANGE_RATE);

type PizarraShowcaseRow = {
  id: string;
  slug: string;
  name: string;
  code: string;
  screen: string;
  image: string;
  stock: number;
  listPen: number;
};

type VideoconfShowcaseRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  code: string;
  image: string;
  stock: number;
  publicPen: number;
};

function roundPenToNearestNine(value: number): number {
  const rounded = Math.round(value);
  const base = Math.floor(rounded / 10);
  const candidates = [base * 10 - 1, base * 10 + 9].filter((candidate) => candidate > 0);
  let best = candidates[0] ?? rounded;
  for (const candidate of candidates) {
    if (
      Math.abs(rounded - candidate) < Math.abs(rounded - best) ||
      (Math.abs(rounded - candidate) === Math.abs(rounded - best) && candidate > best)
    ) {
      best = candidate;
    }
  }
  return best;
}

function showcaseCompareAtFromPen(pricePen: number): number {
  return roundPenToNearestNine(pricePen / (1 - 0.11));
}

function priceFromListPen(listPen: number): { price: number; compareAt: number } {
  const listUsd = Math.round((listPen / EXCHANGE_RATE) * 100) / 100;
  const tecnicoUsd = Math.round((listUsd + TECNICO_MARKUP_USD) * 100) / 100;
  const publicUsd = Math.round((tecnicoUsd + PUBLIC_MARKUP_USD) * 100) / 100;
  const price = roundPenToNearestNine(publicUsd * EXCHANGE_RATE);
  return { price, compareAt: showcaseCompareAtFromPen(price) };
}

function priceFromPublicPen(publicPen: number): { price: number; compareAt: number } {
  const publicUsd = Math.round((publicPen / IMPORT_EXCHANGE_RATE) * 100) / 100;
  const price = roundPenToNearestNine(publicUsd * EXCHANGE_RATE) + SHOWCASE_MARKUP_PEN;
  return { price, compareAt: showcaseCompareAtFromPen(price) };
}

function toPizarraProduct(row: PizarraShowcaseRow): HaitechShopProduct {
  const { price, compareAt } = priceFromListPen(row.listPen);
  return {
    id: row.id,
    name: row.name,
    brand: 'RICOH',
    code: row.code,
    stock: row.stock,
    image: row.image,
    price,
    compareAt,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['pantallas-interactivas'],
    href: `/tienda/${row.slug}`,
  };
}

function toVideoconfProduct(row: VideoconfShowcaseRow): HaitechShopProduct {
  const { price, compareAt } = priceFromPublicPen(row.publicPen);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    code: row.code,
    stock: row.stock,
    image: row.image,
    price,
    compareAt,
    condition: 'nuevo',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['videoconferencia'],
    href: `/tienda/${row.slug}`,
  };
}

const PIZARRAS: readonly PizarraShowcaseRow[] = [
  {
    id: 'pizarra-a6510',
    slug: 'pizarra-a6510',
    name: 'Pizarra Interactiva Nueva Ricoh A6510 65" IFPD 4K - Android 13 - Google Certified - 5 Year Warranty',
    code: 'A6510',
    screen: '65"',
    image: '/products/pizarra-a6510.webp',
    stock: 0,
    listPen: 8854,
  },
  {
    id: 'pizarra-a8610',
    slug: 'pizarra-a8610',
    name: 'Pizarra Interactiva Nueva Ricoh A8610 86" IFPD 4K - Android 13 - Google Certified - 5 Year Warranty',
    code: 'A8610',
    screen: '86"',
    image: '/products/pizarra-a8610.webp',
    stock: 0,
    listPen: 13920,
  },
  {
    id: 'pizarra-a7510',
    slug: 'pizarra-a7510',
    name: 'Pizarra Interactiva Nueva Ricoh A7510 75" IFPD 4K - Android 13 - Google Certified - 5 Year Warranty',
    code: 'A7510',
    screen: '75"',
    image: '/products/pizarra-a7510.webp',
    stock: 0,
    listPen: 10904,
  },
];

const VIDEOCONFERENCIAS: readonly VideoconfShowcaseRow[] = [
  {
    id: 'videoconf-jabra-speak2-75',
    slug: 'videoconf-jabra-speak2-75',
    name: 'Jabra Speak2 75 MS Teams Link 380a BT USB-C/A',
    brand: 'Jabra',
    code: 'JABRA-SPEAK2-75',
    image: '/products/videoconf-jabra-speak2-75.webp',
    stock: 0,
    publicPen: 1343,
  },
  {
    id: 'videoconf-jabra-speak2-55',
    slug: 'videoconf-jabra-speak2-55',
    name: 'Jabra Speak2 55 MS Teams BT USB-C/A',
    brand: 'Jabra',
    code: 'JABRA-SPEAK2-55',
    image: '/products/videoconf-jabra-speak2-55.webp',
    stock: 0,
    publicPen: 645,
  },
  {
    id: 'videoconf-jabra-panacast-20',
    slug: 'videoconf-jabra-panacast-20',
    name: 'Jabra PanaCast 20 camara WEB',
    brand: 'Jabra',
    code: 'JABRA-PANACAST-20',
    image: '/products/videoconf-jabra-panacast-20.webp',
    stock: 0,
    publicPen: 820,
  },
  {
    id: 'videoconf-nearity-v415',
    slug: 'videoconf-nearity-v415',
    name: 'V415 4K PTZ Cámara para conferencia Nearity',
    brand: 'Ricoh',
    code: 'NEARITY-V415',
    image: '/products/videoconf-nearity-v415.webp',
    stock: 0,
    publicPen: 3573,
  },
  {
    id: 'videoconf-nearity-v410',
    slug: 'videoconf-nearity-v410',
    name: 'V410 2K PTZ Cámara para conferencia Nearity',
    brand: 'Ricoh',
    code: 'NEARITY-V410',
    image: '/products/videoconf-nearity-v410.webp',
    stock: 0,
    publicPen: 2818,
  },
  {
    id: 'videoconf-nearity-a11',
    slug: 'videoconf-nearity-a11',
    name: 'A11 Altavoz para conferencias Nearity',
    brand: 'Ricoh',
    code: 'NEARITY-A11',
    image: '/products/videoconf-nearity-a11.webp',
    stock: 0,
    publicPen: 1227,
  },
  {
    id: 'videoconf-nearity-a20',
    slug: 'videoconf-nearity-a20',
    name: 'A20 Altavoz para conferencias Nearity',
    brand: 'Ricoh',
    code: 'NEARITY-A20',
    image: '/products/videoconf-nearity-a20.webp',
    stock: 0,
    publicPen: 1840,
  },
  {
    id: 'videoconf-nearity-c30r',
    slug: 'videoconf-nearity-c30r',
    name: 'C30R All in One Cámara para conferencia Nearity',
    brand: 'Ricoh',
    code: 'NEARITY-C30R',
    image: '/products/videoconf-nearity-c30r.webp',
    stock: 0,
    publicPen: 3680,
  },
  {
    id: 'videoconf-logitech-meetup-mount',
    slug: 'videoconf-logitech-meetup-mount',
    name: 'Soporte de Televisión Logitech para MeetUp',
    brand: 'Logitech',
    code: 'LOGITECH-MEETUP-MOUNT',
    image: '/products/videoconf-logitech-meetup-mount.webp',
    stock: 0,
    publicPen: 491,
  },
  {
    id: 'videoconf-lg-monitor-49-uhd',
    slug: 'videoconf-lg-monitor-49-uhd',
    name: 'Monitor LED 49" 24/7 Ultra HD 500nits Profesi',
    brand: 'LG',
    code: 'LG-MONITOR-49-UHD',
    image: '/products/videoconf-lg-monitor-49-uhd.webp',
    stock: 0,
    publicPen: 2628,
  },
];

export const HAITECH_SHOWCASE_PANTALLAS_INTERACTIVAS: readonly HaitechShopProduct[] =
  PIZARRAS.map(toPizarraProduct);

export const HAITECH_SHOWCASE_VIDEOCONFERENCIA: readonly HaitechShopProduct[] =
  VIDEOCONFERENCIAS.map(toVideoconfProduct);

export const HAITECH_SHOWCASE_COLABORACION: readonly HaitechShopProduct[] = [
  ...HAITECH_SHOWCASE_PANTALLAS_INTERACTIVAS,
  ...HAITECH_SHOWCASE_VIDEOCONFERENCIA,
];

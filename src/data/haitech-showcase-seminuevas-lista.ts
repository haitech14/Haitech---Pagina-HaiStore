import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import { roundPenToNearestNine } from '@/lib/pen-pricing';
import { productPath } from '@/lib/product-path';
import type { HaitechShopProduct } from '@/data/haitech-home-shop';

const EQUIPMENT_FEATURES = ['copia', 'escanea', 'imprime', 'rendimiento'] as const;
const PRINTER_FEATURES = ['imprime', 'rendimiento'] as const;

/** Imagen genérica vitrina seminueva — laptop. */
const SHOWCASE_SEMI_LAPTOP_IMAGE = '/products/laptop-dell-latitude-3440-i5.webp';
/** Imagen genérica vitrina seminueva — PC de escritorio / mini PC. */
const SHOWCASE_SEMI_PC_IMAGE = '/products/laptop-lenovo-m70q-g5-i5.webp';

/** Fila cruda de la planilla comercial (precio técnico USD). */
type SeminuevaPlanillaRow = {
  key: string;
  /** Agrupa variantes en una card genérica (precio = variante premium / cilindro nuevo). */
  mergeInto?: string;
  stock: number;
  tecnicoUsd: number;
  notes?: string;
};

/** Metadatos de producto genérico tras fusionar variantes. */
type SeminuevaProductMeta = {
  id: string;
  name: string;
  brand: string;
  code: string;
  image: string;
  isColor: boolean;
  kind: 'equipment' | 'printer' | 'plotter' | 'accessory' | 'laptop' | 'pc' | 'monitor';
  paperSize?: 'A4' | 'A3' | 'A4 / A3' | 'A0' | 'A1';
  scannerType?: 'ARDF' | 'SPDF' | 'Estándar';
  speedPpm?: string;
  monthlyYield?: string;
  tabIds: HaitechShopProduct['tabIds'];
  showcaseCategoryIds?: HaitechShopProduct['showcaseCategoryIds'];
  href?: string;
  /** PC / laptop con monitor DELL 18.5 incluido (+USD 50 al precio público). */
  includeMonitor?: boolean;
};

function endIn9(value: number): number {
  const n = Math.ceil(Number(value) || 0);
  if (n <= 0) return 0;
  return Math.ceil(n / 10) * 10 - 1;
}

/** Precio USD público: siguiente valor que termina en 9 (p. ej. 40 → 49). */
function publicUsdEndingIn9(fromUsd: number): number {
  const n = Math.ceil(Number(fromUsd) || 0);
  if (n <= 0) return 0;
  const lastDigit = n % 10;
  if (lastDigit === 9) return n;
  if (lastDigit === 0) return n + 9;
  return Math.ceil(n / 10) * 10 - 1;
}

function penFromPublicUsd(publicUsd: number): number {
  return roundPenToNearestNine(publicUsd * DEFAULT_USD_TO_PEN);
}

function publicUsdFromTecnico(tecnicoUsd: number, isColor: boolean): number {
  return endIn9(tecnicoUsd + (isColor ? 400 : 300));
}

function compareAtFromPen(pricePen: number): number {
  if (pricePen <= 0) return 0;
  return roundPenToNearestNine(pricePen / 0.89);
}

/** Precio público PC / Laptop: técnico + USD 40 (+ USD 50 opcional con monitor), termina en 9. */
function laptopPricesFromTecnicoUsd(
  tecnicoUsd: number,
  extraPublicUsd = 0,
): { price: number; compareAt: number } {
  const publicUsd = publicUsdEndingIn9(tecnicoUsd + 40 + extraPublicUsd);
  const price = penFromPublicUsd(publicUsd);
  return { price, compareAt: compareAtFromPen(price) };
}

/** Precio público accesorio seminuevo: técnico + USD 15, termina en 9. */
function accessoryPricesFromTecnicoUsd(tecnicoUsd: number): { price: number; compareAt: number } {
  const publicUsd = publicUsdEndingIn9(tecnicoUsd + 15);
  const price = penFromPublicUsd(publicUsd);
  return { price, compareAt: compareAtFromPen(price) };
}

/** Monitor seminuevo: lista pública fija USD 49 / USD 59 (ambos terminan en 9). */
function monitorPublicPrices(): { price: number; compareAt: number } {
  return {
    price: penFromPublicUsd(49),
    compareAt: penFromPublicUsd(59),
  };
}

/** Precio público lista seminueva: técnico + USD 300 (B/N) o +400 (color), termina en 9. */
function pricesFromTecnicoUsd(tecnicoUsd: number, isColor: boolean): { price: number; compareAt: number } {
  const price = penFromPublicUsd(publicUsdFromTecnico(tecnicoUsd, isColor));
  return { price, compareAt: compareAtFromPen(price) };
}

const PREMIUM_NOTES_RE =
  /cilindro|cuchilla|u\.\s*imagen|unidad de imagen|rod\.\s*limp|rod\.\s*carga|imagen nueva|imagen 4500/i;

function pickPriceVariant(rows: SeminuevaPlanillaRow[]): {
  tecnicoUsd: number;
  variantLabel?: string;
} {
  const premium = rows.filter((row) => PREMIUM_NOTES_RE.test(row.notes ?? ''));
  if (premium.length > 0) {
    const selected = premium.reduce((best, row) =>
      row.tecnicoUsd > best.tecnicoUsd ? row : best,
    );
    const variantLabel = formatSeminuevaVariantLabel(selected.notes);
    return variantLabel != null
      ? { tecnicoUsd: selected.tecnicoUsd, variantLabel }
      : { tecnicoUsd: selected.tecnicoUsd };
  }
  return { tecnicoUsd: Math.max(...rows.map((row) => row.tecnicoUsd)) };
}

function formatSeminuevaVariantLabel(notes: string | undefined): string | undefined {
  const raw = notes?.replace(/\s+/g, ' ').trim();
  if (!raw) return undefined;
  if (/cilindro.*cuchilla|cuchilla.*cilindro/i.test(raw)) return 'Cilindro y cuchilla nueva';
  if (/^u\.\s*imagen|^unidad de imagen/i.test(raw)) return raw;
  if (/imagen nueva|imagen 4500|rod\.\s*limp|rod\.\s*carga/i.test(raw)) return raw;
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function seminuevaGroupHasVariants(rows: SeminuevaPlanillaRow[]): boolean {
  if (rows.length > 1) return true;
  const notes = rows.map((row) => row.notes ?? '').join(' ');
  return /\b120\b.*\b220\b|\b110\b.*\b220\b/i.test(notes);
}

/** Planilla seminuevos — alineada a lista comercial (ITM + técnico USD). */
const SEMINUEVA_PLANILLA_ROWS: readonly SeminuevaPlanillaRow[] = [
  { key: 'm320f', stock: 9, tecnicoUsd: 119, notes: 'falta guía ADF' },
  { key: 'im430', stock: 8, tecnicoUsd: 329, notes: 'U. Imagen nueva P502' },
  { key: 'im550-clp', mergeInto: 'im550f', stock: 6, tecnicoUsd: 369, notes: 'Ligero Punto' },
  { key: 'im550', mergeInto: 'im550f', stock: 3, tecnicoUsd: 490, notes: 'Cilindro y cuchilla nueva' },
  { key: 'im600', stock: 5, tecnicoUsd: 439, notes: '120 Y 220' },
  { key: 'im2500', stock: 1, tecnicoUsd: 679 },
  { key: 'im4000', stock: 1, tecnicoUsd: 1100, notes: '120v' },
  { key: 'im7000', stock: 1, tecnicoUsd: 2649 },
  { key: 'sp4510', stock: 10, tecnicoUsd: 119, notes: 'U. Imagen 120v' },
  { key: 'mp301', stock: 5, tecnicoUsd: 99 },
  { key: 'mp402', stock: 11, tecnicoUsd: 139, notes: 'U. Imagen 4500' },
  { key: 'mp501', stock: 1, tecnicoUsd: 249 },
  { key: 'mp3055', stock: 1, tecnicoUsd: 549 },
  { key: 'mp4055', stock: 1, tecnicoUsd: 649 },
  { key: 'mp5055', stock: 3, tecnicoUsd: 759 },
  { key: 'sp4520', stock: 2, tecnicoUsd: 99, notes: 'U. Imagen nueva' },
  { key: 'sp5300', stock: 6, tecnicoUsd: 179 },
  { key: 'sp377', stock: 18, tecnicoUsd: 59, notes: 'Monocromático' },
  { key: 'sp3710', stock: 0, tecnicoUsd: 0 },
  { key: 'p502', stock: 12, tecnicoUsd: 399 },
  { key: 'mueble-mp501', stock: 5, tecnicoUsd: 20, notes: 'gris y melamine' },
  { key: 'mueble-im550', stock: 15, tecnicoUsd: 25 },
  { key: 'cass-im550', stock: 21, tecnicoUsd: 15, notes: '2x30' },
  { key: 'cw2201', stock: 2, tecnicoUsd: 2499, notes: '120v' },
  { key: 'imc400', stock: 4, tecnicoUsd: 429, notes: '120V' },
  { key: 'imc300f', stock: 0, tecnicoUsd: 499 },
  { key: 'imc2000', mergeInto: 'imc2000', stock: 2, tecnicoUsd: 689 },
  { key: 'imc2000b', mergeInto: 'imc2000', stock: 2, tecnicoUsd: 719, notes: 'Cilindro cuchilla, rod. Carga' },
  { key: 'imc3000', stock: 2, tecnicoUsd: 799 },
  { key: 'imc4500', stock: 2, tecnicoUsd: 1149, notes: '120V' },
  { key: 'mpc2004', stock: 2, tecnicoUsd: 699, notes: 'inc. Rod. Limp. carga, cilindro 120 y 220 V' },
  { key: 'mpc3004', stock: 3, tecnicoUsd: 669 },
  { key: 'mc251', stock: 4, tecnicoUsd: 159 },
  { key: 'mpc307', stock: 1, tecnicoUsd: 319 },
  { key: 'spc352sp', stock: 5, tecnicoUsd: 119 },
  { key: 'spc352dn', stock: 2, tecnicoUsd: 99 },
  { key: 'spc840', stock: 8, tecnicoUsd: 359 },
  { key: 'laptop-dell', stock: 2, tecnicoUsd: 189, notes: 'teclado nuevo' },
  { key: 'pc-7040', stock: 52, tecnicoUsd: 129, notes: 'USB 6' },
  { key: 'pc-7040-monitor', stock: 52, tecnicoUsd: 129, notes: 'Monitor incluido' },
  { key: 'pc-micro', stock: 25, tecnicoUsd: 175, notes: '1T USB 6' },
  { key: 'monitor-dell', stock: 38, tecnicoUsd: 39 },
];

const SEMINUEVA_PRODUCT_META: Record<string, SeminuevaProductMeta> = {
  m320f: {
    id: 'semi-m320f',
    name: 'Multifuncional RICOH M 320F',
    brand: 'RICOH',
    code: 'M320F-SN',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '32 ppm',
    monthlyYield: '3.500 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  im430: {
    id: 'semi-im430f',
    name: 'Multifuncional RICOH IM 430F',
    brand: 'RICOH',
    code: '418491-SN',
    image: '/products/ricoh-im-430f.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '43 ppm',
    monthlyYield: '20.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  im550f: {
    id: 'semi-im550f',
    name: 'Multifuncional RICOH IM 550F',
    brand: 'RICOH',
    code: '418460-SN',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '55 ppm',
    monthlyYield: '35.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  im600: {
    id: 'semi-im600f',
    name: 'Multifuncional RICOH IM 600F',
    brand: 'RICOH',
    code: '418464-SN',
    image: '/products/ricoh-im-600f-110v.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '60 ppm',
    monthlyYield: '40.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  im2500: {
    id: 'semi-im2500',
    name: 'Multifuncional RICOH IM 2500',
    brand: 'RICOH',
    code: '418843-SN',
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '25 ppm',
    monthlyYield: '20.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  im4000: {
    id: 'semi-im4000',
    name: 'Multifuncional RICOH IM 4000',
    brand: 'RICOH',
    code: '418846-SN',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '40 ppm',
    monthlyYield: '30.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  im7000: {
    id: 'semi-im7000',
    name: 'Multifuncional RICOH IM 7000',
    brand: 'RICOH',
    code: 'IM7000-SN',
    image: '/products/c44519d7-f600-43e5-8c08-b51f56d88b03.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '70 ppm',
    monthlyYield: '50.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  sp4510: {
    id: '452b7860-4bc7-4b89-ba43-41e94158686d',
    name: 'Multifuncional RICOH SP 4510',
    brand: 'RICOH',
    code: '408535-CPNO1H-CPRE2V',
    image: '/products/452b7860-4bc7-4b89-ba43-41e94158686d.webp',
    href: productPath(
      'impresora-multifuncional-seminueva-ricoh-sp-4510sf-c-unidad-de-imagen-nueva-220v',
    ),
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '40 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  mp301: {
    id: 'ricoh-mp-301-sn',
    name: 'Multifuncional RICOH MP 301',
    brand: 'RICOH',
    code: 'MP301-SN',
    image: '/products/393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce.webp',
    href: productPath('impresora-multifuncional-seminueva-ricoh-mp-301-ricoh-mp-301-sn'),
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '28 ppm',
    monthlyYield: '8.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  mp402: {
    id: 'semi-mp402',
    name: 'Multifuncional RICOH MP 402',
    brand: 'RICOH',
    code: 'MP402-SN',
    image: '/products/393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '40 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  mp501: {
    id: 'semi-mp501',
    name: 'Multifuncional RICOH MP 501',
    brand: 'RICOH',
    code: 'MP501-SN',
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '55 ppm',
    monthlyYield: '15.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  mp3055: {
    id: 'semi-mp3055',
    name: 'Multifuncional RICOH MP 3055',
    brand: 'RICOH',
    code: 'MP3055-SN',
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '35 ppm',
    monthlyYield: '15.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  mp4055: {
    id: 'semi-mp4055',
    name: 'Multifuncional RICOH MP 4055',
    brand: 'RICOH',
    code: 'MP4055-SN',
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '40 ppm',
    monthlyYield: '20.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  mp5055: {
    id: 'semi-mp5055',
    name: 'Multifuncional RICOH MP 5055',
    brand: 'RICOH',
    code: 'MP5055-SN',
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    isColor: false,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '50 ppm',
    monthlyYield: '25.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  sp4520: {
    id: 'semi-sp4520',
    name: 'Impresora láser RICOH SP 4520DN',
    brand: 'RICOH',
    code: 'SP4520-SN',
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    isColor: false,
    kind: 'printer',
    paperSize: 'A4',
    speedPpm: '40 ppm',
    monthlyYield: '8.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
  },
  sp5300: {
    id: 'semi-sp5300',
    name: 'Impresora láser RICOH SP 5300DN',
    brand: 'RICOH',
    code: 'SP5300-SN',
    image: '/products/73ab69b8-602b-4203-a389-070ef7bb80b0.webp',
    isColor: false,
    kind: 'printer',
    paperSize: 'A4',
    speedPpm: '45 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
  },
  sp377: {
    id: 'semi-sp377',
    name: 'Impresora láser RICOH SP 377DN',
    brand: 'RICOH',
    code: 'SP377-SN',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    isColor: false,
    kind: 'printer',
    paperSize: 'A4',
    speedPpm: '28 ppm',
    monthlyYield: '4.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
  },
  sp3710: {
    id: 'semi-sp3710',
    name: 'Impresora láser RICOH SP 3710DN',
    brand: 'RICOH',
    code: 'SP3710-SN',
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    isColor: false,
    kind: 'printer',
    paperSize: 'A4',
    speedPpm: '32 ppm',
    monthlyYield: '6.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
  },
  p502: {
    id: 'dd031da8-d2cd-4219-b582-c97514e144c9',
    name: 'Impresora láser RICOH P 502',
    brand: 'RICOH',
    code: '418495-SN',
    image: '/products/dd031da8-d2cd-4219-b582-c97514e144c9.webp',
    href: productPath('impresora-laser-b-n-nueva-ricoh-p-502-c97514e144c9'),
    isColor: false,
    kind: 'printer',
    paperSize: 'A4',
    speedPpm: '43 ppm',
    monthlyYield: '8.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
  },
  'mueble-mp501': {
    id: 'semi-mueble-mp501',
    name: 'Mueble MP 501 (gris) y melamine',
    brand: 'RICOH',
    code: 'MUEBLE-MP501',
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    isColor: false,
    kind: 'accessory',
    tabIds: ['accesorios'],
    showcaseCategoryIds: ['accesorios'],
  },
  'mueble-im550': {
    id: 'semi-mueble-im550',
    name: 'Mueble IM 550',
    brand: 'RICOH',
    code: 'MUEBLE-IM550',
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    isColor: false,
    kind: 'accessory',
    tabIds: ['accesorios'],
    showcaseCategoryIds: ['accesorios'],
  },
  'cass-im550': {
    id: 'semi-cass-im550',
    name: 'Cassetera 2 IM 550',
    brand: 'RICOH',
    code: 'CASS-IM550',
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    isColor: false,
    kind: 'accessory',
    tabIds: ['accesorios'],
    showcaseCategoryIds: ['accesorios'],
  },
  cw2201: {
    id: 'ricoh-mp-cw2201-sn',
    name: 'Multifuncional de Planos RICOH MP CW2201',
    brand: 'RICOH',
    code: 'CW2201-SN',
    image: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
    href: productPath('impresora-multifuncional-de-planos-seminueva-ricoh-mp-cw2201-ricoh-mp-cw2201-sn'),
    isColor: false,
    kind: 'plotter',
    paperSize: 'A1',
    scannerType: 'SPDF',
    speedPpm: '70 ppm',
    monthlyYield: '50.000 pág/mes',
    tabIds: ['multifuncionales'],
    showcaseCategoryIds: ['formato-ancho'],
  },
  imc400: {
    id: 'semi-imc400f',
    name: 'Multifuncional color RICOH IM C400F',
    brand: 'RICOH',
    code: 'IMC400F-SN',
    image: '/products/color-ricoh-im-c400f-120v.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '25 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  imc300f: {
    id: '03b408ff-0b06-4ec5-90ed-94dcb40fd67c',
    name: 'Multifuncional color RICOH IM C300F',
    brand: 'RICOH',
    code: 'DD5EFA367',
    image: '/products/03b408ff-0b06-4ec5-90ed-94dcb40fd67c.webp',
    href: productPath('impresora-multifuncional-seminueva-ricoh-im-c300f-94dcb40fd67c'),
    isColor: true,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '30 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  imc2000: {
    id: 'semi-imc2000',
    name: 'Multifuncional color RICOH IM C2000',
    brand: 'RICOH',
    code: 'IMC2000-SN',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '20 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  imc3000: {
    id: 'semi-imc3000',
    name: 'Multifuncional color RICOH IM C3000',
    brand: 'RICOH',
    code: 'IMC3000-SN',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '30 ppm',
    monthlyYield: '12.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  imc4500: {
    id: 'semi-imc4500',
    name: 'Multifuncional color RICOH IM C4500',
    brand: 'RICOH',
    code: 'IMC4500-SN',
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '35 ppm',
    monthlyYield: '15.000 pág/mes',
    tabIds: ['multifuncionales'],
  },
  mpc2004: {
    id: 'semi-mpc2004',
    name: 'Multifuncional color RICOH MP C2004',
    brand: 'RICOH',
    code: 'MPC2004-SN',
    image: '/products/color-ricoh-mp-c2004-220v.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '20 ppm',
    monthlyYield: '10.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  mpc3004: {
    id: 'semi-mpc3004',
    name: 'Multifuncional color RICOH MP C3004',
    brand: 'RICOH',
    code: 'MPC3004-SN',
    image: '/products/color-ricoh-mp-c3004.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A3',
    scannerType: 'SPDF',
    speedPpm: '25 ppm',
    monthlyYield: '12.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  mc251: {
    id: 'semi-mc250fw',
    name: 'Multifuncional color RICOH M C250FW',
    brand: 'RICOH',
    code: 'MC250FW-SN',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '25 ppm',
    monthlyYield: '2.500 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  mpc307: {
    id: 'semi-mpc307',
    name: 'Multifuncional color RICOH MP C307',
    brand: 'RICOH',
    code: 'MPC307-SN',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '25 ppm',
    monthlyYield: '5.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  spc352sp: {
    id: 'semi-spc352sp',
    name: 'Multifuncional color RICOH SP C352SF',
    brand: 'RICOH',
    code: 'SPC352SP-SN',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    isColor: true,
    kind: 'equipment',
    paperSize: 'A4',
    scannerType: 'SPDF',
    speedPpm: '25 ppm',
    monthlyYield: '3.000 pág/mes',
    tabIds: ['multifuncionales', 'ofertas'],
  },
  spc352dn: {
    id: 'semi-spc352dn',
    name: 'Impresora láser color RICOH SP C352DN',
    brand: 'RICOH',
    code: 'SPC352DN-SN',
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    isColor: true,
    kind: 'printer',
    paperSize: 'A4',
    speedPpm: '25 ppm',
    monthlyYield: '3.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
  },
  spc840: {
    id: 'semi-spc840',
    name: 'Impresora láser color RICOH SP C840DN',
    brand: 'RICOH',
    code: 'SPC840-SN',
    image: '/products/l-ser-color-ricoh-sp-c840dn.webp',
    isColor: true,
    kind: 'printer',
    paperSize: 'A3',
    speedPpm: '40 ppm',
    monthlyYield: '8.000 pág/mes',
    tabIds: ['impresoras', 'ofertas'],
    href: productPath('impresora-multifuncional-seminueva-ricoh-sp-c840dn-110v-c362322d7f9d'),
  },
  'laptop-dell': {
    id: 'semi-laptop-dell',
    name: 'Laptop DELL Core i5 6ta (teclado nuevo)',
    brand: 'DELL',
    code: 'LAP-DELL-I5',
    image: SHOWCASE_SEMI_LAPTOP_IMAGE,
    isColor: false,
    kind: 'laptop',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['laptops'],
  },
  'pc-7040': {
    id: 'semi-pc-7040',
    name: 'PC Optiplex i5 7040 8GB 6ta generación 1T USB 6',
    brand: 'DELL',
    code: 'PC-7040-SN',
    image: SHOWCASE_SEMI_PC_IMAGE,
    isColor: false,
    kind: 'pc',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['laptops'],
  },
  'pc-7040-monitor': {
    id: 'semi-pc-7040-monitor',
    name: 'PC Optiplex i5 7040 8GB 6ta generación 1T USB 6 + Monitor incluido',
    brand: 'DELL',
    code: 'PC-7040-MON',
    image: SHOWCASE_SEMI_PC_IMAGE,
    isColor: false,
    kind: 'pc',
    includeMonitor: true,
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['laptops'],
  },
  'pc-micro': {
    id: 'semi-pc-micro',
    name: 'PC Optiplex Micro i5 3070 8GB 500GB 9na generación 1T USB 6',
    brand: 'DELL',
    code: 'PC-3070-SN',
    image: SHOWCASE_SEMI_PC_IMAGE,
    isColor: false,
    kind: 'pc',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['laptops'],
  },
  'monitor-dell': {
    id: 'semi-monitor-dell',
    name: 'Monitor DELL 18.5',
    brand: 'DELL',
    code: 'MON-DELL-185',
    image: '/categories/monitores.png',
    isColor: false,
    kind: 'monitor',
    tabIds: ['ofertas'],
    showcaseCategoryIds: ['monitores'],
  },
};

function buildSeminuevaShowcaseProducts(): HaitechShopProduct[] {
  const grouped = new Map<string, SeminuevaPlanillaRow[]>();

  for (const row of SEMINUEVA_PLANILLA_ROWS) {
    const groupId = row.mergeInto ?? row.key;
    const bucket = grouped.get(groupId) ?? [];
    bucket.push(row);
    grouped.set(groupId, bucket);
  }

  const products: HaitechShopProduct[] = [];

  for (const [groupId, rows] of grouped) {
    const meta = SEMINUEVA_PRODUCT_META[groupId];
    if (!meta) continue;

    const stock = rows.reduce((sum, row) => sum + row.stock, 0);
    const { tecnicoUsd, variantLabel } = pickPriceVariant(rows);
    const isLaptopLike = meta.kind === 'laptop' || meta.kind === 'pc';
    const isAccessoryLike = meta.kind === 'accessory';
    const isMonitorLike = meta.kind === 'monitor';
    const { price, compareAt } =
      isMonitorLike
        ? monitorPublicPrices()
        : tecnicoUsd > 0
          ? isLaptopLike
            ? laptopPricesFromTecnicoUsd(tecnicoUsd, meta.includeMonitor ? 50 : 0)
            : isAccessoryLike
              ? accessoryPricesFromTecnicoUsd(tecnicoUsd)
              : pricesFromTecnicoUsd(tecnicoUsd, meta.isColor)
          : { price: 0, compareAt: 0 };
    const hasVariants = seminuevaGroupHasVariants(rows);

    const isEquipmentLike =
      meta.kind === 'equipment' || meta.kind === 'printer' || meta.kind === 'plotter';

    const product: HaitechShopProduct = {
      id: meta.id,
      name: meta.name,
      brand: meta.brand,
      code: meta.code,
      stock,
      image: meta.image,
      price,
      compareAt,
      discountLabel: '11% DSCT',
      condition: 'seminuevo',
      tabIds: meta.tabIds,
      ...(hasVariants ? { hasVariants: true } : {}),
      ...(variantLabel ? { showcaseVariantLabel: variantLabel } : {}),
      ...(meta.showcaseCategoryIds ? { showcaseCategoryIds: meta.showcaseCategoryIds } : {}),
      ...(meta.href ? { href: meta.href } : {}),
      ...(meta.kind === 'laptop' ? { showcaseLaptopDevice: 'laptop' as const } : {}),
      ...(meta.kind === 'pc' ? { showcaseLaptopDevice: 'pc' as const } : {}),
      ...(isLaptopLike ? { showcaseLaptopCpu: 'i5' as const } : {}),
    };

    if (isEquipmentLike) {
      product.features =
        meta.kind === 'printer' ? PRINTER_FEATURES : [...EQUIPMENT_FEATURES];
      product.equipment = {
        ...(meta.speedPpm ? { speedPpm: meta.speedPpm } : {}),
        ...(meta.paperSize ? { paperSize: meta.paperSize } : {}),
        ...(meta.scannerType ? { scannerType: meta.scannerType } : {}),
        ...(meta.monthlyYield ? { monthlyYield: meta.monthlyYield } : {}),
      };
    }

    products.push(product);
  }

  return products.sort((a, b) => a.price - b.price);
}

/** Pool vitrina: planilla seminuevos completa (variantes fusionadas, precio cilindro/unidad imagen nueva). */
export const HAITECH_SHOWCASE_SEMINUEVAS: readonly HaitechShopProduct[] =
  buildSeminuevaShowcaseProducts();

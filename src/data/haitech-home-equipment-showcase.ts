import { categoryLandingPath } from '@/lib/category-path';
import { productPath } from '@/lib/product-path';
import { DEFAULT_USD_TO_PEN } from '@/lib/exchange-rate';
import { roundPenToNearestNine } from '@/lib/pen-pricing';
import {
  HAITECH_SHOP_FAVORITE_PRODUCTS,
  HAITECH_SHOP_LATEST_PRODUCTS,
  type HaitechShopProduct,
} from '@/data/haitech-home-shop';
import { resolveEquipmentShowcaseCode } from '@/data/haitech-equipment-part-codes';
import { HAITECH_SHOWCASE_SEMINUEVAS } from '@/data/haitech-showcase-seminuevas-lista';
import { HAITECH_SHOWCASE_ESCANERES } from '@/data/haitech-showcase-escaneres';
import {
  HAITECH_SHOWCASE_SOFTWARE,
  HAITECH_SHOWCASE_SOFTWARE_CATEGORY_IMAGE,
} from '@/data/haitech-showcase-software';
import { HAITECH_SHOWCASE_COLABORACION } from '@/data/haitech-showcase-colaboracion';

export type HaitechEquipmentShowcaseCategoryId =
  | 'multifuncionales'
  | 'formato-ancho'
  | 'impresoras'
  | 'laptops'
  | 'monitores'
  | 'pantallas-interactivas'
  | 'videoconferencia'
  | 'toner'
  | 'repuestos'
  | 'escaneres'
  | 'camaras'
  | 'accesorios'
  | 'software';

export type HaitechEquipmentSpecFilterId = 'todos' | 'a4' | 'a3' | 'a0' | 'a1' | 'color' | 'bn';

export type HaitechConsumableOriginFilterId =
  | 'todos'
  | 'originales'
  | 'compatibles'
  | 'remanufacturados';

/** Subcategorías de Impresoras (barra Filtrar). */
export type HaitechImpresoraSubtypeFilterId = 'laser' | 'tinta' | 'termica' | 'matricial';

/** Filtros vitrina PC / Laptops. */
export type HaitechLaptopFilterId = 'todos' | 'pc' | 'laptop' | 'i5' | 'i7';

/** Filtros vitrina Formato Ancho. */
export type HaitechFormatoAnchoFilterId =
  | 'todos'
  | 'a0'
  | 'a1'
  | 'bn'
  | 'color'
  | 'plotter'
  | 'multifuncional';

export type HaitechShowcaseFilterId =
  | HaitechEquipmentSpecFilterId
  | HaitechConsumableOriginFilterId
  | HaitechImpresoraSubtypeFilterId
  | HaitechLaptopFilterId
  | HaitechFormatoAnchoFilterId;

export type HaitechEquipmentConditionId = 'nuevas' | 'seminuevas' | 'remanufacturadas';

export type HaitechShowcaseFilterMode = 'equipment' | 'consumable' | 'none';

export type HaitechConsumableOrigin = 'original' | 'compatible' | 'remanufacturado';

export type HaitechEquipmentShowcaseCategory = {
  id: HaitechEquipmentShowcaseCategoryId;
  label: string;
  image: string;
  to: string;
  filterMode: HaitechShowcaseFilterMode;
  /** IDs de tab en HAITECH_SHOP_FAVORITE_PRODUCTS, o null si aún no hay pool local. */
  shopTabId: 'multifuncionales' | 'impresoras' | 'toner' | 'accesorios' | null;
};

const CHIP = '/home/category-chips/equipment';

export const HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES: readonly HaitechEquipmentShowcaseCategory[] = [
  {
    id: 'multifuncionales',
    label: 'Multifuncionales',
    image: `${CHIP}/multifuncionales.webp`,
    to: categoryLandingPath('multifuncionales'),
    filterMode: 'equipment',
    shopTabId: 'multifuncionales',
  },
  {
    id: 'formato-ancho',
    label: 'Formato Ancho',
    image: `${CHIP}/formato-ancho.webp`,
    to: categoryLandingPath('formato-ancho'),
    filterMode: 'equipment',
    shopTabId: null,
  },
  {
    id: 'impresoras',
    label: 'Impresoras',
    image: `${CHIP}/impresoras.webp`,
    to: categoryLandingPath('impresoras'),
    filterMode: 'equipment',
    shopTabId: 'impresoras',
  },
  {
    id: 'laptops',
    label: 'PC / Laptops',
    image: `${CHIP}/laptops.webp`,
    to: categoryLandingPath('computadoras-laptop'),
    filterMode: 'equipment',
    shopTabId: null,
  },
  {
    id: 'monitores',
    label: 'Monitores',
    image: '/categories/monitores.png',
    to: categoryLandingPath('monitores'),
    filterMode: 'none',
    shopTabId: null,
  },
  {
    id: 'pantallas-interactivas',
    label: 'Pantallas Interactivas',
    image: `${CHIP}/pantallas-interactivas.webp`,
    to: categoryLandingPath('soluciones-colaboracion'),
    filterMode: 'none',
    shopTabId: null,
  },
  {
    id: 'videoconferencia',
    label: 'Videoconferencia',
    image: `${CHIP}/videoconferencia.webp`,
    to: categoryLandingPath('soluciones-colaboracion'),
    filterMode: 'none',
    shopTabId: null,
  },
  {
    id: 'escaneres',
    label: 'Escáneres',
    image: `${CHIP}/escaneres.webp`,
    to: categoryLandingPath('escaneres'),
    filterMode: 'none',
    shopTabId: null,
  },
  {
    id: 'camaras',
    label: 'Cámaras',
    image: '/categories/camaras.png',
    to: categoryLandingPath('camaras'),
    filterMode: 'none',
    shopTabId: null,
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    image: `${CHIP}/accesorios.webp`,
    to: categoryLandingPath('accesorios'),
    filterMode: 'none',
    shopTabId: 'accesorios',
  },
  {
    id: 'software',
    label: 'Software',
    image: HAITECH_SHOWCASE_SOFTWARE_CATEGORY_IMAGE,
    to: '/software',
    filterMode: 'none',
    shopTabId: null,
  },
] as const;

export const HAITECH_EQUIPMENT_SPEC_FILTERS: readonly {
  id: HaitechEquipmentSpecFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'a4', label: 'A4' },
  { id: 'a3', label: 'A3' },
  { id: 'bn', label: 'Blanco y Negro' },
  { id: 'color', label: 'Color' },
] as const;

/** Filtros de formato papel (vitrina equipos). */
export const HAITECH_EQUIPMENT_FORMAT_FILTERS: readonly {
  id: HaitechEquipmentSpecFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'a4', label: 'A4' },
  { id: 'a3', label: 'A3' },
] as const;

/** Filtros de modo de impresión (vitrina equipos). */
export const HAITECH_EQUIPMENT_COLOR_MODE_FILTERS: readonly {
  id: HaitechEquipmentSpecFilterId;
  label: string;
}[] = [
  { id: 'bn', label: 'Blanco y Negro' },
  { id: 'color', label: 'Color' },
] as const;

/** Filtros visibles en vitrina de equipos (formato + color, sin «Todos»). */
export const HAITECH_EQUIPMENT_FORMAT_COLOR_FILTERS: readonly {
  id: HaitechEquipmentSpecFilterId;
  label: string;
}[] = [
  { id: 'a4', label: 'A4' },
  { id: 'a3', label: 'A3' },
  { id: 'bn', label: 'Blanco y Negro' },
  { id: 'color', label: 'Color' },
] as const;

/** Filtros vitrina Formato Ancho (formato → color → tipo de equipo). */
export const HAITECH_FORMATO_ANCHO_FORMAT_FILTERS: readonly {
  id: HaitechFormatoAnchoFilterId;
  label: string;
}[] = [
  { id: 'a0', label: 'A0' },
  { id: 'a1', label: 'A1' },
] as const;

export const HAITECH_FORMATO_ANCHO_COLOR_FILTERS: readonly {
  id: HaitechFormatoAnchoFilterId;
  label: string;
}[] = [
  { id: 'bn', label: 'Blanco y Negro' },
  { id: 'color', label: 'Color' },
] as const;

export const HAITECH_FORMATO_ANCHO_DEVICE_FILTERS: readonly {
  id: HaitechFormatoAnchoFilterId;
  label: string;
}[] = [
  { id: 'plotter', label: 'Plotter' },
  { id: 'multifuncional', label: 'Multifuncional' },
] as const;

export const HAITECH_FORMATO_ANCHO_FILTERS: readonly {
  id: HaitechFormatoAnchoFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  ...HAITECH_FORMATO_ANCHO_FORMAT_FILTERS,
  ...HAITECH_FORMATO_ANCHO_COLOR_FILTERS,
  ...HAITECH_FORMATO_ANCHO_DEVICE_FILTERS,
] as const;

/** Formato + color + tipo activos a la vez en vitrina Formato Ancho. */
export type HaitechFormatoAnchoActiveFilters = {
  format: 'a0' | 'a1' | null;
  printMode: 'color' | 'bn' | null;
  deviceClass: 'plotter' | 'multifuncional' | null;
};

export const EMPTY_FORMATO_ANCHO_SPEC_FILTERS: HaitechFormatoAnchoActiveFilters = {
  format: null,
  printMode: null,
  deviceClass: null,
};

export function isFormatoAnchoSpecFiltersEmpty(filters: HaitechFormatoAnchoActiveFilters): boolean {
  return filters.format == null && filters.printMode == null && filters.deviceClass == null;
}

export function toggleFormatoAnchoSpecFilter(
  current: HaitechFormatoAnchoActiveFilters,
  filterId: HaitechFormatoAnchoFilterId,
): HaitechFormatoAnchoActiveFilters {
  if (filterId === 'todos') return { ...EMPTY_FORMATO_ANCHO_SPEC_FILTERS };

  if (filterId === 'a0' || filterId === 'a1') {
    return {
      ...current,
      format: current.format === filterId ? null : filterId,
    };
  }

  if (filterId === 'color' || filterId === 'bn') {
    return {
      ...current,
      printMode: current.printMode === filterId ? null : filterId,
    };
  }

  if (filterId === 'plotter' || filterId === 'multifuncional') {
    return {
      ...current,
      deviceClass: current.deviceClass === filterId ? null : filterId,
    };
  }

  return current;
}

export function isFormatoAnchoSpecFilterActive(
  filters: HaitechFormatoAnchoActiveFilters,
  filterId: HaitechFormatoAnchoFilterId,
): boolean {
  if (filterId === 'todos') return isFormatoAnchoSpecFiltersEmpty(filters);
  if (filterId === 'a0' || filterId === 'a1') return filters.format === filterId;
  if (filterId === 'color' || filterId === 'bn') return filters.printMode === filterId;
  if (filterId === 'plotter' || filterId === 'multifuncional') {
    return filters.deviceClass === filterId;
  }
  return false;
}

export function resolveFormatoAnchoDeviceClass(
  product: HaitechShopProduct,
): 'plotter' | 'multifuncional' | null {
  const name = product.name.toLowerCase();
  if (/multifuncional de planos|mp cw2201\b/i.test(name)) return 'multifuncional';
  if (/plotter|designjet|im cw2200\b/i.test(name)) return 'plotter';
  if (/multifuncional/i.test(name) && /planos|formato ancho|cw220/i.test(name)) {
    return 'multifuncional';
  }
  if (/plotter|designjet/i.test(name)) return 'plotter';
  return null;
}

export function matchesFormatoAnchoActiveSpecFilters(
  product: HaitechShopProduct,
  filters: HaitechFormatoAnchoActiveFilters,
): boolean {
  if (isFormatoAnchoSpecFiltersEmpty(filters)) return true;

  const specs = resolveEquipmentCardSpecs(product);
  if (filters.format === 'a0' && !equipmentMatchesPaperFormat(specs.paperSize, 'a0')) return false;
  if (filters.format === 'a1' && !equipmentMatchesPaperFormat(specs.paperSize, 'a1')) return false;
  if (filters.printMode === 'color' && specs.printMode !== 'Color') return false;
  if (filters.printMode === 'bn' && specs.printMode !== 'B/N') return false;
  if (filters.deviceClass != null) {
    const deviceClass = resolveFormatoAnchoDeviceClass(product);
    if (deviceClass !== filters.deviceClass) return false;
  }
  return true;
}

/** Filtros vitrina PC / Laptops. */
export const HAITECH_LAPTOP_FILTERS: readonly {
  id: HaitechLaptopFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'pc', label: 'PC' },
  { id: 'laptop', label: 'Laptop' },
  { id: 'i5', label: 'Intel i5' },
  { id: 'i7', label: 'Intel i7' },
] as const;

/** Tipo de equipo + procesador activos en vitrina PC / Laptops. */
export type HaitechLaptopActiveFilters = {
  device: 'pc' | 'laptop' | null;
  cpu: 'i5' | 'i7' | null;
};

export const EMPTY_LAPTOP_SPEC_FILTERS: HaitechLaptopActiveFilters = {
  device: null,
  cpu: null,
};

export function isLaptopSpecFiltersEmpty(filters: HaitechLaptopActiveFilters): boolean {
  return filters.device == null && filters.cpu == null;
}

export function toggleLaptopSpecFilter(
  current: HaitechLaptopActiveFilters,
  filterId: HaitechLaptopFilterId,
): HaitechLaptopActiveFilters {
  if (filterId === 'todos') return { ...EMPTY_LAPTOP_SPEC_FILTERS };

  if (filterId === 'pc' || filterId === 'laptop') {
    return {
      ...current,
      device: current.device === filterId ? null : filterId,
    };
  }
  return {
    ...current,
    cpu: current.cpu === filterId ? null : filterId,
  };
}

export function isLaptopSpecFilterActive(
  filters: HaitechLaptopActiveFilters,
  filterId: HaitechLaptopFilterId,
): boolean {
  if (filterId === 'todos') return isLaptopSpecFiltersEmpty(filters);
  if (filterId === 'pc' || filterId === 'laptop') return filters.device === filterId;
  return filters.cpu === filterId;
}

export function resolveLaptopShowcaseTraits(product: HaitechShopProduct): {
  device: 'pc' | 'laptop' | null;
  cpu: 'i5' | 'i7' | null;
} {
  const name = product.name.toLowerCase();
  const device =
    product.showcaseLaptopDevice ??
    (/\blaptop\b|\bnotebook\b|\bmacbook\b/.test(name)
      ? 'laptop'
      : /\bpc\b|\boptiplex\b|\bdesktop\b/.test(name)
        ? 'pc'
        : null);
  const cpu =
    product.showcaseLaptopCpu ??
    (/\bi7\b|\bcore\s*i7\b/.test(name) ? 'i7' : /\bi5\b|\bcore\s*i5\b/.test(name) ? 'i5' : null);
  return { device, cpu };
}

export function matchesLaptopActiveSpecFilters(
  product: HaitechShopProduct,
  filters: HaitechLaptopActiveFilters,
): boolean {
  if (isLaptopSpecFiltersEmpty(filters)) return true;
  const traits = resolveLaptopShowcaseTraits(product);
  if (filters.device != null && traits.device !== filters.device) return false;
  if (filters.cpu != null && traits.cpu !== filters.cpu) return false;
  return true;
}

/** Formato + modo de impresión activos a la vez (p. ej. A4 + Color). */
export type HaitechEquipmentActiveSpecFilters = {
  format: 'a4' | 'a3' | 'a0' | 'a1' | null;
  printMode: 'color' | 'bn' | null;
};

export const EMPTY_EQUIPMENT_SPEC_FILTERS: HaitechEquipmentActiveSpecFilters = {
  format: null,
  printMode: null,
};

export function isEquipmentSpecFiltersEmpty(
  filters: HaitechEquipmentActiveSpecFilters,
): boolean {
  return filters.format == null && filters.printMode == null;
}

export function toggleEquipmentSpecFilter(
  current: HaitechEquipmentActiveSpecFilters,
  filterId: HaitechEquipmentSpecFilterId,
): HaitechEquipmentActiveSpecFilters {
  if (filterId === 'todos') return { ...EMPTY_EQUIPMENT_SPEC_FILTERS };

  if (filterId === 'a4' || filterId === 'a3' || filterId === 'a0' || filterId === 'a1') {
    return {
      ...current,
      format: current.format === filterId ? null : filterId,
    };
  }

  if (filterId === 'color' || filterId === 'bn') {
    return {
      ...current,
      printMode: current.printMode === filterId ? null : filterId,
    };
  }

  return current;
}

export function isEquipmentSpecFilterActive(
  filters: HaitechEquipmentActiveSpecFilters,
  filterId: HaitechEquipmentSpecFilterId,
): boolean {
  if (filterId === 'todos') return isEquipmentSpecFiltersEmpty(filters);
  if (filterId === 'a4' || filterId === 'a3' || filterId === 'a0' || filterId === 'a1') {
    return filters.format === filterId;
  }
  if (filterId === 'color' || filterId === 'bn') return filters.printMode === filterId;
  return false;
}

export function matchesEquipmentActiveSpecFilters(
  product: HaitechShopProduct,
  filters: HaitechEquipmentActiveSpecFilters,
): boolean {
  if (isEquipmentSpecFiltersEmpty(filters)) return true;

  const specs = resolveEquipmentCardSpecs(product);
  if (filters.format === 'a4' && !equipmentMatchesPaperFormat(specs.paperSize, 'a4')) return false;
  if (filters.format === 'a3' && !equipmentMatchesPaperFormat(specs.paperSize, 'a3')) return false;
  if (filters.format === 'a0' && !equipmentMatchesPaperFormat(specs.paperSize, 'a0')) return false;
  if (filters.format === 'a1' && !equipmentMatchesPaperFormat(specs.paperSize, 'a1')) return false;
  if (filters.printMode === 'color' && specs.printMode !== 'Color') return false;
  if (filters.printMode === 'bn' && specs.printMode !== 'B/N') return false;
  return true;
}

/** Subcategorías visibles al elegir Impresoras. */
export const HAITECH_IMPRESORAS_SUBTYPE_FILTERS: readonly {
  id: HaitechShowcaseFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todas' },
  { id: 'laser', label: 'Láser' },
  { id: 'tinta', label: 'Tinta' },
  { id: 'termica', label: 'Térmica' },
  { id: 'matricial', label: 'Matricial' },
] as const;

export const HAITECH_CONSUMABLE_ORIGIN_FILTERS: readonly {
  id: HaitechConsumableOriginFilterId;
  label: string;
}[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'originales', label: 'Originales' },
  { id: 'compatibles', label: 'Compatibles' },
  { id: 'remanufacturados', label: 'Remanufacturados' },
] as const;

export const HAITECH_EQUIPMENT_CONDITIONS: readonly {
  id: HaitechEquipmentConditionId;
  label: string;
}[] = [
  { id: 'nuevas', label: 'Nuevas' },
  { id: 'seminuevas', label: 'Seminuevas' },
  { id: 'remanufacturadas', label: 'Remanufacturadas' },
] as const;

/** PC / Laptops: solo condición nueva o seminueva. */
export const HAITECH_LAPTOP_CONDITIONS = HAITECH_EQUIPMENT_CONDITIONS.filter(
  (item) => item.id !== 'remanufacturadas',
);

/** Escáneres: solo condición nueva o seminueva. */
export const HAITECH_SCANNER_CONDITIONS: readonly {
  id: HaitechEquipmentConditionId;
  label: string;
}[] = [
  { id: 'nuevas', label: 'Nuevos' },
  { id: 'seminuevas', label: 'Seminuevos' },
] as const;

export const HAITECH_EQUIPMENT_SHOWCASE_VISIBLE = 10;
/** Productos por página al pulsar «Ver más» (2 filas × 5 columnas). */
export const HAITECH_EQUIPMENT_SHOWCASE_PAGE_SIZE = 10;

const SHOWCASE_EQUIPMENT_FEATURES = ['copia', 'escanea', 'imprime', 'rendimiento'] as const;
const SHOWCASE_PRINTER_FEATURES = ['imprime', 'rendimiento'] as const;

function showcasePenFromUsd(usd: number): number {
  return roundPenToNearestNine(usd * DEFAULT_USD_TO_PEN);
}

function showcaseCompareAtFromPen(pricePen: number, discountRatio = 0.11): number {
  if (pricePen <= 0) return 0;
  return roundPenToNearestNine(pricePen / (1 - discountRatio));
}

/** Remanufacturada: lista técnico USD → precio público +USD 100 en vitrina. */
function showcaseRemanPricesFromTecnicoUsd(tecnicoUsd: number): {
  price: number;
  compareAt: number;
} {
  const publicUsd = tecnicoUsd + 100;
  const price = showcasePenFromUsd(publicUsd);
  return {
    price,
    compareAt: showcaseCompareAtFromPen(price),
  };
}

/** Nuevo: precio corporativo USD del inventario → soles en vitrina. */
function showcasePricesFromPublicUsd(publicUsd: number): {
  price: number;
  compareAt: number;
} {
  const price = showcasePenFromUsd(publicUsd);
  return {
    price,
    compareAt: showcaseCompareAtFromPen(price),
  };
}

/** Precio fijo en soles para vitrina (con compareAt comercial). */
function showcaseFixedPenPrice(pricePen: number): { price: number; compareAt: number } {
  return {
    price: pricePen,
    compareAt: showcaseCompareAtFromPen(pricePen),
  };
}

/** Precio técnico USD por id de producto en vitrina (para vista previa admin). */
const SHOWCASE_TECNICO_PRICE_USD: Readonly<Record<string, number>> = {
  'im-430f': 899,
  'mp-305-plus': 889,
  'm-320f': 399,
  'im-460f': 1049,
  'im-550f': 1499,
  'im-600f': 1869,
  'im-2500': 3549,
  'ricoh-im-2510': 3549,
  '0aea108a-acd2-4ddd-af29-b2265097813c': 3999,
  '40c36a2a-794e-41aa-b075-d855c218bf6f': 6399,
  'c0ad567a-6ad7-4857-a087-fd574a903a04': 6899,
  '7459b432-72a0-420a-8bff-015a0072f5ac': 8499,
  'c44519d7-f600-43e5-8c08-b51f56d88b03': 11990,
  '97079efe-de43-4619-b3f2-950d323fa773': 18800,
  'ffbec10e-aaf3-4a6f-995c-9bcbfb9d39e2': 24700,
  'im-c2010': 4579,
  'im-c2510': 5889,
  'im-c3010': 8949,
  'im-c320f': 2490,
  'im-c401f': 2690,
  'im-c4510': 11850,
  'im-c6010': 13619,
  'pro-c5300': 38508,
  'p-c600': 1999,
  'p-801': 1199,
  'im-c400f-reman': 1299,
};

export function resolveShowcaseEquipmentTecnicoUsd(product: HaitechShopProduct): number | null {
  const byId = SHOWCASE_TECNICO_PRICE_USD[product.id];
  if (byId != null && byId > 0) return byId;
  return null;
}

/** Amplía el pool de la vitrina para poder cargar varias páginas con «Ver más». */
const HAITECH_SHOWCASE_REMANUFACTURADAS: readonly HaitechShopProduct[] = [
  {
    id: 'im-430f-reman',
    name: 'Multifuncional Remanufacturada RICOH IM 430F',
    brand: 'RICOH',
    code: '418491',
    stock: 4,
    image: '/products/ricoh-im-430f.webp',
    ...showcaseRemanPricesFromTecnicoUsd(799),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '43 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '20.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'mp-402-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 402',
    brand: 'RICOH',
    code: 'MP402-RM',
    stock: 6,
    image: '/products/393e6e4b-e246-4a5b-b4ba-4a58fd4b8cce.webp',
    ...showcaseRemanPricesFromTecnicoUsd(699),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '40 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'mp-401-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 401',
    brand: 'RICOH',
    code: 'MP401-RM',
    stock: 5,
    image: '/products/ricoh-mp-401-c-unidad-de-imagen-220v.webp',
    ...showcaseRemanPricesFromTecnicoUsd(649),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '35 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'sp-4510dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 4510DN',
    brand: 'RICOH',
    code: 'SP4510DN-RM',
    stock: 5,
    image: '/products/452b7860-4bc7-4b89-ba43-41e94158686d.webp',
    ...showcaseRemanPricesFromTecnicoUsd(499),
    discountLabel: '11% DSCT',
    features: SHOWCASE_PRINTER_FEATURES,
    equipment: {
      speedPpm: '40 ppm',
      paperSize: 'A4',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
  },
  {
    id: 'sp-4520dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 4520DN',
    brand: 'RICOH',
    code: 'SP4520DN-RM',
    stock: 4,
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    ...showcaseRemanPricesFromTecnicoUsd(499),
    discountLabel: '11% DSCT',
    features: SHOWCASE_PRINTER_FEATURES,
    equipment: {
      speedPpm: '40 ppm',
      paperSize: 'A4',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
  },
  {
    id: 'sp-377dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 377DN',
    brand: 'RICOH',
    code: 'SP377DN-RM',
    stock: 5,
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    ...showcaseRemanPricesFromTecnicoUsd(499),
    discountLabel: '11% DSCT',
    features: SHOWCASE_PRINTER_FEATURES,
    equipment: {
      speedPpm: '28 ppm',
      paperSize: 'A4',
      monthlyYield: '4.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
  },
  {
    id: 'sp-3710dn-reman',
    name: 'Impresora Remanufacturada RICOH SP 3710DN',
    brand: 'RICOH',
    code: 'SP3710DN-RM',
    stock: 3,
    image: '/products/bfb264b8-70dc-4ad4-9686-2df02df8c75e.webp',
    ...showcaseRemanPricesFromTecnicoUsd(499),
    discountLabel: '11% DSCT',
    features: SHOWCASE_PRINTER_FEATURES,
    equipment: {
      speedPpm: '32 ppm',
      paperSize: 'A4',
      monthlyYield: '6.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
  },
  {
    id: 'p-502-reman',
    name: 'Impresora Remanufacturada RICOH P 502',
    brand: 'RICOH',
    code: 'P502-RM',
    stock: 4,
    image: '/products/cece2c48-e44a-4b93-a11a-7e8b244ad8ea.webp',
    ...showcaseRemanPricesFromTecnicoUsd(599),
    discountLabel: '11% DSCT',
    features: SHOWCASE_PRINTER_FEATURES,
    equipment: {
      speedPpm: '43 ppm',
      paperSize: 'A4',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
  },
  {
    id: 'im-550f-reman',
    name: 'Multifuncional Remanufacturada RICOH IM 550F',
    brand: 'RICOH',
    code: '418460',
    stock: 4,
    image: '/products/328f41ef-d935-4807-85d0-e1db5bdf73fb.webp',
    ...showcaseRemanPricesFromTecnicoUsd(899),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '55 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '35.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'im-600f-reman',
    name: 'Multifuncional Remanufacturada RICOH IM 600F',
    brand: 'RICOH',
    code: '418464',
    stock: 3,
    image: '/products/ricoh-im-600f-110v.webp',
    ...showcaseRemanPricesFromTecnicoUsd(949),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '60 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '40.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'mp-501-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 501',
    brand: 'RICOH',
    code: 'MP501-RM',
    stock: 4,
    image: '/products/371c5e40-c823-4db1-b36c-895ae1fb53e1.webp',
    ...showcaseRemanPricesFromTecnicoUsd(749),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '55 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '15.000 pág/mes',
    },
    tabIds: ['multifuncionales'],
  },
  {
    id: 'mp-6055-reman',
    name: 'Multifuncional Remanufacturada RICOH MP 6055',
    brand: 'RICOH',
    code: 'MP6055-RM',
    stock: 2,
    image: '/products/ricoh-mp-6055-220v.webp',
    ...showcaseRemanPricesFromTecnicoUsd(1499),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '60 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '25.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'im-c400f-reman',
    name: 'Multifuncional Remanufacturada color RICOH IM C400F',
    brand: 'RICOH',
    code: 'IMC400F-RM',
    stock: 2,
    image: '/products/color-ricoh-im-c400f-120v.webp',
    ...showcaseRemanPricesFromTecnicoUsd(1519),
    discountLabel: '11% DSCT',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '25 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
];

/** Pool vitrina Formato Ancho (plotters + multifuncionales de planos). */
const HAITECH_SHOWCASE_FORMATO_ANCHO: readonly HaitechShopProduct[] = [
  {
    id: 'ricoh-mp-cw2201-n',
    name: 'Multifuncional de Planos RICOH MP CW2201',
    brand: 'RICOH',
    code: 'CW2201',
    stock: 0,
    image: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
    price: 0,
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '70 ppm',
      paperSize: 'A1',
      scannerType: 'SPDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales'],
    showcaseCategoryIds: ['formato-ancho'],
  },
  {
    id: '4f977d63-4903-4b1d-aff0-b2a39e7242d8',
    name: 'Plotter Multifuncional color RICOH IM CW2200',
    brand: 'RICOH',
    code: '418972',
    stock: 1,
    image: '/products/plotter-laser-color-ricoh-im-cw2200.webp',
    ...showcasePricesFromPublicUsd(18564),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '70 ppm',
      paperSize: 'A1',
      scannerType: 'SPDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales'],
    showcaseCategoryIds: ['formato-ancho'],
    href: productPath('plotter-multifuncional-laser-color-nuevo-ricoh-im-cw2200-4f977d63'),
  },
  {
    id: 'hp-700dr-sn',
    name: 'Plotter HP DesignJet 700DR',
    brand: 'HP',
    code: 'HP700DR-SN',
    stock: 0,
    image: '/categories/formato-ancho.png',
    price: 0,
    condition: 'seminuevo',
    features: SHOWCASE_PRINTER_FEATURES,
    equipment: {
      speedPpm: '—',
      paperSize: 'A0',
      monthlyYield: '—',
    },
    tabIds: ['impresoras'],
    showcaseCategoryIds: ['formato-ancho'],
  },
];

/** Amplía el pool de la vitrina para poder cargar varias páginas con «Ver más». */
const HAITECH_SHOWCASE_EXTRA_PRODUCTS: readonly HaitechShopProduct[] = [
  {
    id: 'mp-305-plus',
    name: 'Multifuncional RICOH MP 305+',
    brand: 'RICOH',
    code: 'MP-305+',
    stock: 5,
    image: '/products/ab878d89-61e0-4e51-a941-03455e1da407.webp',
    ...showcaseFixedPenPrice(3899),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '30 ppm',
      paperSize: 'A4 / A3',
      scannerType: 'ARDF',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-b-n-nueva-ricoh-mp-305-03455e1da407'),
  },
  {
    id: 'ricoh-im-2510',
    name: 'Multifuncional RICOH IM 2510',
    brand: 'RICOH',
    code: 'IM-2510',
    stock: 5,
    image: '/products/196857c6-738b-4162-90aa-50dee575bcd8.webp',
    ...showcasePricesFromPublicUsd(4019),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '25 ppm',
      paperSize: 'A3',
      scannerType: 'ARDF',
      monthlyYield: '15.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-2510-ricoh-im-2510'),
  },
  {
    id: '0aea108a-acd2-4ddd-af29-b2265097813c',
    name: 'Multifuncional RICOH IM 3000',
    brand: 'RICOH',
    code: '418844',
    stock: 2,
    image: '/products/0aea108a-acd2-4ddd-af29-b2265097813c.webp',
    ...showcasePricesFromPublicUsd(4249),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '30 ppm',
      paperSize: 'A3',
      scannerType: 'Estándar',
      monthlyYield: '30.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-3000-b2265097813c'),
  },
  {
    id: '40c36a2a-794e-41aa-b075-d855c218bf6f',
    name: 'Multifuncional RICOH IM 4000 (SPDF)',
    brand: 'RICOH',
    code: '418846',
    stock: 1,
    image: '/products/40c36a2a-794e-41aa-b075-d855c218bf6f.webp',
    ...showcasePricesFromPublicUsd(6999),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '40 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-4000-d855c218bf6f'),
  },
  {
    id: 'c0ad567a-6ad7-4857-a087-fd574a903a04',
    name: 'Multifuncional RICOH IM 5000 (SPDF)',
    brand: 'RICOH',
    code: '418847',
    stock: 1,
    image: '/products/c0ad567a-6ad7-4857-a087-fd574a903a04.webp',
    ...showcasePricesFromPublicUsd(7149),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '50 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-5000-fd574a903a04'),
  },
  {
    id: '7459b432-72a0-420a-8bff-015a0072f5ac',
    name: 'Multifuncional RICOH IM 6010 (SPDF)',
    brand: 'RICOH',
    code: '423796',
    stock: 1,
    image: '/products/ricoh-im-6010-spdf.webp',
    ...showcasePricesFromPublicUsd(8749),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '60 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '80.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-6010-7459b432-72a'),
  },
  {
    id: 'c44519d7-f600-43e5-8c08-b51f56d88b03',
    name: 'Multifuncional RICOH IM 7000',
    brand: 'RICOH',
    code: '418779',
    stock: 1,
    image: '/products/c44519d7-f600-43e5-8c08-b51f56d88b03.webp',
    ...showcasePricesFromPublicUsd(12240),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '70 ppm',
      paperSize: 'A3',
      scannerType: 'Estándar',
      monthlyYield: '200.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
    href: productPath('impresora-multifuncional-nueva-ricoh-im-7000-b51f56d88b03'),
  },
  {
    id: 'ricoh-im-3010',
    name: 'Multifuncional RICOH IM 3010',
    brand: 'RICOH',
    code: 'IM-3010',
    stock: 0,
    image: '/products/0aea108a-acd2-4ddd-af29-b2265097813c.webp',
    price: 0,
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '30 ppm',
      paperSize: 'A3',
      scannerType: 'ARDF',
      monthlyYield: '15.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'ricoh-im-4010',
    name: 'Multifuncional RICOH IM 4010',
    brand: 'RICOH',
    code: 'IM-4010',
    stock: 0,
    image: '/products/40c36a2a-794e-41aa-b075-d855c218bf6f.webp',
    price: 0,
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '40 ppm',
      paperSize: 'A3',
      scannerType: 'ARDF',
      monthlyYield: '30.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'ricoh-im-5010',
    name: 'Multifuncional RICOH IM 5010',
    brand: 'RICOH',
    code: 'IM-5010',
    stock: 0,
    image: '/products/c0ad567a-6ad7-4857-a087-fd574a903a04.webp',
    price: 0,
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '50 ppm',
      paperSize: 'A3',
      scannerType: 'ARDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: '97079efe-de43-4619-b3f2-950d323fa773',
    name: 'Multifuncional RICOH IM 8000',
    brand: 'RICOH',
    code: '418782',
    stock: 0,
    image: '/products/97079efe-de43-4619-b3f2-950d323fa773.webp',
    ...showcasePricesFromPublicUsd(19320),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '70 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '200.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'ffbec10e-aaf3-4a6f-995c-9bcbfb9d39e2',
    name: 'Multifuncional RICOH IM 9000',
    brand: 'RICOH',
    code: '418787',
    stock: 0,
    image: '/products/ffbec10e-aaf3-4a6f-995c-9bcbfb9d39e2.webp',
    ...showcasePricesFromPublicUsd(25220),
    condition: 'nuevo',
    features: SHOWCASE_EQUIPMENT_FEATURES,
    equipment: {
      speedPpm: '70 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '200.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'im-c3010',
    name: 'Multifuncional color RICOH IM C3010',
    brand: 'RICOH',
    code: 'IMC3010',
    stock: 7,
    image: '/products/9c65bcbd-3a13-41dd-81b1-95cb3256a7c1.webp',
    ...showcasePricesFromPublicUsd(9419),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '30 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '12.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'im-c2510',
    name: 'Multifuncional color RICOH IM C2510',
    brand: 'RICOH',
    code: 'IMC2510',
    stock: 9,
    image: '/products/e1bffdf0-3515-468e-859a-990d1cb12561.webp',
    ...showcasePricesFromPublicUsd(6359),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '25 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '10.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'im-c4510',
    name: 'Multifuncional color RICOH IM C4510',
    brand: 'RICOH',
    code: '418843',
    stock: 2,
    image: '/products/a9c74a93-3a15-42da-a9cf-33d59e2b1019.webp',
    ...showcasePricesFromPublicUsd(12320),
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '45 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '15.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'im-c6010',
    name: 'Multifuncional color RICOH IM C6010',
    brand: 'RICOH',
    code: '418843',
    stock: 0,
    image: '/products/e1bffdf0-3515-468e-859a-990d1cb12561.webp',
    ...showcasePricesFromPublicUsd(14089),
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '60 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'pro-c5300',
    name: 'Multifuncional color RICOH Pro C5300',
    brand: 'RICOH',
    code: '409392',
    stock: 1,
    image: '/products/de-producci-n-laser-color-ricoh-pro-c5300s.webp',
    ...showcasePricesFromPublicUsd(38948),
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '70 ppm',
      paperSize: 'A3',
      scannerType: 'SPDF',
      monthlyYield: '50.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'im-c401f',
    name: 'Multifuncional color RICOH IM C401F',
    brand: 'RICOH',
    code: '423693',
    stock: 0,
    image: '/products/5a142c47-521c-47af-92ec-dda8808907c9.webp',
    ...showcasePricesFromPublicUsd(3219),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '40 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '15.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'ofertas'],
  },
  {
    id: 'im-c320f',
    name: 'Multifuncional color RICOH IM C320F',
    brand: 'RICOH',
    code: '418787',
    stock: 0,
    image: '/products/cb1e47b2-d784-4bef-ae18-d4dae08723e4.webp',
    ...showcasePricesFromPublicUsd(1477),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['copia', 'escanea', 'imprime', 'rendimiento'],
    equipment: {
      speedPpm: '32 ppm',
      paperSize: 'A4',
      scannerType: 'SPDF',
      monthlyYield: '5.000 pág/mes',
    },
    tabIds: ['multifuncionales', 'mas-vendidos'],
  },
  {
    id: 'p-801',
    name: 'Impresora láser RICOH P 801',
    brand: 'RICOH',
    code: '418474',
    stock: 1,
    image: '/products/be3457a0-76dd-4cf7-beca-31ad9aa7f541.webp',
    ...showcasePricesFromPublicUsd(1299),
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
    id: 'p-c600',
    name: 'Impresora láser color RICOH P C600',
    brand: 'RICOH',
    code: '408535-CPXSYU',
    stock: 9,
    image: '/products/d53b0f11-e996-4f06-8857-13fc8a6d9eb8.webp',
    ...showcasePricesFromPublicUsd(2519),
    discountLabel: '11% DSCT',
    condition: 'nuevo',
    features: ['imprime', 'rendimiento'],
    equipment: {
      speedPpm: '35 ppm',
      paperSize: 'A4',
      monthlyYield: '8.000 pág/mes',
    },
    tabIds: ['impresoras', 'ofertas'],
    href: productPath('impresora-laser-nueva-ricoh-p-c600-220v-13fc8a6d9eb8'),
  },
  {
    id: 'p-311',
    name: 'Impresora láser RICOH P 311',
    brand: 'RICOH',
    code: 'P311',
    stock: 20,
    image: '/products/73ab69b8-602b-4203-a389-070ef7bb80b0.webp',
    price: 1290,
    compareAt: 1490,
    discountLabel: '13% DSCT',
    condition: 'nuevo',
    features: ['imprime', 'rendimiento'],
    equipment: {
      speedPpm: '32 ppm',
      paperSize: 'A4',
      monthlyYield: '4.000 pág/mes',
    },
    tabIds: ['impresoras', 'mas-vendidos'],
  },
];

export type HaitechEquipmentCardSpecs = {
  printMode: 'B/N' | 'Color';
  speedPpm: string;
  paperSize: 'A4' | 'A3' | 'A4 / A3' | 'A0' | 'A1';
  monthlyYield: string;
};

function equipmentMatchesPaperFormat(
  paperSize: HaitechEquipmentCardSpecs['paperSize'],
  format: 'a4' | 'a3' | 'a0' | 'a1',
): boolean {
  if (format === 'a4') return paperSize === 'A4' || paperSize === 'A4 / A3';
  if (format === 'a3') return paperSize === 'A3' || paperSize === 'A4 / A3';
  if (format === 'a1') return paperSize === 'A1';
  return paperSize === 'A0';
}

export function getShowcaseFiltersForCategory(
  categoryId: HaitechEquipmentShowcaseCategoryId,
): readonly { id: HaitechShowcaseFilterId; label: string }[] {
  const category = HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES.find((c) => c.id === categoryId);
  if (categoryId === 'formato-ancho') return HAITECH_FORMATO_ANCHO_FILTERS;
  if (categoryId === 'laptops') return HAITECH_LAPTOP_FILTERS;
  if (categoryId === 'impresoras') return HAITECH_IMPRESORAS_SUBTYPE_FILTERS;
  if (category?.filterMode === 'consumable') return HAITECH_CONSUMABLE_ORIGIN_FILTERS;
  if (category?.filterMode === 'none') return [{ id: 'todos', label: 'Todos' }];
  if (category?.filterMode === 'equipment') return HAITECH_EQUIPMENT_SPEC_FILTERS;
  return HAITECH_EQUIPMENT_SPEC_FILTERS;
}

/**
 * Sufijo de alimentador para títulos de multifuncionales en vitrina.
 */
export function resolveEquipmentScannerSuffix(
  product: HaitechShopProduct,
): 'ARDF' | 'SPDF' | null {
  if (product.toner) return null;

  const isMultifunction =
    product.features?.includes('escanea') === true ||
    Boolean(product.equipment?.scannerType) ||
    (/multifuncional/i.test(product.name) && !/^impresora\s+l[aá]ser/i.test(product.name));

  if (!isMultifunction) return null;

  const explicit = product.equipment?.scannerType;
  if (explicit === 'ARDF' || explicit === 'SPDF') return explicit;

  const name = `${product.name} ${product.code ?? ''}`;
  if (/\bspdf\b/i.test(name)) return 'SPDF';
  if (/\bardf\b/i.test(name)) return 'ARDF';

  return 'SPDF';
}

export { resolveEquipmentShowcaseCode };

function formatShowcaseTitleSuffix(
  scannerSuffix: 'ARDF' | 'SPDF' | null,
  variantLabel?: string | null,
): string | null {
  const parts = [variantLabel?.trim(), scannerSuffix].filter(Boolean) as string[];
  if (parts.length === 0) return null;
  return `(${parts.join(', ')})`;
}

/**
 * Título vitrina: «Impresora Nueva RICOH IM 460F (SPDF)»
 * (B/N o Color se indica en los specs de la card).
 */
export function formatEquipmentShowcaseFullTitle(product: HaitechShopProduct): string {
  if (product.toner || isRepuestoProduct(product)) {
    return product.name.replace(/\s+/g, ' ').trim();
  }

  if (product.showcaseCategoryIds?.includes('software')) {
    return product.name.replace(/\s+/g, ' ').trim();
  }

  if (product.showcaseCategoryIds?.includes('escaneres')) {
    return product.name.replace(/\s+/g, ' ').trim();
  }

  if (
    product.showcaseCategoryIds?.includes('pantallas-interactivas') ||
    product.showcaseCategoryIds?.includes('videoconferencia')
  ) {
    return product.name.replace(/\s+/g, ' ').trim();
  }

  const brand = (product.brand ?? 'RICOH').trim().toUpperCase();

  if (product.showcaseCategoryIds?.includes('formato-ancho')) {
    const conditionLabel = product.condition === 'seminuevo' ? 'Seminuevo' : 'Nuevo';
    const plain = product.name.replace(/\s+/g, ' ').trim();
    const model = plain
      .replace(/\b(multifuncional de planos|plotter|formato ancho)\b/gi, '')
      .replace(new RegExp(`\\b${brand}\\b`, 'gi'), '')
      .replace(/\s+/g, ' ')
      .trim();
    const isPlanos = /multifuncional de planos|cw2201|planos/i.test(product.name);
    const scannerSuffix = resolveEquipmentScannerSuffix(product);
    const titleBase = isPlanos
      ? `Multifuncional de Planos ${conditionLabel} ${brand} ${model || plain}`.trim()
      : `Plotter ${conditionLabel} ${brand} ${model || plain}`.trim();
    const suffix = formatShowcaseTitleSuffix(scannerSuffix, product.showcaseVariantLabel);
    return suffix ? `${titleBase} ${suffix}` : titleBase;
  }

  if (product.condition === 'seminuevo' && product.showcaseCategoryIds?.length) {
    const plain = product.name.replace(/\s+/g, ' ').trim();
    if (
      product.showcaseCategoryIds.some((id) =>
        ['laptops', 'monitores', 'accesorios', 'escaneres'].includes(id),
      )
    ) {
      return plain;
    }
  }

  const scannerSuffix = resolveEquipmentScannerSuffix(product);

  if (/remanufactur/i.test(product.name)) {
    const model = product.name
      .replace(/\bmultifuncional\b/gi, '')
      .replace(/\bremanufacturad[oa]\b/gi, '')
      .replace(new RegExp(`\\b${brand}\\b`, 'gi'), '')
      .replace(/\b(impresora|láser|laser)\b/gi, '')
      .replace(/\b(color|b\/n|bn|blanco\s*y\s*negro)\b/gi, '')
      .replace(/\b(ardf|spdf)\b/gi, '')
      .replace(/\(\s*(ARDF|SPDF)\s*\)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    const isPrinterReman =
      /^impresora\s+remanufactur/i.test(product.name) ||
      (product.features?.includes('imprime') === true &&
        product.features?.includes('escanea') !== true &&
        !product.equipment?.scannerType);

    const titleBase = (isPrinterReman
      ? `Impresora Remanufacturada ${brand} ${model || product.name}`
      : `Multifuncional Remanufacturada ${brand} ${model || product.name}`)
      .replace(/\s+/g, ' ')
      .trim();

    const suffix = formatShowcaseTitleSuffix(scannerSuffix, product.showcaseVariantLabel);
    return suffix ? `${titleBase} ${suffix}` : titleBase;
  }

  const conditionLabel = product.condition === 'seminuevo' ? 'Seminueva' : 'Nueva';

  const model = product.name
    .replace(new RegExp(`\\b${brand}\\b`, 'gi'), '')
    .replace(/\b(impresora|multifuncional|multifunción|láser|laser)\b/gi, '')
    .replace(/\b(nuevo|nueva|seminuevo|seminueva)\b/gi, '')
    .replace(/\b(color|b\/n|bn|blanco\s*y\s*negro)\b/gi, '')
    .replace(/\b(ardf|spdf)\b/gi, '')
    .replace(/\(\s*(ARDF|SPDF)\s*\)/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const titleBase = `Impresora ${conditionLabel} ${brand} ${model || product.name}`
    .replace(/\s+/g, ' ')
    .trim();

  const suffix = formatShowcaseTitleSuffix(scannerSuffix, product.showcaseVariantLabel);
  return suffix ? `${titleBase} ${suffix}` : titleBase;
}

export function resolveEquipmentCardSpecs(product: HaitechShopProduct): HaitechEquipmentCardSpecs {
  const name = product.name.toLowerCase();
  const isColor =
    /\bcolor\b/.test(name) ||
    /\bim\s*c\d/i.test(product.name) ||
    /\bm\s*c\d/i.test(product.name) ||
    /\bp\s*c\d/i.test(product.name) ||
    /\bsp\s*c\d/i.test(product.name) ||
    /\bc\d{3,}/i.test(product.name);

  const paperSize: HaitechEquipmentCardSpecs['paperSize'] =
    product.equipment?.paperSize ??
    (/\ba0\b/.test(name)
      ? 'A0'
      : /\ba1\b/.test(name)
        ? 'A1'
        : /\ba3\b/.test(name) && /\ba4\b/.test(name)
          ? 'A4 / A3'
          : /\ba3\b/.test(name) || /formato\s*ancho|plotter|planos/i.test(name)
            ? 'A3'
            : 'A4');

  const speedPpm = product.equipment?.speedPpm ?? '—';
  const monthlyYieldRaw = product.equipment?.monthlyYield ?? '—';
  const monthlyYield =
    monthlyYieldRaw === '—'
      ? '—'
      : monthlyYieldRaw.replace(/\s*p[aá]g(?:inas)?(?:\s*\/\s*mes)?\.?/gi, ' pags').replace(/\s+/g, ' ').trim();

  return {
    printMode: isColor ? 'Color' : 'B/N',
    speedPpm,
    paperSize,
    monthlyYield,
  };
}

export function resolveConsumableOrigin(product: HaitechShopProduct): HaitechConsumableOrigin {
  const name = product.name.toLowerCase();
  if (/remanufactur/.test(name)) return 'remanufacturado';
  if (/compatible/.test(name) || product.toner?.original === false) return 'compatible';
  if (product.toner?.original === true || /\boriginal\b/.test(name)) return 'original';
  return 'original';
}

function matchesImpresoraSubtype(
  product: HaitechShopProduct,
  filter: HaitechImpresoraSubtypeFilterId,
): boolean {
  const name = product.name.toLowerCase();
  if (filter === 'laser') {
    return /l[aá]ser|laser/.test(name) && !/tinta|t[eé]rmic|matricial/.test(name);
  }
  if (filter === 'tinta') {
    return /tinta|inkjet|ink[-\s]?jet|chorro\s*de\s*tinta/.test(name);
  }
  if (filter === 'termica') {
    return /t[eé]rmic|thermal|recibo|ticket/.test(name);
  }
  if (filter === 'matricial') {
    return /matricial|matrix|dot[-\s]?matrix/.test(name);
  }
  return true;
}

function matchesSpecFilter(product: HaitechShopProduct, filter: HaitechShowcaseFilterId): boolean {
  if (filter === 'todos') return true;
  if (filter === 'originales') return resolveConsumableOrigin(product) === 'original';
  if (filter === 'compatibles') return resolveConsumableOrigin(product) === 'compatible';
  if (filter === 'remanufacturados') return resolveConsumableOrigin(product) === 'remanufacturado';
  if (filter === 'laser' || filter === 'tinta' || filter === 'termica' || filter === 'matricial') {
    return matchesImpresoraSubtype(product, filter);
  }

  const specs = resolveEquipmentCardSpecs(product);
  if (filter === 'a4') return equipmentMatchesPaperFormat(specs.paperSize, 'a4');
  if (filter === 'a3') return equipmentMatchesPaperFormat(specs.paperSize, 'a3');
  if (filter === 'color') return specs.printMode === 'Color';
  if (filter === 'bn') return specs.printMode === 'B/N';
  return true;
}

function matchesCondition(
  product: HaitechShopProduct,
  condition: HaitechEquipmentConditionId,
): boolean {
  if (condition === 'remanufacturadas') {
    return /remanufactur/i.test(product.name);
  }
  if (condition === 'nuevas') {
    return product.condition !== 'seminuevo' && !/remanufactur/i.test(product.name);
  }
  return product.condition === 'seminuevo';
}

function showcaseProductDedupeKey(product: HaitechShopProduct): string {
  const kind = /remanufactur/i.test(product.name)
    ? 'reman'
    : product.condition === 'seminuevo'
      ? 'semi'
      : 'nuevo';
  return `${kind}:${product.id}`;
}

function showcaseProductPool(): HaitechShopProduct[] {
  const seenIds = new Set<string>();
  const seenKeys = new Set<string>();
  const pool: HaitechShopProduct[] = [];
  for (const product of [
    ...HAITECH_SHOP_FAVORITE_PRODUCTS,
    ...HAITECH_SHOP_LATEST_PRODUCTS,
    ...HAITECH_SHOWCASE_EXTRA_PRODUCTS,
    ...HAITECH_SHOWCASE_SEMINUEVAS,
    ...HAITECH_SHOWCASE_FORMATO_ANCHO,
    ...HAITECH_SHOWCASE_REMANUFACTURADAS,
    ...HAITECH_SHOWCASE_SOFTWARE,
    ...HAITECH_SHOWCASE_ESCANERES,
    ...HAITECH_SHOWCASE_COLABORACION,
  ]) {
    if (seenIds.has(product.id)) continue;
    const key = showcaseProductDedupeKey(product);
    if (seenKeys.has(key)) continue;
    seenIds.add(product.id);
    seenKeys.add(key);
    pool.push(product);
  }
  return pool.filter((product) => !isTonerOrRepuestoProduct(product));
}

function isRepuestoProduct(product: HaitechShopProduct): boolean {
  if (product.toner) return false;
  if (product.equipment) return false;
  const name = product.name.toLowerCase();
  if (/repuesto|unidad de imagen|cilindro|fusor|rodillo|revelador/.test(name)) return true;
  if (product.href?.includes('/categoria/repuestos')) return true;
  return false;
}

function isTonerOrRepuestoProduct(product: HaitechShopProduct): boolean {
  if (product.toner) return true;
  if (product.tabIds.includes('toner')) return true;
  if (isRepuestoProduct(product)) return true;
  return /t[oó]ner/.test(product.name.toLowerCase());
}

function isAccesorioProduct(product: HaitechShopProduct): boolean {
  if (isTonerOrRepuestoProduct(product)) return false;
  if (product.equipment) return false;
  if (
    product.showcaseCategoryIds?.length &&
    !product.showcaseCategoryIds.includes('accesorios')
  ) {
    return false;
  }
  return product.tabIds.includes('accesorios');
}

function isPantallasInteractivasShowcaseProduct(product: HaitechShopProduct): boolean {
  const haystack = product.name.toLowerCase();
  return (
    haystack.includes('pizarra interactiva') ||
    haystack.includes('pantalla interactiva') ||
    haystack.includes('ifpd')
  );
}

function isVideoconferenciaShowcaseProduct(product: HaitechShopProduct): boolean {
  const haystack = product.name.toLowerCase();
  return (
    haystack.includes('videoconferencia') ||
    haystack.includes('sala de reunion') ||
    haystack.includes('conferencia nearity') ||
    haystack.includes('jabra speak') ||
    haystack.includes('panacast') ||
    /\b(camara|c[aá]mara).*(conferencia|web)\b/i.test(product.name) ||
    /\baltavoz para conferencias\b/i.test(product.name)
  );
}

function matchesShowcaseCategory(
  product: HaitechShopProduct,
  category: HaitechEquipmentShowcaseCategory,
): boolean {
  if (product.showcaseCategoryIds?.includes(category.id as (typeof product.showcaseCategoryIds)[number])) {
    return true;
  }

  if (category.id === 'toner') {
    return isTonerOrRepuestoProduct(product) && !isRepuestoProduct(product);
  }
  if (category.id === 'repuestos') {
    return isRepuestoProduct(product);
  }
  if (category.id === 'accesorios') {
    return isAccesorioProduct(product);
  }
  if (category.id === 'formato-ancho') {
    return (
      product.showcaseCategoryIds?.includes('formato-ancho') ||
      product.showcaseCategoryIds?.includes('plotter') ||
      product.showcaseCategoryIds?.includes('multifuncional-planos') ||
      (/cw2201|700dr|formato ancho|plotter|multifuncional de planos|designjet/i.test(
        product.name,
      ) &&
        Boolean(product.equipment))
    );
  }
  if (category.id === 'laptops') {
    return product.showcaseCategoryIds?.includes('laptops') ?? false;
  }
  if (category.id === 'monitores') {
    return product.showcaseCategoryIds?.includes('monitores') ?? false;
  }
  if (category.id === 'software') {
    return product.showcaseCategoryIds?.includes('software') ?? false;
  }
  if (category.id === 'escaneres') {
    return product.showcaseCategoryIds?.includes('escaneres') ?? false;
  }
  if (category.id === 'pantallas-interactivas') {
    return isPantallasInteractivasShowcaseProduct(product);
  }
  if (category.id === 'videoconferencia') {
    return isVideoconferenciaShowcaseProduct(product);
  }
  if (!category.shopTabId) return false;
  if (product.tabIds.includes(category.shopTabId)) return true;
  if (category.shopTabId === 'multifuncionales' && /multifuncional/i.test(product.name)) {
    return Boolean(product.equipment) && !product.toner;
  }
  if (category.shopTabId === 'impresoras' && /\bimpresora\b/i.test(product.name)) {
    return Boolean(product.equipment) && !product.toner;
  }
  return false;
}

export type HaitechShowcaseConsumableKind = 'all' | 'toner' | 'repuestos';

export function isShowcaseConsumableCategory(
  categoryId: HaitechEquipmentShowcaseCategoryId,
): boolean {
  return categoryId === 'toner' || categoryId === 'repuestos';
}

export function resolveShowcaseConsumableKind(
  categoryId: HaitechEquipmentShowcaseCategoryId,
  consumableKind: HaitechShowcaseConsumableKind = 'all',
): HaitechShowcaseConsumableKind {
  if (categoryId === 'toner') return 'toner';
  if (categoryId === 'repuestos') return 'repuestos';
  return consumableKind;
}

function mergeCatalogConsumablesIntoPool(
  pool: HaitechShopProduct[],
  catalogConsumables: readonly HaitechShopProduct[] | undefined,
): HaitechShopProduct[] {
  if (!catalogConsumables?.length) return pool;

  const seenIds = new Set(pool.map((product) => product.id));
  const seenCodes = new Set(
    pool.map((product) => String(product.code ?? '').trim().toUpperCase()).filter(Boolean),
  );
  const merged = [...pool];

  for (const product of catalogConsumables) {
    if (seenIds.has(product.id)) continue;
    const code = String(product.code ?? '').trim().toUpperCase();
    if (code && seenCodes.has(code)) continue;
    seenIds.add(product.id);
    if (code) seenCodes.add(code);
    merged.push(product);
  }

  return merged;
}

export function filterEquipmentShowcaseProducts(options: {
  categoryId: HaitechEquipmentShowcaseCategoryId;
  specFilter: HaitechShowcaseFilterId;
  equipmentSpecFilters?: HaitechEquipmentActiveSpecFilters;
  formatoAnchoSpecFilters?: HaitechFormatoAnchoActiveFilters;
  laptopSpecFilters?: HaitechLaptopActiveFilters;
  condition: HaitechEquipmentConditionId;
  consumableKind?: HaitechShowcaseConsumableKind;
  catalogConsumables?: readonly HaitechShopProduct[];
  limit?: number;
}): HaitechShopProduct[] {
  if (isShowcaseConsumableCategory(options.categoryId)) return [];

  const category = HAITECH_EQUIPMENT_SHOWCASE_CATEGORIES.find((c) => c.id === options.categoryId);
  if (!category) return [];

  const showcaseNoneWithPool = new Set<HaitechEquipmentShowcaseCategoryId>([
    'monitores',
    'accesorios',
    'software',
    'escaneres',
    'pantallas-interactivas',
    'videoconferencia',
  ]);

  if (category.filterMode === 'none' && !category.shopTabId) {
    if (!showcaseNoneWithPool.has(category.id)) return [];
  } else if (
    category.filterMode === 'equipment' &&
    !category.shopTabId &&
    category.id !== 'formato-ancho' &&
    category.id !== 'laptops'
  ) {
    return [];
  }

  const limit = options.limit ?? HAITECH_EQUIPMENT_SHOWCASE_VISIBLE;
  const isConsumable = category.filterMode === 'consumable';
  const consumableKind = resolveShowcaseConsumableKind(
    options.categoryId,
    options.consumableKind ?? 'all',
  );

  const pool =
    isShowcaseConsumableCategory(options.categoryId)
      ? mergeCatalogConsumablesIntoPool(showcaseProductPool(), options.catalogConsumables)
      : showcaseProductPool();

  const filtered = pool
    .filter((product) => {
      if (!matchesShowcaseCategory(product, category)) return false;

      if (isConsumable) {
        if (!isTonerOrRepuestoProduct(product)) return false;
        if (consumableKind === 'toner' && isRepuestoProduct(product)) return false;
        if (consumableKind === 'repuestos' && !isRepuestoProduct(product)) return false;
        if (!matchesSpecFilter(product, options.specFilter)) return false;
        return true;
      }

      const isSpecialShowcase =
        Boolean(product.showcaseCategoryIds?.length) ||
        (product.tabIds.includes('accesorios') && product.condition === 'seminuevo');

      if (
        !isSpecialShowcase &&
        !product.equipment &&
        !/multifuncional|impresora|plotter|laptop|monitor|mueble|cassetera|optiplex|esc[aá]ner|scanner|scansnap|pizarra|pantalla interactiva|ifpd|videoconferencia|jabra|nearity|panacast/i.test(
          product.name,
        )
      ) {
        return false;
      }
      if (product.toner) return false;
      const skipConditionFilter =
        category.id === 'monitores' ||
        category.id === 'software' ||
        category.id === 'pantallas-interactivas' ||
        category.id === 'videoconferencia' ||
        (category.id === 'accesorios' &&
          Boolean(product.showcaseCategoryIds?.includes('accesorios')));
      if (!skipConditionFilter && !matchesCondition(product, options.condition)) return false;
      if (category.id === 'laptops') {
        if (
          options.laptopSpecFilters &&
          !matchesLaptopActiveSpecFilters(product, options.laptopSpecFilters)
        ) {
          return false;
        }
      } else if (category.id === 'formato-ancho') {
        if (
          options.formatoAnchoSpecFilters &&
          !matchesFormatoAnchoActiveSpecFilters(product, options.formatoAnchoSpecFilters)
        ) {
          return false;
        }
      } else if (
        category.filterMode === 'equipment' &&
        options.equipmentSpecFilters &&
        !matchesEquipmentActiveSpecFilters(product, options.equipmentSpecFilters)
      ) {
        return false;
      }
      if (category.filterMode !== 'equipment' && !matchesSpecFilter(product, options.specFilter)) {
        return false;
      }
      return true;
    })
    .slice()
    .sort((a, b) => {
      const aOnRequest = a.price <= 0;
      const bOnRequest = b.price <= 0;
      if (aOnRequest !== bOnRequest) return aOnRequest ? 1 : -1;

      if (category.filterMode === 'equipment') {
        const aIsColor = resolveEquipmentCardSpecs(a).printMode === 'Color' ? 1 : 0;
        const bIsColor = resolveEquipmentCardSpecs(b).printMode === 'Color' ? 1 : 0;
        if (aIsColor !== bIsColor) return aIsColor - bIsColor;
      }

      return a.price - b.price;
    });

  if (limit === Number.POSITIVE_INFINITY) return filtered;
  return filtered.slice(0, limit);
}

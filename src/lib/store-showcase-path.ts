import type {
  HaitechEquipmentActiveSpecFilters,
  HaitechEquipmentConditionId,
  HaitechEquipmentShowcaseCategoryId,
  HaitechFormatoAnchoActiveFilters,
  HaitechLaptopActiveFilters,
  HaitechShowcaseFilterId,
} from '@/data/haitech-home-equipment-showcase';
import {
  EMPTY_EQUIPMENT_SPEC_FILTERS,
  EMPTY_FORMATO_ANCHO_SPEC_FILTERS,
  EMPTY_LAPTOP_SPEC_FILTERS,
} from '@/data/haitech-home-equipment-showcase';

export type StoreShowcaseConsumableKind = 'all' | 'toner' | 'repuestos';

export type StoreShowcaseQuery = {
  categoryId: HaitechEquipmentShowcaseCategoryId;
  filter: HaitechShowcaseFilterId;
  equipmentSpecFilters: HaitechEquipmentActiveSpecFilters;
  formatoAnchoSpecFilters: HaitechFormatoAnchoActiveFilters;
  laptopSpecFilters: HaitechLaptopActiveFilters;
  condition: HaitechEquipmentConditionId;
  consumableKind: StoreShowcaseConsumableKind;
};

const CATEGORY_IDS: readonly HaitechEquipmentShowcaseCategoryId[] = [
  'multifuncionales',
  'formato-ancho',
  'impresoras',
  'laptops',
  'monitores',
  'pantallas-interactivas',
  'videoconferencia',
  'toner-repuestos',
  'escaneres',
  'camaras',
  'accesorios',
  'software',
] as const;

const IMPRESORA_SUBTYPE_FILTERS = new Set<HaitechShowcaseFilterId>([
  'laser',
  'tinta',
  'termica',
  'matricial',
]);

const EQUIPMENT_SPEC_FILTERS = new Set<HaitechShowcaseFilterId>(['a4', 'a3', 'a0', 'a1', 'color', 'bn']);

const CONSUMABLE_ORIGIN_FILTERS = new Set<HaitechShowcaseFilterId>([
  'originales',
  'compatibles',
  'remanufacturados',
]);

/** URLs antiguas de tipos de impresora → Impresoras + subfiltro. */
const LEGACY_IMPRESORA_CATEGORY_TO_FILTER: Record<string, HaitechShowcaseFilterId> = {
  'impresora-laser': 'laser',
  'impresora-tinta': 'tinta',
  'impresora-termica': 'termica',
  'impresora-matricial': 'matricial',
};

const LAPTOP_SPEC_FILTERS = new Set<HaitechShowcaseFilterId>([
  'todos',
  'pc',
  'laptop',
  'i5',
  'i7',
]);

const FORMATO_ANCHO_DEVICE_FILTERS = new Set<HaitechShowcaseFilterId>([
  'plotter',
  'multifuncional',
]);

const FILTER_IDS: readonly HaitechShowcaseFilterId[] = [
  'todos',
  ...EQUIPMENT_SPEC_FILTERS,
  ...CONSUMABLE_ORIGIN_FILTERS,
  ...IMPRESORA_SUBTYPE_FILTERS,
  ...LAPTOP_SPEC_FILTERS,
  ...FORMATO_ANCHO_DEVICE_FILTERS,
] as HaitechShowcaseFilterId[];

const SHOWCASE_HASH = 'equipos-vitrina';

function isCategoryId(value: string): value is HaitechEquipmentShowcaseCategoryId {
  return (CATEGORY_IDS as readonly string[]).includes(value);
}

function isFilterId(value: string): value is HaitechShowcaseFilterId {
  return (FILTER_IDS as readonly string[]).includes(value);
}

export function isStoreShowcaseCategorySlug(
  slug: string | undefined,
): slug is HaitechEquipmentShowcaseCategoryId {
  return slug != null && isCategoryId(slug);
}

export function storeShowcaseCategoryFromPathname(
  pathname: string,
): HaitechEquipmentShowcaseCategoryId | null {
  const match = pathname.match(/^\/tienda\/([^/?#]+)$/);
  if (match?.[1] && isCategoryId(match[1])) return match[1];
  return null;
}

function parseEquipmentSpecFilters(
  searchParams: URLSearchParams,
): HaitechEquipmentActiveSpecFilters {
  const filters: HaitechEquipmentActiveSpecFilters = { ...EMPTY_EQUIPMENT_SPEC_FILTERS };

  const formato = searchParams.get('formato');
  if (formato === 'a4' || formato === 'a3' || formato === 'a0' || formato === 'a1') {
    filters.format = formato;
  }

  const modo = searchParams.get('modo');
  if (modo === 'color' || modo === 'bn') {
    filters.printMode = modo;
  }

  const legacyFiltro = searchParams.get('filtro');
  if (legacyFiltro === 'a4' || legacyFiltro === 'a3' || legacyFiltro === 'a0' || legacyFiltro === 'a1') {
    filters.format = legacyFiltro;
  } else if (legacyFiltro === 'color' || legacyFiltro === 'bn') {
    filters.printMode = legacyFiltro;
  }

  return filters;
}

function appendEquipmentSpecFilters(
  params: URLSearchParams,
  filters: HaitechEquipmentActiveSpecFilters,
): void {
  if (filters.format) params.set('formato', filters.format);
  if (filters.printMode) params.set('modo', filters.printMode);
}

function appendLaptopSpecFilters(
  params: URLSearchParams,
  filters: HaitechLaptopActiveFilters,
): void {
  if (filters.device) params.set('dispositivo', filters.device);
  if (filters.cpu) params.set('cpu', filters.cpu);
}

function parseLaptopSpecFilters(searchParams: URLSearchParams): HaitechLaptopActiveFilters {
  const filters: HaitechLaptopActiveFilters = { ...EMPTY_LAPTOP_SPEC_FILTERS };

  const dispositivo = searchParams.get('dispositivo');
  if (dispositivo === 'pc' || dispositivo === 'laptop') {
    filters.device = dispositivo;
  }

  const cpu = searchParams.get('cpu');
  if (cpu === 'i5' || cpu === 'i7') {
    filters.cpu = cpu;
  }

  return filters;
}

function appendFormatoAnchoSpecFilters(
  params: URLSearchParams,
  filters: HaitechFormatoAnchoActiveFilters,
): void {
  if (filters.format) params.set('formato', filters.format);
  if (filters.printMode) params.set('modo', filters.printMode);
  if (filters.deviceClass) params.set('clase', filters.deviceClass);
}

function parseFormatoAnchoSpecFilters(searchParams: URLSearchParams): HaitechFormatoAnchoActiveFilters {
  const filters: HaitechFormatoAnchoActiveFilters = { ...EMPTY_FORMATO_ANCHO_SPEC_FILTERS };

  const formato = searchParams.get('formato');
  if (formato === 'a0' || formato === 'a1') {
    filters.format = formato;
  }

  const modo = searchParams.get('modo');
  if (modo === 'color' || modo === 'bn') {
    filters.printMode = modo;
  }

  const clase = searchParams.get('clase');
  if (clase === 'plotter' || clase === 'multifuncional') {
    filters.deviceClass = clase;
  }

  const legacyFiltro = searchParams.get('filtro');
  if (legacyFiltro === 'a0' || legacyFiltro === 'a1') {
    filters.format = legacyFiltro;
  } else if (legacyFiltro === 'color' || legacyFiltro === 'bn') {
    filters.printMode = legacyFiltro;
  }

  return filters;
}

/**
 * Ruta legible: /tienda/multifuncionales · /tienda/impresoras?tipo=tinta&condicion=nuevas
 */
export function storeShowcasePath(options?: {
  categoryId?: HaitechEquipmentShowcaseCategoryId;
  filter?: HaitechShowcaseFilterId;
  equipmentSpecFilters?: HaitechEquipmentActiveSpecFilters;
  formatoAnchoSpecFilters?: HaitechFormatoAnchoActiveFilters;
  laptopSpecFilters?: HaitechLaptopActiveFilters;
  condition?: HaitechEquipmentConditionId;
  consumableKind?: StoreShowcaseConsumableKind;
}): string {
  if (!options?.categoryId) return '/tienda';

  const params = new URLSearchParams();
  const categoryId = options.categoryId;
  const filter = options.filter ?? 'todos';
  const equipmentSpecFilters = options.equipmentSpecFilters ?? EMPTY_EQUIPMENT_SPEC_FILTERS;
  const formatoAnchoSpecFilters = options.formatoAnchoSpecFilters ?? EMPTY_FORMATO_ANCHO_SPEC_FILTERS;
  const laptopSpecFilters = options.laptopSpecFilters ?? EMPTY_LAPTOP_SPEC_FILTERS;
  const condition = options.condition ?? 'nuevas';
  const consumableKind = options.consumableKind ?? 'all';

  if (categoryId === 'impresoras' && IMPRESORA_SUBTYPE_FILTERS.has(filter)) {
    params.set('tipo', filter);
  } else if (categoryId === 'toner-repuestos') {
    if (consumableKind === 'toner' || consumableKind === 'repuestos') {
      params.set('tipo', consumableKind);
    }
    if (CONSUMABLE_ORIGIN_FILTERS.has(filter)) {
      params.set('origen', filter);
    }
  } else if (categoryId === 'laptops') {
    appendLaptopSpecFilters(params, laptopSpecFilters);
    if (CONSUMABLE_ORIGIN_FILTERS.has(filter)) {
      params.set('origen', filter);
    }
  } else if (categoryId === 'formato-ancho') {
    appendFormatoAnchoSpecFilters(params, formatoAnchoSpecFilters);
    if (CONSUMABLE_ORIGIN_FILTERS.has(filter)) {
      params.set('origen', filter);
    }
  } else {
    appendEquipmentSpecFilters(params, equipmentSpecFilters);
    if (CONSUMABLE_ORIGIN_FILTERS.has(filter)) {
      params.set('origen', filter);
    }
  }

  if (condition !== 'nuevas') {
    params.set('condicion', condition);
  }

  const qs = params.toString();
  return qs ? `/tienda/${categoryId}?${qs}` : `/tienda/${categoryId}`;
}

/** Parsea pathname + query de vitrina (/tienda/:categoria). */
export function parseStoreShowcaseLocation(
  pathname: string,
  searchParams: URLSearchParams,
): Partial<StoreShowcaseQuery> {
  const result: Partial<StoreShowcaseQuery> = {};

  const pathMatch = pathname.match(/^\/tienda\/([^/?#]+)$/);
  if (pathMatch?.[1]) {
    if (pathMatch[1] === 'plotter' || pathMatch[1] === 'multifuncional-planos') {
      result.categoryId = 'formato-ancho';
    } else if (isCategoryId(pathMatch[1])) {
      result.categoryId = pathMatch[1];
    }
  }

  // Compat: ?vitrina=multifuncionales en /tienda
  const legacyVitrina = searchParams.get('vitrina');
  if (!result.categoryId && legacyVitrina && isCategoryId(legacyVitrina)) {
    result.categoryId = legacyVitrina;
  } else if (
    !result.categoryId &&
    legacyVitrina &&
    LEGACY_IMPRESORA_CATEGORY_TO_FILTER[legacyVitrina]
  ) {
    result.categoryId = 'impresoras';
    result.filter = LEGACY_IMPRESORA_CATEGORY_TO_FILTER[legacyVitrina];
  }

  const tipo = searchParams.get('tipo');
  const categoryId = result.categoryId;

  if (tipo) {
    if (categoryId === 'toner-repuestos' && (tipo === 'toner' || tipo === 'repuestos')) {
      result.consumableKind = tipo;
    } else if (isFilterId(tipo) && IMPRESORA_SUBTYPE_FILTERS.has(tipo)) {
      result.filter = tipo;
    }
  }

  const origen = searchParams.get('origen');
  const filtro = searchParams.get('filtro');
  if (origen && isFilterId(origen)) result.filter = origen;

  if (categoryId === 'laptops') {
    result.laptopSpecFilters = parseLaptopSpecFilters(searchParams);
  } else if (categoryId === 'formato-ancho') {
    result.formatoAnchoSpecFilters = parseFormatoAnchoSpecFilters(searchParams);
  } else if (categoryId && categoryId !== 'impresoras' && categoryId !== 'toner-repuestos') {
    result.equipmentSpecFilters = parseEquipmentSpecFilters(searchParams);
  } else if (filtro && isFilterId(filtro) && EQUIPMENT_SPEC_FILTERS.has(filtro)) {
    result.equipmentSpecFilters = parseEquipmentSpecFilters(searchParams);
  }

  const condicion = searchParams.get('condicion');
  if (
    condicion === 'nuevas' ||
    condicion === 'seminuevas' ||
    condicion === 'remanufacturadas'
  ) {
    result.condition = condicion;
  }

  return result;
}

/** @deprecated Usar parseStoreShowcaseLocation */
export function parseStoreShowcaseSearchParams(
  searchParams: URLSearchParams,
): Partial<StoreShowcaseQuery> {
  return parseStoreShowcaseLocation('/tienda', searchParams);
}

/** Redirige URLs legacy ?vitrina=… → /tienda/:slug limpio. */
export function legacyStoreShowcaseRedirectPath(requestUrl: string): string | null {
  const url = new URL(requestUrl);
  const legacyCategoryMatch = url.pathname.match(/^\/tienda\/(plotter|multifuncional-planos)$/);
  if (legacyCategoryMatch) {
    const nextParams = new URLSearchParams(url.search);
    const condicion = nextParams.get('condicion');
    const condition =
      condicion === 'nuevas' || condicion === 'seminuevas' || condicion === 'remanufacturadas'
        ? condicion
        : undefined;
    const legacySlug = legacyCategoryMatch[1];
    const formatoAnchoSpecFilters = parseFormatoAnchoSpecFilters(nextParams);
    if (legacySlug === 'plotter' && !formatoAnchoSpecFilters.deviceClass) {
      formatoAnchoSpecFilters.deviceClass = 'plotter';
    } else if (legacySlug === 'multifuncional-planos' && !formatoAnchoSpecFilters.deviceClass) {
      formatoAnchoSpecFilters.deviceClass = 'multifuncional';
    }
    return storeShowcasePath({
      categoryId: 'formato-ancho',
      formatoAnchoSpecFilters,
      ...(condition ? { condition } : {}),
    });
  }

  if (url.pathname !== '/tienda') return null;

  const vitrina = url.searchParams.get('vitrina');
  if (!vitrina) return null;

  let categoryId: HaitechEquipmentShowcaseCategoryId | undefined;
  let filter: HaitechShowcaseFilterId | undefined;

  if (isCategoryId(vitrina)) {
    categoryId = vitrina;
  } else if (vitrina === 'plotter' || vitrina === 'multifuncional-planos') {
    categoryId = 'formato-ancho';
  } else if (LEGACY_IMPRESORA_CATEGORY_TO_FILTER[vitrina]) {
    categoryId = 'impresoras';
    filter = LEGACY_IMPRESORA_CATEGORY_TO_FILTER[vitrina];
  } else {
    return null;
  }

  const nextParams = new URLSearchParams(url.search);
  nextParams.delete('vitrina');

  const origen = nextParams.get('origen');
  const filtro = nextParams.get('filtro');
  if (origen && isFilterId(origen)) filter = origen;
  else if (filtro && isFilterId(filtro)) filter = filtro;

  let consumableKind: StoreShowcaseConsumableKind | undefined;
  const tipo = nextParams.get('tipo');
  if (categoryId === 'toner-repuestos' && (tipo === 'toner' || tipo === 'repuestos')) {
    consumableKind = tipo;
    nextParams.delete('tipo');
  } else if (tipo && isFilterId(tipo) && IMPRESORA_SUBTYPE_FILTERS.has(tipo)) {
    filter = tipo;
    nextParams.delete('tipo');
  }

  let condition: HaitechEquipmentConditionId | undefined;
  const condicion = nextParams.get('condicion');
  if (
    condicion === 'nuevas' ||
    condicion === 'seminuevas' ||
    condicion === 'remanufacturadas'
  ) {
    condition = condicion;
    nextParams.delete('condicion');
  }

  if (origen) nextParams.delete('origen');
  if (filtro) nextParams.delete('filtro');

  const cleanPath = storeShowcasePath({
    categoryId,
    ...(filter != null ? { filter } : {}),
    ...(categoryId === 'laptops'
      ? { laptopSpecFilters: parseLaptopSpecFilters(url.searchParams) }
      : categoryId === 'formato-ancho'
        ? { formatoAnchoSpecFilters: parseFormatoAnchoSpecFilters(url.searchParams) }
        : categoryId !== 'impresoras' && categoryId !== 'toner-repuestos'
          ? { equipmentSpecFilters: parseEquipmentSpecFilters(url.searchParams) }
          : {}),
    ...(condition != null ? { condition } : {}),
    ...(consumableKind != null ? { consumableKind } : {}),
  });

  const cleanUrl = new URL(cleanPath, url.origin);
  for (const [key, value] of nextParams.entries()) {
    if (!cleanUrl.searchParams.has(key)) {
      cleanUrl.searchParams.set(key, value);
    }
  }

  return `${cleanUrl.pathname}${cleanUrl.search}${url.hash}`;
}

export { SHOWCASE_HASH as STORE_SHOWCASE_HASH, CATEGORY_IDS as STORE_SHOWCASE_CATEGORY_IDS };

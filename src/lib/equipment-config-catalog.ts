import { isTonerMerchandisingProduct } from '@/lib/product-merchandising';
import { ensureFullPrices } from '@/lib/roles';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { formatProductDisplayCode } from '@/lib/product-display-code';
import { normalizeSearchText } from '@/lib/product-search';
import { tonerProductMatchesEquipment, isTonerSupplyAssemblyProduct } from '@/lib/product-equipment-consumables';
import { usdToPen } from '@/lib/utils';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

/** Tóner original IM 430F en inventario (código 419078). */
export const IM430F_ORIGINAL_TONER_PRODUCT_ID = '419078';

/** Tóner original IM 600F en inventario (código 418480). */
export const IM600F_ORIGINAL_TONER_PRODUCT_ID = '418480';
/** @deprecated Usar IM600F_ORIGINAL_TONER_PRODUCT_ID — el 418480 no se ofrece en IM 550F. */
export const IM550F_ORIGINAL_TONER_PRODUCT_ID = IM600F_ORIGINAL_TONER_PRODUCT_ID;

/** Tóner compatible IM 550 en inventario. */
export const IM550F_COMPATIBLE_TONER_PRODUCT_ID = 'compat-tc-im-550-intercopy';

/** Equipo M 320F en inventario. */
export const M320F_EQUIPMENT_PRODUCT_ID = 'bfb264b8-70dc-4ad4-9686-2df02df8c75e';

/** Equipo IM C320F (color A4) en inventario. */
export const IM_C320F_EQUIPMENT_PRODUCT_ID = '481dbc77-436b-464d-b76f-930f7d79f4ff';

/** Tóneres CMYK originales IM C320F (Cyan / Magenta / Amarillo / Negro). */
export const IM_C320F_ORIGINAL_TONER_IDS = [
  '842718',
  '842719',
  '842720',
  '842725',
] as const;

/** Tóneres CMYK compatibles IM C320F (Cyan / Magenta / Amarillo / Negro). */
export const IM_C320F_COMPATIBLE_TONER_IDS = [
  'compat-im-c320f-cyan',
  'compat-im-c320f-magenta',
  'compat-im-c320f-yellow',
  'compat-im-c320f-negro',
] as const;

/** Equipo MP C407 (seminueva) en inventario. */
export const MPC407_EQUIPMENT_PRODUCT_ID = '92070b52-ac0d-4bc1-94d3-d51e69091bb4';

/** Tóneres CMYK originales MP C306/C307/C406/C407 (Cyan / Magenta / Amarillo / Negro). */
export const MPC407_ORIGINAL_TONER_IDS = [
  '842092',
  '842093',
  '842094',
  '842091',
] as const;

/** Tóneres CMYK Intercopy compatibles MP C306/C406/C307/C407. */
export const MPC407_COMPATIBLE_TONER_IDS = [
  'intercopy-mp-c306-cyan',
  'intercopy-mp-c306-magenta',
  'intercopy-mp-c306-yellow',
  'intercopy-mp-c306-negro',
] as const;

/** Equipo M C320FW (color A4) en inventario. */
export const MC320FW_EQUIPMENT_PRODUCT_ID = 'cb1e47b2-d784-4bef-ae18-d4dae08723e4';

/** Tóner original M 320F / SP 3710 / P-311 en inventario (código 408284). */
export const M320F_ORIGINAL_TONER_PRODUCT_ID = '408284';

/** Tóner compatible M 320F en inventario. */
export const M320F_COMPATIBLE_TONER_PRODUCT_ID = 'compat-tc-m-320f-haiprint';

/** Casetera 250 hojas — PB1110 (IM 430F). */
export const CASETERA_250_PB1110_PRODUCT_ID = 'ricoh-acc-418080';

/** Casetera 500 hojas — PB1120 (IM 430F). */
export const CASETERA_500_PB1120_PRODUCT_ID = 'ricoh-acc-418081';

/** Casetera adicional — PB1160 (IM 550F / IM 600F). */
export const CASETERA_500_PB1160_PRODUCT_ID = 'ricoh-acc-418475';

/** Gabinete alto Tipo I (inventario HaiStore). */
export const GABINETE_ALTO_TIPO_I_PRODUCT_ID = '080d0afc-1c8a-40f7-9c50-ad75be1700b3';

/** Tall Cabinet IM 550F / IM 600F. */
export const TALL_CABINET_IM550_PRODUCT_ID = 'ricoh-lp-1666-02';

/** Tall Cabinet IM 430F. */
export const TALL_CABINET_IM430_PRODUCT_ID = 'ricoh-lp-1607-00';

/** Estabilizador sólido 2 KVA (~2000 W). */
export const ESTABILIZADOR_2KVA_PRODUCT_ID = 'deltron-psstie2042';

/** Router Wi-Fi gigabit. */
export const ROUTER_WIFI_PRODUCT_ID = 'deltron-rtdldir-2150';

interface OptionCatalogHint {
  keywords: string[];
  categories?: string[];
  fallbackImage: string;
}

const OPTION_CATALOG_HINTS: Record<string, OptionCatalogHint> = {
  'bandeja-estandar': {
    keywords: ['bandeja', '550', 'papel'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'bandeja-500': {
    keywords: ['bandeja', '500', 'adicional', 'papel'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/repuestos.png',
  },
  pedestal: {
    keywords: ['pedestal', 'soporte', 'piso', 'cabinet'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'adf-alto-volumen': {
    keywords: ['alimentador', 'adf', 'documento', 'feeder'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/repuestos.png',
  },
  'sin-acabado': {
    keywords: ['acabado', 'finisher'],
    categories: ['Accesorios'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'finisher-grapado': {
    keywords: ['finisher', 'grapado', 'grapa'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/repuestos.png',
  },
  'finisher-grapado-perforado': {
    keywords: ['finisher', 'perfor', 'grapado'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/repuestos.png',
  },
  'escaneo-duplex': {
    keywords: ['escaneo', 'duplex', 'dúplex', 'scan'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/escaneres.png',
  },
  'kit-ocr': {
    keywords: ['ocr', 'escaneo', 'pdf', 'buscable'],
    categories: ['Accesorios', 'Repuestos', 'Suministros'],
    fallbackImage: '/categories/soluciones-negocio.png',
  },
  'impresion-segura': {
    keywords: ['segura', 'marca de agua', 'watermark'],
    categories: ['Accesorios'],
    fallbackImage: '/categories/soluciones-negocio.png',
  },
  'sin-seguridad-extra': {
    keywords: ['seguridad', 'accesorio'],
    categories: ['Accesorios'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'hdd-cifrado': {
    keywords: ['disco', 'hdd', 'cifrado', 'almacenamiento'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/repuestos.png',
  },
  'auth-tarjeta': {
    keywords: ['tarjeta', 'pin', 'autenticacion', 'autenticación', 'card'],
    categories: ['Accesorios'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'bandeja-bypass': {
    keywords: ['bypass', 'sobre', 'especial', 'manual'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/repuestos.png',
  },
  'toner-inicio': {
    keywords: ['toner', 'tóner', 'inicio', 'starter', '8000'],
    categories: [
      'Toner, Suministros',
      'Suministros',
      'Toner',
      'Tóner',
      'Toner Original',
    ],
    fallbackImage: '/categories/toner-suministros.png',
  },
  'toner-compatible': {
    keywords: ['toner', 'tóner', 'compatible', 'cartucho'],
    categories: [
      'Toner Compatible',
      'Toner Compatibles',
      'Toner, Toner Compatible',
      'Toner y Suministros, Toner Compatible',
      'Suministros, Toner Compatible',
    ],
    fallbackImage: '/categories/toner-suministros.png',
  },
  'casetera-pb-1160': {
    keywords: ['418475', 'pb 1160', 'pb1160', 'casetera', 'bandeja'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'casetera-250': {
    keywords: ['418080', 'pb1110', 'pb 1110', '250', 'paper bank', 'casetera'],
    categories: ['Accesorios', 'Repuestos', 'Repuestos Originales'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'casetera-500': {
    keywords: ['418081', '418475', 'pb1120', 'pb1160', 'pb 1120', 'pb 1160', '500', 'paper bank', 'paper feed', 'casetera'],
    categories: ['Accesorios', 'Repuestos', 'Repuestos Originales'],
    fallbackImage: '/categories/repuestos.png',
  },
  gabinete: {
    keywords: ['gabinete', 'tall cabinet', 'cabinet type', 'pedestal', 'mueble'],
    categories: ['Accesorios', 'Repuestos', 'Repuestos Originales'],
    fallbackImage: '/products/combo-gabinete-alto.webp',
  },
  'router-wifi': {
    keywords: ['router', 'wi-fi', 'wifi', 'gigabit'],
    categories: ['Soluciones de Negocio', 'Accesorios'],
    fallbackImage: '/categories/soluciones-negocio.png',
  },
  'tall-cabinet-u': {
    keywords: ['tall cabinet', 'cabinet type u', 'pedestal', 'cabinet'],
    categories: ['Accesorios', 'Repuestos'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'ocr-m13': {
    keywords: ['ocr', 'm13', 'pdf', 'reconocimiento'],
    categories: ['Accesorios', 'Repuestos', 'Suministros'],
    fallbackImage: '/categories/soluciones-negocio.png',
  },
  'estabilizador-2000w': {
    keywords: ['estabilizador', '2000', '2kva', 'solido', 'sólido', 'watts', 'estb', '220'],
    categories: ['Accesorios', 'Repuestos', 'Suministros', 'Soluciones de Negocio'],
    fallbackImage: '/categories/accesorios-impresoras.png',
  },
  'starter-kit': {
    keywords: ['kit', 'inicio', 'starter', 'toner'],
    categories: ['Suministros', 'Toner', 'Tóner'],
    fallbackImage: '/categories/toner-suministros.png',
  },
  'toner-extra': {
    keywords: ['toner', 'tóner', 'cartucho', 'negro'],
    categories: [
      'Toner, Suministros',
      'Suministros',
      'Toner y Suministros',
      'Toner',
      'Tóner',
      'Toner y Suministros, Toner Compatible',
      'Toner, Toner Compatible',
      'Toner Compatible',
      'Toner, Toner Compatibles',
      'Toner Compatibles',
      'Toner, Toner Original',
      'Toner Original',
    ],
    fallbackImage: '/categories/toner-suministros.png',
  },
  'kit-mantenimiento': {
    keywords: ['mantenimiento', 'kit', 'preventivo', 'unidad'],
    categories: [
      'Repuestos',
      'Repuestos, Repuestos Originales',
      'Repuestos Originales',
      'Toner, Suministros',
      'Suministros',
    ],
    fallbackImage: '/categories/repuestos.png',
  },
  'garantia-base': {
    keywords: ['garantia', 'garantía', 'cobertura'],
    fallbackImage: '/products/combo-garantia-extendida.webp',
  },
  'garantia-2y': {
    keywords: ['garantia', 'extendida', '2 años'],
    fallbackImage: '/products/combo-garantia-extendida.webp',
  },
  'garantia-3y': {
    keywords: ['garantia', 'extendida', '3 años'],
    fallbackImage: '/products/combo-garantia-extendida.webp',
  },
  'toner-ricoh-im-430f': {
    keywords: ['toner', 'im 430', '419078'],
    categories: ['Toner', 'Tóner', 'Toner Original'],
    fallbackImage: '/products/toner-419078.webp',
  },
  'toner-ricoh-im-600f': {
    keywords: ['toner', 'im 600', '418480', 'original'],
    categories: ['Toner', 'Tóner', 'Toner Original'],
    fallbackImage: '/products/toner-418480.webp',
  },
};

const SUPPLY_CATEGORY_HINTS = [
  'suministro',
  'toner',
  'tóner',
  'repuesto',
  'accesorio',
];

function haystack(product: Product): string {
  return normalizeSearchText(
    [
      product.name,
      product.code,
      product.description,
      product.brand,
      product.category,
      ...(product.attributes?.map((attr) => `${attr.name} ${attr.value}`) ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function matchesCategories(product: Product, categories?: string[]): boolean {
  if (!categories?.length) return true;
  const category = normalizeSearchText(product.category ?? '');
  return categories.some((value) => category.includes(normalizeSearchText(value)));
}

function scoreCatalogMatch(
  product: Product,
  hint: OptionCatalogHint,
  mainProduct: Product,
): number {
  if (!matchesCategories(product, hint.categories)) return 0;

  const text = haystack(product);
  let score = 0;

  for (const keyword of hint.keywords) {
    const term = normalizeSearchText(keyword);
    if (term && text.includes(term)) score += 10;
  }

  const mainBrand = normalizeSearchText(mainProduct.brand ?? '');
  const productBrand = normalizeSearchText(product.brand ?? '');
  if (mainBrand && productBrand && mainBrand === productBrand) score += 6;

  const mainModelTokens = normalizeSearchText(mainProduct.name)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !['ricoh', 'impresora', 'multifuncional', 'nueva'].includes(token));

  for (const token of mainModelTokens) {
    if (text.includes(token)) score += 4;
  }

  if (SUPPLY_CATEGORY_HINTS.some((value) => text.includes(value))) score += 2;

  return score;
}

function findCatalogProduct(
  catalog: Product[],
  hint: OptionCatalogHint,
  mainProduct: Product,
  options?: { requireEquipmentMatch?: boolean },
): Product | null {
  let best: Product | null = null;
  let bestScore = 0;

  for (const product of catalog) {
    if (product.id === mainProduct.id) continue;
    if (isTonerSupplyAssemblyProduct(product)) continue;
    // Evitar packs demo y productos sin precio público como match genérico.
    if (/\bPack x04\b/i.test(product.name) || (product.bundle_components?.length ?? 0) > 0) {
      continue;
    }
    const publicPrice = product.prices?.public ?? product.price;
    if (!(publicPrice > 0)) continue;
    if (options?.requireEquipmentMatch && !tonerProductMatchesEquipment(product, mainProduct)) {
      continue;
    }

    const score = scoreCatalogMatch(product, hint, mainProduct);
    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }

  return bestScore >= 10 ? best : null;
}

function isConsumableCatalogProduct(product: Product): boolean {
  const text = haystack(product);
  if (text.includes('impresora') || text.includes('multifuncional')) return false;
  if (isTonerSupplyAssemblyProduct(product)) return false;
  return (
    text.includes('toner') ||
    text.includes('cartucho') ||
    text.includes('suministro') ||
    text.includes('tambor') ||
    text.includes('unidad de imagen') ||
    text.includes('repuesto')
  );
}

function findTonerForEquipment(catalog: Product[], mainProduct: Product): Product | null {
  const matched = catalog
    .filter((product) => product.id !== mainProduct.id)
    .filter(isConsumableCatalogProduct)
    .filter((product) => !/\bPack x04\b/i.test(product.name))
    .filter((product) => (product.bundle_components?.length ?? 0) === 0)
    .filter((product) => (product.prices?.public ?? product.price) > 0)
    .filter((product) => tonerProductMatchesEquipment(product, mainProduct));

  return matched[0] ?? null;
}

function applyOptionImageFallback(
  option: EquipmentConfigOption,
  hint?: OptionCatalogHint,
): EquipmentConfigOption {
  // No inyectar imágenes demo genéricas de tóner (pack / categoría).
  if (option.id.startsWith('toner-')) return option;
  if (option.image || !hint?.fallbackImage) return option;
  return { ...option, image: hint.fallbackImage };
}

function resolveCatalogImage(product: Product): string | undefined {
  const url = resolveProductImageUrl(product);
  return url ?? undefined;
}

function mergeOptionFromCatalog(
  option: EquipmentConfigOption,
  match: Product,
  { preferOptionName = false }: { preferOptionName?: boolean } = {},
): EquipmentConfigOption {
  const priceUsd = ensureFullPrices(match.prices ?? { public: match.price }).public;
  const image = resolveCatalogImage(match);
  const catalogDescription = match.description?.trim();
  const mergedDescription = option.description?.trim() || catalogDescription;
  const resolvedPriceUsd =
    !option.included && option.priceUsd != null && option.priceUsd > 0
      ? option.priceUsd
      : priceUsd;
  const resolvedPricePen = option.included
    ? 0
    : option.pricePen > 0
      ? option.pricePen
      : usdToPen(resolvedPriceUsd);

  const catalogModelName = match.name?.trim();
  const resolvedDescription =
    preferOptionName && catalogModelName
      ? catalogModelName
      : mergedDescription;

  return {
    ...option,
    productId: match.id,
    sku:
      formatProductDisplayCode(match.code ?? match.id, {
        brand: match.brand,
        category: match.category,
        name: match.name,
      }) ??
      match.code ??
      match.id,
    name: preferOptionName && option.name.trim() ? option.name : match.name,
    ...(image ? { image } : {}),
    ...(option.included ? {} : { priceUsd: resolvedPriceUsd }),
    pricePen: resolvedPricePen,
    ...(resolvedDescription ? { description: resolvedDescription } : {}),
  };
}

function resolveCatalogLinkedProduct(
  option: EquipmentConfigOption,
  catalog: Product[],
  mainProduct: Product,
): Product | undefined {
  if (!option.productId) return undefined;
  const linked = catalog.find(
    (product) => product.id === option.productId && product.id !== mainProduct.id,
  );
  return linked;
}

function enrichOption(
  option: EquipmentConfigOption,
  catalog: Product[],
  mainProduct: Product,
): EquipmentConfigOption {
  const hint = OPTION_CATALOG_HINTS[option.id];
  let enriched = option;

  const mergeFromCatalog = (match: Product) => {
    enriched = mergeOptionFromCatalog(option, match, { preferOptionName: true });
  };

  const configuredProductId = option.productId?.trim();
  const linkedByProductId = configuredProductId
    ? resolveCatalogLinkedProduct(option, catalog, mainProduct)
    : undefined;
  if (linkedByProductId) {
    mergeFromCatalog(linkedByProductId);
  }

  if (!configuredProductId) {
    if (option.sku) {
      const skuMatch = catalog.find(
        (product) =>
          product.id !== mainProduct.id &&
          normalizeSearchText(product.code ?? '') === normalizeSearchText(option.sku ?? ''),
      );
      if (skuMatch) {
        mergeFromCatalog(skuMatch);
      }
    } else if (hint) {
      const match = findCatalogProduct(catalog, hint, mainProduct, {
        requireEquipmentMatch: option.id.startsWith('toner-'),
      });
      if (match && (!option.id.startsWith('toner-') || isTonerMerchandisingProduct(match))) {
        mergeFromCatalog(match);
      }
    }

    const linkedAfterHints = resolveCatalogLinkedProduct(enriched, catalog, mainProduct);
    if (
      !linkedAfterHints &&
      (option.id === 'toner-compatible' || option.id === 'toner-inicio' || option.id.startsWith('toner-'))
    ) {
      const toner = findTonerForEquipment(catalog, mainProduct);
      if (
        toner &&
        option.id === 'toner-compatible' &&
        isTonerMerchandisingProduct(toner)
      ) {
        mergeFromCatalog(toner);
      }

      const tonerImage = toner ? resolveCatalogImage(toner) : undefined;
      if (tonerImage && !enriched.image) {
        enriched = { ...enriched, image: tonerImage };
      }
    }
  }

  return applyOptionImageFallback(enriched, hint);
}

export function resolveEquipmentConfigSteps(
  steps: EquipmentConfigStep[],
  catalog: Product[],
  mainProduct: Product,
): EquipmentConfigStep[] {
  return steps.map((step) => ({
    ...step,
    options: step.options.map((option) => enrichOption(option, catalog, mainProduct)),
  }));
}

export function resolveAccessoryProducts(
  options: Array<Pick<EquipmentConfigOption, 'productId' | 'pricePen' | 'included'>>,
  catalog: Product[],
): Product[] {
  return options
    .filter((option) => !option.included && option.pricePen > 0 && option.productId)
    .map((option) => catalog.find((product) => product.id === option.productId))
    .filter((product): product is Product => Boolean(product));
}

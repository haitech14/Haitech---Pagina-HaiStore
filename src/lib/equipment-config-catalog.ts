import { ensureFullPrices } from '@/lib/roles';
import { resolveProductImageUrl } from '@/lib/product-image-url';
import { normalizeSearchText } from '@/lib/product-search';
import { usdToPen } from '@/lib/utils';
import type { EquipmentConfigOption, EquipmentConfigStep } from '@/types/product-detail';
import type { Product } from '@/types/product';

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
      'Toner',
      'Tóner',
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
  'waste-bottle': {
    keywords: ['residual', 'waste', 'botella', 'toner'],
    categories: ['Suministros', 'Repuestos', 'Toner'],
    fallbackImage: '/categories/toner-suministros.png',
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
): Product | null {
  let best: Product | null = null;
  let bestScore = 0;

  for (const product of catalog) {
    if (product.id === mainProduct.id) continue;
    const score = scoreCatalogMatch(product, hint, mainProduct);
    if (score > bestScore) {
      bestScore = score;
      best = product;
    }
  }

  return bestScore >= 10 ? best : null;
}

function enrichOption(
  option: EquipmentConfigOption,
  catalog: Product[],
  mainProduct: Product,
): EquipmentConfigOption {
  const hint = OPTION_CATALOG_HINTS[option.id];
  const fallbackImage = hint?.fallbackImage ?? '/categories/repuestos.png';
  const match = hint ? findCatalogProduct(catalog, hint, mainProduct) : null;

  if (!match) {
    return {
      ...option,
      image: option.image ?? fallbackImage,
    };
  }

  const priceUsd = ensureFullPrices(match.prices ?? { public: match.price }).public;
  const image = resolveProductImageUrl(match) ?? fallbackImage;
  const description = option.description ?? match.description;

  return {
    ...option,
    productId: match.id,
    sku: match.code ?? match.id,
    name: match.name,
    image,
    priceUsd,
    pricePen: option.included ? 0 : usdToPen(priceUsd),
    ...(description ? { description } : {}),
  };
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

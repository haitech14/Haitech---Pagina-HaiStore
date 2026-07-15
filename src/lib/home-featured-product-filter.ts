import type { FeaturedProduct } from '@/data/featured-products';
import type {
  HomeFeaturedConsumablesCategoryFilterId,
  HomeFeaturedConsumablesConditionFilterId,
} from '@/data/home-featured-quick-filters-consumables';
import type {
  HomeFeaturedEquipmentCategoryFilterId,
  HomeFeaturedEquipmentConditionFilterId,
} from '@/data/home-featured-quick-filters-equipment';
import { HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS } from '@/lib/home-equipment-category-links';
import type { HomeFeaturedSpecFilterId } from '@/data/home-featured-quick-filters-spec';
import { inferColor, resolveCatalogListFormatoPapel } from '@/lib/category-catalog-filters';
import { findCategoryBySlug, getCategoryProductLabels } from '@/lib/category-product-labels';
import { productMatchesCategoryFilter } from '@/lib/inventory-categories';
import { isPrinterProduct } from '@/lib/product-detail-badges';
import {
  isPrinterEquipmentProduct,
  productMatchesCatalogFamily,
  productMatchesCondition,
  type CatalogFamilySlug,
  type ProductCondition,
} from '@/lib/product-condition';
import type { Product } from '@/types/product';

const EQUIPMENT_CONDITION_FILTER_TO_PRODUCT_CONDITION: Record<
  HomeFeaturedEquipmentConditionFilterId,
  ProductCondition
> = {
  nuevas: 'originales',
  seminuevas: 'compatibles',
  remanufacturadas: 'remanufacturados',
};

const CONSUMABLES_CONDITION_FILTER_TO_PRODUCT_CONDITION: Record<
  Exclude<HomeFeaturedConsumablesConditionFilterId, 'recargas'>,
  ProductCondition
> = {
  originales: 'originales',
  compatibles: 'compatibles',
  remanufacturados: 'remanufacturados',
};

const EQUIPMENT_CATEGORY_FILTER_TO_CATALOG_FAMILY: Partial<
  Record<HomeFeaturedEquipmentCategoryFilterId, CatalogFamilySlug>
> = {
  multifuncionales: 'multifuncionales',
  'impresora-laser': 'impresoras',
};

const CONSUMABLES_CATEGORY_FILTER_TO_CATALOG_FAMILY: Record<
  HomeFeaturedConsumablesCategoryFilterId,
  CatalogFamilySlug
> = {
  toner: 'toner-suministros',
  'repuestos-cat': 'repuestos',
  tintas: 'toner-suministros',
  'unidad-imagen-kit-mantenimiento': 'repuestos',
  'unidad-fusora': 'repuestos',
  'unidad-transferencia': 'repuestos',
  tarjetas: 'repuestos',
};

function normalizeProductText(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function asProduct(product: FeaturedProduct): Product {
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    brand: product.brand ?? null,
    code: product.code ?? null,
    attributes: product.attributes ?? [],
    price: product.price,
    ...(product.prices !== undefined ? { prices: product.prices } : {}),
    ...(product.price_role !== undefined ? { price_role: product.price_role } : {}),
    image_url: product.image,
    gallery: [],
    stock: 0,
    currency: 'USD',
    description: null,
    slug: product.id,
    sort_order: 0,
    is_featured: false,
    view_count: 0,
    created_at: '',
  };
}

function featuredProductAttributeText(product: FeaturedProduct): string {
  return (product.attributes ?? [])
    .map((attribute) => `${attribute.name ?? ''} ${attribute.value ?? ''}`)
    .join(' ');
}

function productHaystack(product: FeaturedProduct): string {
  return normalizeProductText(
    `${product.category} ${product.name} ${product.brand ?? ''} ${product.code ?? ''} ${featuredProductAttributeText(product)}`,
  );
}

function matchesCategoryLabels(product: FeaturedProduct, slug: string): boolean {
  const category = findCategoryBySlug(slug);
  if (!category) return false;
  const labels = getCategoryProductLabels(category);
  return labels.some((label) => productMatchesCategoryFilter(product, label));
}

export function isHomeFeaturedConsumableProduct(product: FeaturedProduct): boolean {
  const row = asProduct(product);

  if (productMatchesCatalogFamily(row, 'toner-suministros')) return true;
  if (productMatchesCatalogFamily(row, 'repuestos') && !isPrinterEquipmentProduct(row)) {
    return true;
  }

  const haystack = productHaystack(product);
  if (
    haystack.includes('toner') ||
    haystack.includes('cartucho') ||
    haystack.includes('suministro') ||
    haystack.includes('consumible') ||
    haystack.includes('repuesto') ||
    haystack.includes('cilindro') ||
    haystack.includes('tambor') ||
    haystack.includes('fusor') ||
    haystack.includes('rodillo')
  ) {
    return !isPrinterProduct(product);
  }

  return false;
}

function isMultifuncionalProduct(product: FeaturedProduct): boolean {
  const row = asProduct(product);
  return (
    productMatchesCatalogFamily(row, 'multifuncionales') ||
    matchesCategoryLabels(product, 'multifuncionales')
  );
}

function isImpresoraBaseProduct(product: FeaturedProduct): boolean {
  if (isMultifuncionalProduct(product)) return false;
  if (isPlotterProduct(product)) return false;
  if (isMultifuncionalPlanosProduct(product)) return false;

  const row = asProduct(product);
  const haystack = productHaystack(product);

  if (haystack.includes('formato ancho')) return false;

  return (
    productMatchesCatalogFamily(row, 'impresoras') ||
    matchesCategoryLabels(product, 'impresoras') ||
    (haystack.includes('impresor') && !haystack.includes('multifuncional'))
  );
}

function isImpresoraTermicaProduct(product: FeaturedProduct): boolean {
  if (!isImpresoraBaseProduct(product)) return false;

  const haystack = productHaystack(product);

  return (
    haystack.includes('termic') ||
    haystack.includes('thermal') ||
    haystack.includes('recibo') ||
    haystack.includes('receipt') ||
    /\bpos\b/.test(haystack) ||
    haystack.includes('ticket')
  );
}

function isImpresoraMatricialProduct(product: FeaturedProduct): boolean {
  if (!isImpresoraBaseProduct(product)) return false;

  const haystack = productHaystack(product);

  return (
    haystack.includes('matricial') ||
    haystack.includes('matrix') ||
    haystack.includes('dot matrix') ||
    haystack.includes('impact') ||
    haystack.includes('punto')
  );
}

function isImpresoraTintaProduct(product: FeaturedProduct): boolean {
  if (!isImpresoraBaseProduct(product)) return false;
  if (isImpresoraTermicaProduct(product)) return false;
  if (isImpresoraMatricialProduct(product)) return false;

  const haystack = productHaystack(product);

  return (
    haystack.includes('inkjet') ||
    haystack.includes('ink jet') ||
    haystack.includes('ecotank') ||
    haystack.includes('eco tank') ||
    haystack.includes('inyeccion') ||
    haystack.includes('bubble jet') ||
    haystack.includes('workforce') ||
    haystack.includes('impresora de tinta') ||
    haystack.includes('impresora tinta') ||
    (haystack.includes('tinta') &&
      !haystack.includes('toner') &&
      !haystack.includes('laser') &&
      !haystack.includes('cartucho'))
  );
}

function isImpresoraLaserProduct(product: FeaturedProduct): boolean {
  if (!isImpresoraBaseProduct(product)) return false;
  if (isImpresoraTermicaProduct(product)) return false;
  if (isImpresoraMatricialProduct(product)) return false;
  if (isImpresoraTintaProduct(product)) return false;

  // Las impresoras del catálogo sin subtipo explícito se clasifican como láser
  // (coherente con subcategorías impresoras-laser-* en tienda).
  return true;
}

function isAnyImpresoraProduct(product: FeaturedProduct): boolean {
  return (
    isImpresoraLaserProduct(product) ||
    isImpresoraTintaProduct(product) ||
    isImpresoraTermicaProduct(product) ||
    isImpresoraMatricialProduct(product)
  );
}

function isMultifuncionalPlanosProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);

  return (
    haystack.includes('multifuncional de planos') ||
    haystack.includes('mfp z') ||
    (haystack.includes('mfp') && haystack.includes('gran formato')) ||
    (haystack.includes('multifuncional') && haystack.includes('planos'))
  );
}

function isPlotterProduct(product: FeaturedProduct): boolean {
  if (isMultifuncionalPlanosProduct(product)) return false;

  const haystack = productHaystack(product);

  return (
    haystack.includes('plotter') ||
    (haystack.includes('gran formato') &&
      haystack.includes('impresor') &&
      !haystack.includes('mfp'))
  );
}

function isPantallasInteractivasProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);

  return (
    matchesCategoryLabels(product, HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS['pantallas-interactivas']) ||
    haystack.includes('pizarra interactiva') ||
    haystack.includes('pantalla interactiva') ||
    haystack.includes('ifpd')
  );
}

function isVideoconferenciaProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);

  return (
    matchesCategoryLabels(product, HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS.videoconferencia) ||
    haystack.includes('videoconferencia') ||
    haystack.includes('sala de reunion')
  );
}

function isLaptopProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);

  return (
    matchesCategoryLabels(product, HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS.laptops) ||
    haystack.includes('laptop') ||
    haystack.includes('notebook') ||
    haystack.includes('macbook')
  );
}

export function isHomeFeaturedEquipmentProduct(product: FeaturedProduct): boolean {
  if (isHomeFeaturedConsumableProduct(product)) return false;

  return (
    isMultifuncionalProduct(product) ||
    isAnyImpresoraProduct(product) ||
    matchesCategoryLabels(product, 'escaneres') ||
    isPlotterProduct(product) ||
    isMultifuncionalPlanosProduct(product) ||
    isPantallasInteractivasProduct(product) ||
    isVideoconferenciaProduct(product) ||
    isLaptopProduct(product) ||
    matchesCategoryLabels(product, 'accesorios') ||
    isPrinterProduct(product)
  );
}

export function matchesHomeFeaturedEquipmentConditionFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedEquipmentConditionFilterId,
  categoryFilter?: HomeFeaturedEquipmentCategoryFilterId,
): boolean {
  const row = asProduct(product);
  const productCondition = EQUIPMENT_CONDITION_FILTER_TO_PRODUCT_CONDITION[filterId];
  const family = categoryFilter
    ? (EQUIPMENT_CATEGORY_FILTER_TO_CATALOG_FAMILY[categoryFilter] ?? null)
    : null;

  return productMatchesCondition(row, productCondition, family);
}

export function matchesHomeFeaturedEquipmentCategoryFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedEquipmentCategoryFilterId,
): boolean {
  if (isHomeFeaturedConsumableProduct(product)) return false;

  const haystack = productHaystack(product);

  switch (filterId) {
    case 'multifuncionales':
      return isMultifuncionalProduct(product);
    case 'impresora-laser':
      return isImpresoraLaserProduct(product);
    case 'impresora-tinta':
      return isImpresoraTintaProduct(product);
    case 'impresora-termica':
      return isImpresoraTermicaProduct(product);
    case 'impresora-matricial':
      return isImpresoraMatricialProduct(product);
    case 'escaneres':
      return (
        matchesCategoryLabels(product, HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS.escaneres) ||
        haystack.includes('escaner') ||
        haystack.includes('scanner')
      );
    case 'plotter':
      return isPlotterProduct(product);
    case 'multifuncional-planos':
      return isMultifuncionalPlanosProduct(product);
    case 'pantallas-interactivas':
      return isPantallasInteractivasProduct(product);
    case 'videoconferencia':
      return isVideoconferenciaProduct(product);
    case 'laptops':
      return isLaptopProduct(product);
    case 'accesorios':
      return matchesCategoryLabels(product, HOME_EQUIPMENT_CATEGORY_FILTER_SLUGS.accesorios);
    default: {
      const _exhaustive: never = filterId;
      return _exhaustive;
    }
  }
}

function isRicohBrand(product: FeaturedProduct): boolean {
  return /ricoh/i.test(product.brand ?? '') || /ricoh/i.test(product.name);
}

export function compareHomeFeaturedEquipmentProducts(
  a: FeaturedProduct,
  b: FeaturedProduct,
): number {
  const priceDelta = (a.price ?? 0) - (b.price ?? 0);
  if (priceDelta !== 0) return priceDelta;

  const ricohDelta = Number(isRicohBrand(b)) - Number(isRicohBrand(a));
  if (ricohDelta !== 0) return ricohDelta;

  return a.name.localeCompare(b.name, 'es');
}

export function matchesHomeFeaturedSpecFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedSpecFilterId,
): boolean {
  const row = asProduct(product);
  const haystack = productHaystack(product);

  switch (filterId) {
    case 'a4':
      return resolveCatalogListFormatoPapel(row) === 'A4' || /\ba4\b/.test(haystack);
    case 'color':
      return inferColor(row) === 'Color';
    case 'bn':
      return inferColor(row) === 'B/N';
    default:
      return true;
  }
}

export function matchesHomeFeaturedEquipmentFilters(
  product: FeaturedProduct,
  conditionFilter: HomeFeaturedEquipmentConditionFilterId,
  categoryFilter: HomeFeaturedEquipmentCategoryFilterId,
  specFilter?: HomeFeaturedSpecFilterId | null,
): boolean {
  if (!isHomeFeaturedEquipmentProduct(product)) return false;

  return (
    matchesHomeFeaturedEquipmentCategoryFilter(product, categoryFilter) &&
    matchesHomeFeaturedEquipmentConditionFilter(product, conditionFilter, categoryFilter) &&
    (specFilter == null || matchesHomeFeaturedSpecFilter(product, specFilter))
  );
}

function hasRecargaKeyword(haystack: string): boolean {
  return (
    haystack.includes('recarga') ||
    haystack.includes('refill') ||
    haystack.includes('relleno')
  );
}

export function resolveHomeLandingConsumableSubtitle(
  product: Pick<FeaturedProduct, 'id' | 'name' | 'category' | 'brand' | 'code' | 'attributes'>,
): string | null {
  const featured: FeaturedProduct = {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    code: product.code ?? null,
    attributes: product.attributes ?? [],
    price: 0,
    rating: 0,
    reviews: 0,
    image: null,
  };

  if (!isHomeFeaturedConsumableProduct(featured)) return null;
  if (isConsumablesTonerProduct(featured)) return 'Toner Cartucho Original';
  return 'Repuesto Original';
}

function isConsumablesTonerProduct(product: FeaturedProduct): boolean {
  const row = asProduct(product);
  if (!productMatchesCatalogFamily(row, 'toner-suministros')) return false;
  if (isConsumablesTintasProduct(product)) return false;

  const haystack = productHaystack(product);
  return (
    haystack.includes('toner') ||
    haystack.includes('tóner') ||
    haystack.includes('suministro') ||
    haystack.includes('consumible')
  );
}

function isConsumablesTintasProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  return (
    haystack.includes('tinta') ||
    haystack.includes('inkjet') ||
    (haystack.includes('ink') && !haystack.includes('toner') && !haystack.includes('tóner'))
  );
}

function isConsumablesRepuestosCategoryProduct(product: FeaturedProduct): boolean {
  const row = asProduct(product);
  return (
    productMatchesCatalogFamily(row, 'repuestos') ||
    matchesCategoryLabels(product, 'repuestos')
  );
}

function isConsumablesUnidadImagenKitMantenimientoProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  return (
    haystack.includes('unidad de imagen') ||
    haystack.includes('imaging unit') ||
    haystack.includes('photoconductor') ||
    haystack.includes('tambor') ||
    haystack.includes('drum') ||
    haystack.includes('cilindro') ||
    haystack.includes('opc drum') ||
    /\bopc\b/.test(haystack) ||
    (haystack.includes('unidad') && haystack.includes(' du')) ||
    haystack.includes('kit de mantenimiento') ||
    haystack.includes('kit mantenimiento') ||
    haystack.includes('maintenance kit') ||
    (haystack.includes('kit') &&
      (haystack.includes('mantenimiento') ||
        haystack.includes('ruedas') ||
        haystack.includes('rodillo')))
  );
}

function isConsumablesUnidadFusoraProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  if (haystack.includes('transferencia') || haystack.includes('transfer belt')) return false;

  return (
    haystack.includes('unidad fusora') ||
    haystack.includes('fusor') ||
    haystack.includes('fuser') ||
    haystack.includes('faja fusora') ||
    haystack.includes('fajas fusoras') ||
    haystack.includes('rodillo de calor') ||
    haystack.includes('rodillos de calor') ||
    haystack.includes('rodillo de presion') ||
    haystack.includes('rodillo de presión') ||
    haystack.includes('rodillos de presion') ||
    haystack.includes('rodillos de presión')
  );
}

function isConsumablesUnidadTransferenciaProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  return (
    haystack.includes('unidad de transferencia') ||
    haystack.includes('transfer unit') ||
    haystack.includes('faja de transferencia') ||
    haystack.includes('fajas de transferencia') ||
    haystack.includes('transfer belt') ||
    haystack.includes('belt transfer') ||
    haystack.includes('transfer roller') ||
    haystack.includes('rodillo de transferencia') ||
    haystack.includes('rodillos de transferencia')
  );
}

function isConsumablesTarjetasProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  return (
    haystack.includes('tarjeta') ||
    haystack.includes('card') ||
    haystack.includes('nic') ||
    haystack.includes('network interface') ||
    haystack.includes('interfaz de red') ||
    haystack.includes('placa de red') ||
    haystack.includes('wireless lan') ||
    haystack.includes('wlan')
  );
}

export function matchesHomeFeaturedConsumablesCategoryFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedConsumablesCategoryFilterId,
): boolean {
  if (!isHomeFeaturedConsumableProduct(product)) return false;

  switch (filterId) {
    case 'toner':
      return isConsumablesTonerProduct(product);
    case 'repuestos-cat':
      return isConsumablesRepuestosCategoryProduct(product);
    case 'tintas':
      return isConsumablesTintasProduct(product);
    case 'unidad-imagen-kit-mantenimiento':
      return isConsumablesUnidadImagenKitMantenimientoProduct(product);
    case 'unidad-fusora':
      return isConsumablesUnidadFusoraProduct(product);
    case 'unidad-transferencia':
      return isConsumablesUnidadTransferenciaProduct(product);
    case 'tarjetas':
      return isConsumablesTarjetasProduct(product);
    default: {
      const _exhaustive: never = filterId;
      return _exhaustive;
    }
  }
}

export function matchesHomeFeaturedConsumablesConditionFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedConsumablesConditionFilterId,
  categoryFilter: HomeFeaturedConsumablesCategoryFilterId,
): boolean {
  const row = asProduct(product);
  const haystack = productHaystack(product);
  const catalogFamily = CONSUMABLES_CATEGORY_FILTER_TO_CATALOG_FAMILY[categoryFilter];

  if (filterId === 'recargas') {
    if (!hasRecargaKeyword(haystack)) return false;
    return matchesHomeFeaturedConsumablesCategoryFilter(product, categoryFilter);
  }

  if (filterId === 'remanufacturados') {
    if (hasRecargaKeyword(haystack)) return false;
    return (
      productMatchesCondition(row, 'remanufacturados', catalogFamily) &&
      matchesHomeFeaturedConsumablesCategoryFilter(product, categoryFilter)
    );
  }

  const productCondition = CONSUMABLES_CONDITION_FILTER_TO_PRODUCT_CONDITION[filterId];

  return (
    productMatchesCondition(row, productCondition, catalogFamily) &&
    matchesHomeFeaturedConsumablesCategoryFilter(product, categoryFilter)
  );
}

export function compareHomeFeaturedConsumablesProducts(
  a: FeaturedProduct,
  b: FeaturedProduct,
): number {
  const priceDelta = (a.price ?? 0) - (b.price ?? 0);
  if (priceDelta !== 0) return priceDelta;

  const ricohDelta = Number(isRicohBrand(b)) - Number(isRicohBrand(a));
  if (ricohDelta !== 0) return ricohDelta;

  return a.name.localeCompare(b.name, 'es');
}

export function matchesHomeFeaturedConsumablesFilters(
  product: FeaturedProduct,
  conditionFilter: HomeFeaturedConsumablesConditionFilterId,
  categoryFilter: HomeFeaturedConsumablesCategoryFilterId,
  specFilter?: HomeFeaturedSpecFilterId | null,
): boolean {
  if (!isHomeFeaturedConsumableProduct(product)) return false;

  return (
    matchesHomeFeaturedConsumablesConditionFilter(product, conditionFilter, categoryFilter) &&
    (specFilter == null || matchesHomeFeaturedSpecFilter(product, specFilter))
  );
}

/** @deprecated Use matchesHomeFeaturedEquipmentCategoryFilter */
export function matchesHomeFeaturedCategoryFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedEquipmentCategoryFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentCategoryFilter(product, filterId);
}

/** @deprecated Use matchesHomeFeaturedEquipmentConditionFilter */
export function matchesHomeFeaturedConditionFilter(
  product: FeaturedProduct,
  filterId: HomeFeaturedEquipmentConditionFilterId,
  categoryFilter?: HomeFeaturedEquipmentCategoryFilterId,
): boolean {
  return matchesHomeFeaturedEquipmentConditionFilter(product, filterId, categoryFilter);
}

/** @deprecated Use matchesHomeFeaturedEquipmentFilters */
export function matchesHomeFeaturedFilters(
  product: FeaturedProduct,
  conditionFilter: HomeFeaturedEquipmentConditionFilterId,
  categoryFilter: HomeFeaturedEquipmentCategoryFilterId,
  specFilter: HomeFeaturedSpecFilterId | null = null,
): boolean {
  return matchesHomeFeaturedEquipmentFilters(
    product,
    conditionFilter,
    categoryFilter,
    specFilter,
  );
}

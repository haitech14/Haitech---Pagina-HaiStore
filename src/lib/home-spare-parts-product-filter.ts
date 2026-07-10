import type { FeaturedProduct } from '@/data/featured-products';
import type {
  HomeFindSparePartsCategoryId,
  HomeFindSparePartsFilterId,
} from '@/data/home-find-what-you-need';
import { productMatchesCondition, type ProductCondition } from '@/lib/product-condition';
import {
  isHomeFeaturedConsumableProduct,
  compareHomeFeaturedConsumablesProducts,
} from '@/lib/home-featured-product-filter';
import type { Product } from '@/types/product';

const SPARE_PARTS_CONDITION_FILTER_TO_PRODUCT_CONDITION: Record<
  Extract<HomeFindSparePartsFilterId, 'originales' | 'compatibles'>,
  ProductCondition
> = {
  originales: 'originales',
  compatibles: 'compatibles',
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
    stock: product.stock ?? 0,
    currency: 'USD',
    description: null,
    slug: product.id,
    sort_order: 0,
    is_featured: false,
    view_count: 0,
    created_at: '',
  };
}

function productHaystack(product: FeaturedProduct): string {
  const attributes = (product.attributes ?? [])
    .map((attribute) => `${attribute.name ?? ''} ${attribute.value ?? ''}`)
    .join(' ');

  return normalizeProductText(
    `${product.category} ${product.name} ${product.brand ?? ''} ${product.code ?? ''} ${attributes}`,
  );
}

function isSparePartsTonerOrConsumable(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  return (
    haystack.includes('toner') ||
    haystack.includes('tóner') ||
    haystack.includes('cartucho') ||
    haystack.includes('tinta') ||
    haystack.includes('inkjet') ||
    (haystack.includes('ink') && !haystack.includes('toner'))
  );
}

export function isHomeFeaturedSparePartsProduct(product: FeaturedProduct): boolean {
  if (!isHomeFeaturedConsumableProduct(product)) return false;
  if (isSparePartsTonerOrConsumable(product)) return false;

  const haystack = productHaystack(product);

  return (
    haystack.includes('repuesto') ||
    haystack.includes('kit') ||
    haystack.includes('fusor') ||
    haystack.includes('fuser') ||
    haystack.includes('rodillo') ||
    haystack.includes('roller') ||
    haystack.includes('tarjeta') ||
    haystack.includes('unidad de imagen') ||
    haystack.includes('tambor') ||
    haystack.includes('cilindro') ||
    haystack.includes('transferencia') ||
    haystack.includes('transfer belt') ||
    haystack.includes('maintenance')
  );
}

function isSparePartsKitMantenimientoProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  return (
    haystack.includes('kit de mantenimiento') ||
    haystack.includes('kit mantenimiento') ||
    haystack.includes('maintenance kit') ||
    (haystack.includes('kit') &&
      (haystack.includes('mantenimiento') ||
        haystack.includes('ruedas') ||
        haystack.includes('rodillo')))
  );
}

function isSparePartsFusorasProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  if (haystack.includes('transferencia') || haystack.includes('transfer belt')) return false;

  return (
    haystack.includes('unidad fusora') ||
    haystack.includes('fusor') ||
    haystack.includes('fuser') ||
    haystack.includes('faja fusora') ||
    haystack.includes('rodillo de calor') ||
    haystack.includes('rodillo de presion') ||
    haystack.includes('rodillo de presión')
  );
}

function isSparePartsTarjetasProduct(product: FeaturedProduct): boolean {
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

function isSparePartsRodillosProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  if (isSparePartsFusorasProduct(product)) return false;
  if (isSparePartsTransferenciaProduct(product)) return false;

  return (
    haystack.includes('rodillo') ||
    haystack.includes('roller') ||
    haystack.includes('pickup') ||
    haystack.includes('feed roller') ||
    haystack.includes('separation roller') ||
    haystack.includes('paper feed')
  );
}

function isSparePartsUnidadesImagenProduct(product: FeaturedProduct): boolean {
  const haystack = productHaystack(product);
  if (isSparePartsKitMantenimientoProduct(product)) return false;

  return (
    haystack.includes('unidad de imagen') ||
    haystack.includes('imaging unit') ||
    haystack.includes('photoconductor') ||
    haystack.includes('tambor') ||
    haystack.includes('drum') ||
    haystack.includes('cilindro') ||
    haystack.includes('opc drum') ||
    /\bopc\b/.test(haystack) ||
    (haystack.includes('unidad') && haystack.includes(' du'))
  );
}

function isSparePartsTransferenciaProduct(product: FeaturedProduct): boolean {
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
    haystack.includes('rodillos de transferencia') ||
    haystack.includes('cuchilla de transferencia') ||
    haystack.includes('cuchillas de transferencia')
  );
}

export function matchesHomeFindSparePartsCategoryFilter(
  product: FeaturedProduct,
  filterId: HomeFindSparePartsCategoryId,
): boolean {
  if (!isHomeFeaturedSparePartsProduct(product)) return false;

  switch (filterId) {
    case 'kit-mantenimiento':
      return isSparePartsKitMantenimientoProduct(product);
    case 'fusoras':
      return isSparePartsFusorasProduct(product);
    case 'tarjetas':
      return isSparePartsTarjetasProduct(product);
    case 'rodillos':
      return isSparePartsRodillosProduct(product);
    case 'unidades-imagen':
      return isSparePartsUnidadesImagenProduct(product);
    case 'transferencia':
      return isSparePartsTransferenciaProduct(product);
    default: {
      const _exhaustive: never = filterId;
      return _exhaustive;
    }
  }
}

function resolveProductStock(product: FeaturedProduct): number {
  return Math.max(0, Math.floor(Number(product.stock) || 0));
}

export function matchesHomeFindSparePartsFilter(
  product: FeaturedProduct,
  filterId: HomeFindSparePartsFilterId,
  categoryId: HomeFindSparePartsCategoryId,
): boolean {
  if (!matchesHomeFindSparePartsCategoryFilter(product, categoryId)) return false;

  if (filterId === 'disponibles') {
    return resolveProductStock(product) > 0;
  }

  if (filterId === 'a-pedido') {
    return resolveProductStock(product) <= 0;
  }

  const row = asProduct(product);
  const productCondition = SPARE_PARTS_CONDITION_FILTER_TO_PRODUCT_CONDITION[filterId];

  return productMatchesCondition(row, productCondition, 'repuestos');
}

export function matchesHomeFindSparePartsFilters(
  product: FeaturedProduct,
  filterId: HomeFindSparePartsFilterId,
  categoryId: HomeFindSparePartsCategoryId,
): boolean {
  return matchesHomeFindSparePartsFilter(product, filterId, categoryId);
}

export function compareHomeFindSparePartsProducts(
  a: FeaturedProduct,
  b: FeaturedProduct,
): number {
  return compareHomeFeaturedConsumablesProducts(a, b);
}

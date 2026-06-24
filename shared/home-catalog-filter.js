/** Filtros de catálogo home (paridad con src/lib/product-condition.ts y store-products.ts). */

import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from './inventory-product-name.js';
import { isHomeCarouselExcludedProduct } from './home-excluded-products.js';

export const PRODUCT_CONDITIONS = ['originales', 'compatibles', 'remanufacturados', 'partes'];

export const EQUIPMENT_PRODUCT_CONDITIONS = ['originales', 'compatibles', 'remanufacturados'];

export function getConditionsForCatalogFamily(family) {
  if (family === 'multifuncionales' || family === 'impresoras') {
    return EQUIPMENT_PRODUCT_CONDITIONS;
  }
  return PRODUCT_CONDITIONS;
}

function productHaystack(product) {
  return `${product.category ?? ''} ${product.name} ${product.description ?? ''}`.toLowerCase();
}

function normalizeCategoryName(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim();
}

function productCategoryTags(product) {
  const raw = product.category?.trim();
  if (!raw) return [];
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [raw];
}

export function productMatchesCategoryFilter(product, filterValue) {
  if (filterValue === 'all') return true;
  const target = normalizeCategoryName(filterValue);
  const raw = product.category?.trim();
  if (raw && normalizeCategoryName(raw) === target) return true;
  return productCategoryTags(product).some((tag) => normalizeCategoryName(tag) === target);
}

function categoryIndicatesFamily(category, family) {
  if (!category?.trim()) return false;
  const haystack = category.toLowerCase();

  switch (family) {
    case 'multifuncionales':
      return haystack.includes('multifuncional');
    case 'impresoras':
      return haystack.includes('impresor') && !haystack.includes('multifuncional');
    case 'toner-suministros':
      return (
        (haystack.includes('toner') ||
          haystack.includes('tóner') ||
          haystack.includes('suministro') ||
          haystack.includes('consumible') ||
          haystack.includes('cartucho')) &&
        !haystack.includes('repuesto')
      );
    case 'repuestos':
      return (
        haystack.includes('repuesto') ||
        haystack.includes('partes') ||
        haystack.includes('tambor') ||
        haystack.includes('fusor') ||
        haystack.includes('rodillo') ||
        haystack.includes('mantenimiento')
      );
    default:
      return false;
  }
}

function hasPartes(haystack) {
  return (
    haystack.includes('repuesto') ||
    haystack.includes('partes') ||
    haystack.includes('tambor') ||
    haystack.includes('fusor') ||
    haystack.includes('fusing') ||
    haystack.includes('rodillo') ||
    haystack.includes('transfer roller') ||
    haystack.includes('waste toner') ||
    haystack.includes('waste bottle') ||
    haystack.includes('kit de mantenimiento') ||
    haystack.includes('unidad de imagen')
  );
}

function hasRemanufactured(haystack) {
  return (
    haystack.includes('remanufactur') ||
    haystack.includes('reacondicion') ||
    haystack.includes('recarga') ||
    haystack.includes('refill') ||
    haystack.includes('relleno')
  );
}

function hasCompatible(haystack) {
  return (
    haystack.includes('compatible') ||
    haystack.includes('compat') ||
    haystack.includes('->') ||
    haystack.includes('alternativ') ||
    haystack.includes('seminuev') ||
    haystack.includes('semi-nuev') ||
    haystack.includes('semi nuev') ||
    haystack.includes('usad') ||
    haystack.includes('segunda mano') ||
    haystack.includes('open box')
  );
}

function hasOriginal(haystack) {
  return (
    haystack.includes('original') ||
    haystack.includes('originales') ||
    haystack.includes('oem') ||
    haystack.includes('genuine') ||
    haystack.includes('nueva') ||
    haystack.includes('nuevo')
  );
}

export function isPrinterEquipmentProduct(product) {
  const haystack = productHaystack(product);
  if (categoryIndicatesFamily(product.category, 'repuestos')) {
    return false;
  }
  return (
    haystack.includes('impresora') ||
    (haystack.includes('multifuncional') && !haystack.includes('repuesto'))
  );
}

function isSuppliesProduct(product) {
  return productMatchesCatalogFamily(product, 'toner-suministros');
}

function isPartsProduct(product) {
  return productMatchesCatalogFamily(product, 'repuestos') || hasPartes(productHaystack(product));
}

export function inferProductConditionFromText(text) {
  const haystack = text.toLowerCase();

  if (haystack.includes('repuesto') || haystack.includes('partes')) return 'partes';
  if (hasPartes(haystack) && !haystack.includes('toner originales')) return 'partes';

  if (haystack.includes('toner originales') || haystack.includes('tóner originales')) {
    return 'originales';
  }
  if (hasRemanufactured(haystack)) return 'remanufacturados';
  if (hasCompatible(haystack)) return 'compatibles';
  if (hasOriginal(haystack)) return 'originales';

  if (haystack.includes('multifuncionales nuevas') || haystack.includes('impresoras laser nuevas')) {
    return 'originales';
  }
  if (haystack.includes('seminuevas')) return 'compatibles';
  if (haystack.includes('remanufacturadas')) return 'remanufacturados';

  if (haystack === 'toner' || (haystack.includes('toner') && !haystack.includes('originales'))) {
    return 'compatibles';
  }

  return null;
}

function productMatchesTonerSuministrosCondition(product, condition) {
  const haystack = productHaystack(product);

  if (condition === 'remanufacturados') return hasRemanufactured(haystack);
  if (condition === 'compatibles') return hasCompatible(haystack) && !hasRemanufactured(haystack);
  if (condition === 'partes') return false;
  if (condition === 'originales') return !hasRemanufactured(haystack) && !hasCompatible(haystack);
  return false;
}

function productMatchesRepuestosSpareCondition(product, condition) {
  const haystack = productHaystack(product);

  if (condition === 'remanufacturados') return hasRemanufactured(haystack);
  if (condition === 'compatibles') return hasCompatible(haystack) && !hasRemanufactured(haystack);
  if (condition === 'partes') {
    const categoryHint =
      product.category != null ? inferProductConditionFromText(product.category) : null;
    return categoryHint === 'partes';
  }
  if (condition === 'originales') return !hasRemanufactured(haystack) && !hasCompatible(haystack);
  return false;
}

function productMatchesSuppliesCondition(product, condition) {
  const haystack = productHaystack(product);

  if (hasPartes(haystack)) {
    if (condition === 'partes') return true;
    if (condition === 'remanufacturados') return hasRemanufactured(haystack);
    if (condition === 'compatibles') return hasCompatible(haystack) && !hasRemanufactured(haystack);
    if (condition === 'originales') return !hasRemanufactured(haystack) && !hasCompatible(haystack);
    return false;
  }

  if (condition === 'partes') return hasPartes(haystack);

  const categoryHint =
    product.category != null ? inferProductConditionFromText(product.category) : null;
  if (categoryHint !== null && categoryHint !== 'partes') {
    return condition === categoryHint;
  }

  if (condition === 'remanufacturados') return hasRemanufactured(haystack);
  if (condition === 'compatibles') {
    return hasCompatible(haystack) && !hasRemanufactured(haystack) && !hasPartes(haystack);
  }
  if (condition === 'originales') {
    if (hasRemanufactured(haystack) || hasCompatible(haystack) || hasPartes(haystack)) {
      return false;
    }
    return (
      hasOriginal(haystack) ||
      haystack.includes('toner') ||
      haystack.includes('cartucho') ||
      haystack.includes('print cartridge')
    );
  }
  return false;
}

function productMatchesEquipmentCondition(product, condition) {
  if (condition === 'partes') return isPartsProduct(product);

  const name = String(product.name ?? '');

  // El nombre manda sobre una categoría de inventario mal asignada.
  if (/\bseminueva\b/i.test(name)) {
    return condition === 'compatibles';
  }
  if (/\bremanufacturad/i.test(name)) {
    return condition === 'remanufacturados';
  }
  if (productQualifiesAsNuevaEquipment(product)) {
    return condition === 'originales';
  }
  if (productQualifiesAsRemanufacturadaEquipment(product)) {
    return condition === 'remanufacturados';
  }
  if (productQualifiesAsSeminuevaEquipment(product)) {
    return condition === 'compatibles';
  }

  const categoryHint =
    product.category != null ? inferProductConditionFromText(product.category) : null;
  if (categoryHint !== null) return condition === categoryHint;

  const haystack = productHaystack(product);

  if (condition === 'remanufacturados') return false;
  if (condition === 'compatibles') {
    return hasCompatible(haystack) && !hasRemanufactured(haystack);
  }
  if (condition === 'originales') {
    return hasOriginal(haystack);
  }
  return false;
}

export function productMatchesCondition(product, condition, catalogFamily) {
  if (
    catalogFamily === 'toner-suministros' &&
    productMatchesCatalogFamily(product, 'toner-suministros')
  ) {
    return productMatchesTonerSuministrosCondition(product, condition);
  }

  if (
    catalogFamily === 'repuestos' &&
    !isPrinterEquipmentProduct(product) &&
    (productMatchesCatalogFamily(product, 'repuestos') || hasPartes(productHaystack(product)))
  ) {
    return productMatchesRepuestosSpareCondition(product, condition);
  }

  if (catalogFamily !== 'toner-suministros' && isPartsProduct(product) && condition === 'partes') {
    return true;
  }

  if (condition === 'partes') return isPartsProduct(product);
  if (isSuppliesProduct(product)) return productMatchesSuppliesCondition(product, condition);
  return productMatchesEquipmentCondition(product, condition);
}

export function productMatchesCatalogFamily(product, family) {
  if (categoryIndicatesFamily(product.category, family)) return true;

  const haystack = productHaystack(product);

  switch (family) {
    case 'multifuncionales':
      return haystack.includes('multifuncional');
    case 'impresoras':
      return haystack.includes('impresor') && !haystack.includes('multifuncional');
    case 'toner-suministros':
      return (
        (haystack.includes('toner') ||
          haystack.includes('tóner') ||
          haystack.includes('suministro') ||
          haystack.includes('consumible') ||
          haystack.includes('cartucho')) &&
        !haystack.includes('repuesto')
      );
    case 'repuestos':
      if (isPrinterEquipmentProduct(product)) return false;
      return hasPartes(haystack);
    default:
      return false;
  }
}

export function compareProductsBySortOrder(a, b) {
  const ao = Number.isFinite(Number(a.sort_order)) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
  const bo = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
  if (ao !== bo) return ao - bo;
  return a.name.localeCompare(b.name, 'es');
}

export function filterStoreProductsForHomeSection(
  products,
  family,
  categoryLabels,
  condition,
  limit = 10,
) {
  return [...products]
    .filter((product) => {
      if (isHomeCarouselExcludedProduct(product)) return false;
      if (family === 'repuestos' && isPrinterEquipmentProduct(product)) {
        return false;
      }
      const inFamily =
        productMatchesCatalogFamily(product, family) ||
        categoryLabels.some((label) => productMatchesCategoryFilter(product, label));
      return inFamily && productMatchesCondition(product, condition, family);
    })
    .sort(compareProductsBySortOrder)
    .slice(0, limit);
}

export function toFeaturedProduct(product, imageUrl) {
  return {
    id: product.id,
    name: product.name,
    category: product.category ?? '',
    brand: product.brand ?? null,
    code: product.code ?? null,
    ...(product.attributes?.length ? { attributes: product.attributes } : {}),
    price: product.price,
    image: imageUrl ?? null,
    rating: 5,
    reviews: 0,
  };
}

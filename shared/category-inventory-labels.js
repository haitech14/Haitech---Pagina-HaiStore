import {
  productQualifiesAsNuevaEquipment,
  productQualifiesAsRemanufacturadaEquipment,
  productQualifiesAsSeminuevaEquipment,
} from './inventory-product-name.js';

/** Etiquetas estáticas de inventario por slug (paridad con src/data/categories.ts). */
export const CATEGORY_INVENTORY_LABELS = {
  multifuncionales: [
    'Multifuncionales',
    'Multifuncionales Nuevas',
    'Multifuncionales, Multifuncionales Nuevas',
    'Multifuncionales Seminuevas',
    'Multifuncionales, Multifuncionales Seminuevas',
    'Multifuncionales Remanufacturadas',
    'Multifuncionales, Multifuncionales Remanufacturadas',
  ],
  impresoras: [
    'Impresoras',
    'Impresoras Laser Nuevas',
    'Impresoras Láser Nuevas',
    'Impresoras, Impresoras Laser Nuevas',
    'Impresoras, Impresoras Láser Nuevas',
  ],
  'formato-ancho': ['Formato Ancho', 'Plotter y Multifuncional de Planos'],
  'toner-suministros': [
    'Toner y Suministros',
    'Toner',
    'Toner Original',
    'Toner, Toner Original',
    'Toner y Suministros, Toner Original',
    'Toner Compatible',
    'Toner, Toner Compatible',
    'Toner y Suministros, Toner Compatible',
    'Toner Compatibles',
    'Toner, Toner Compatibles',
    'Suministros',
    'Toner, Suministros',
    'Toner y suministros',
    'Tóner y Suministros',
    'Toner Compatibles HaiPrint',
    'Toner Compatibles Haitone',
  ],
  repuestos: ['Repuestos', 'Repuestos Originales', 'Repuestos, Repuestos Originales'],
  accesorios: ['Accesorios'],
  escaneres: ['Escáneres'],
  camaras: ['Cámaras'],
  'computadoras-laptop': ['Computadoras y Laptop', 'Computadoras Laptop', 'Laptops'],
  alquiler: ['Alquiler'],
};

export function resolveStaticCategoryLabels(slug) {
  return CATEGORY_INVENTORY_LABELS[slug] ?? [];
}

export function catalogFamilyForSlug(slug) {
  if (slug === 'multifuncionales' || slug === 'impresoras') return slug;
  if (slug === 'toner-suministros') return 'toner-suministros';
  if (slug === 'repuestos') return 'repuestos';
  return null;
}

/** Etiquetas de inventario por slug de subcategoría (paridad con store-categories.json). */
export const SUBCATEGORY_INVENTORY_LABELS = {
  'multifuncionales-nuevas': [
    'Multifuncionales Nuevas',
    'Multifuncionales, Multifuncionales Nuevas',
  ],
  'multifuncionales-seminuevas': [
    'Multifuncionales Seminuevas',
    'Multifuncionales, Multifuncionales Seminuevas',
  ],
  'multifuncionales-remanufacturadas': [
    'Multifuncionales Remanufacturadas',
    'Multifuncionales, Multifuncionales Remanufacturadas',
  ],
  'impresoras-laser-nuevas': [
    'Impresoras Laser Nuevas',
    'Impresoras Láser Nuevas',
    'Impresoras, Impresoras Laser Nuevas',
    'Impresoras, Impresoras Láser Nuevas',
  ],
  'impresoras-laser-seminuevas': [
    'Impresoras Laser Seminuevas',
    'Impresoras Láser Seminuevas',
  ],
  'impresoras-laser-remanufacturadas': [
    'Impresoras Laser Remanufacturadas',
    'Impresoras Láser Remanufacturadas',
  ],
};

export function resolveSubcategoryInventoryLabels(subSlug) {
  if (!subSlug) return [];
  return SUBCATEGORY_INVENTORY_LABELS[subSlug] ?? [];
}

const NUEVAS_EQUIPMENT_SUBSLUGS = new Set([
  'multifuncionales-nuevas',
  'impresoras-laser-nuevas',
]);

const SEMINUEVAS_EQUIPMENT_SUBSLUGS = new Set([
  'multifuncionales-seminuevas',
  'impresoras-laser-seminuevas',
]);

const REMANUFACTURADAS_EQUIPMENT_SUBSLUGS = new Set([
  'multifuncionales-remanufacturadas',
  'impresoras-laser-remanufacturadas',
]);

/** Filtra por condición real del equipo (nombre «NUEVA» / «seminueva» / «remanufacturad») en subcategorías. */
export function applyEquipmentSubcategorySlugFilter(products, subSlug) {
  if (!subSlug || !Array.isArray(products)) return products;
  if (NUEVAS_EQUIPMENT_SUBSLUGS.has(subSlug)) {
    return products.filter(productQualifiesAsNuevaEquipment);
  }
  if (SEMINUEVAS_EQUIPMENT_SUBSLUGS.has(subSlug)) {
    return products.filter(productQualifiesAsSeminuevaEquipment);
  }
  if (REMANUFACTURADAS_EQUIPMENT_SUBSLUGS.has(subSlug)) {
    return products.filter(productQualifiesAsRemanufacturadaEquipment);
  }
  return products;
}

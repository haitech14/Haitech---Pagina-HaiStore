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
    'Toner Originales',
    'Toner, Toner Original',
    'Toner y Suministros, Toner Original',
    'Toner Remanufacturado',
    'Toner Remanufacturados',
    'Toner, Toner Remanufacturado',
    'Suministros, Toner Remanufacturado',
    'Toner y Suministros, Toner Remanufacturado',
    'Recarga',
    'Recargas',
    'Toner Recargas',
    'Suministros, Recarga',
    'Suministros, Toner Recarga',
    'Toner y Suministros, Recarga',
    'Toner Compatible',
    'Toner, Toner Compatible',
    'Toner y Suministros, Toner Compatible',
    'Suministros, Toner Compatible',
    'Toner Compatibles',
    'Toner, Toner Compatibles',
    'Suministros',
    'Toner, Suministros',
    'Toner y suministros',
    'Tóner y Suministros',
    'Toner Compatibles HaiPrint',
    'Toner Compatibles Haitone',
  ],
  repuestos: [
    'Repuestos',
    'Repuestos Originales',
    'Repuestos, Repuestos Originales',
    'Repuestos Compatibles',
    'Repuesto Compatible',
    'Repuestos, Repuestos Compatibles',
    'Unidades Compatibles',
    'Unidad Compatible',
    'Repuestos Compatibles, Unidades Compatibles',
    'Repuestos, Repuestos Compatibles, Unidades Compatibles',
  ],
  accesorios: ['Accesorios'],
  escaneres: ['Escáneres', 'Escáneres Nuevos', 'Escáneres, Escáneres Nuevos'],
  camaras: ['Cámaras'],
  'computadoras-laptop': ['Computadoras y Laptop', 'Computadoras Laptop', 'Laptops'],
  alquiler: ['Alquiler'],
  'soluciones-colaboracion': ['Pizarras Interactivas'],
  'equipamiento-videoconferencias': ['Equipamiento para Videoconferencias'],
  tecnologia: ['Tecnología y cómputo'],
  monitores: ['Monitores'],
  'equipos-de-oficina': [
    'Equipos de Oficina',
    'Equipos de Oficina, Espiraladoras',
    'Espiraladoras',
    'Espiraladora',
    'Equipos de Oficina, Anilladoras',
    'Anilladoras',
    'Anilladora',
    'Equipos de Oficina, Enmicadora',
    'Enmicadoras',
    'Enmicadora',
    'Equipos de Oficina, Guillotina',
    'Guillotinas',
    'Guillotina',
  ],
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
  'impresoras-termicas': [
    'Impresoras Térmicas',
    'Impresoras Termicas',
    'Impresoras, Impresoras Térmicas',
    'Impresoras, Impresoras Termicas',
  ],
  'escaneres-nuevos': [
    'Escáneres Nuevos',
    'Escáneres, Escáneres Nuevos',
  ],
  toner: ['Toner Original', 'Toner, Toner Original', 'Toner, Toner Originales'],
  'toner-originales': [
    'Suministros, Toner Originales',
    'Suministros, Toner Original',
    'Toner Original',
    'Toner Originales',
    'Toner, Toner Original',
    'Toner, Toner Originales',
    'Toner y Suministros, Toner Original',
    'Tóner y Suministros, Toner Original',
  ],
  'toner-remanufacturado': [
    'Toner Remanufacturado',
    'Toner Remanufacturados',
    'Toner, Toner Remanufacturado',
    'Toner, Toner Remanufacturados',
    'Suministros, Toner Remanufacturado',
    'Toner y Suministros, Toner Remanufacturado',
  ],
  'toner-recarga': [
    'Toner Recargas',
    'Recargas',
    'Recarga',
    'Toner, Recargas',
    'Toner, Recarga',
    'Suministros, Recarga',
    'Suministros, Toner Recarga',
    'Toner y Suministros, Recarga',
    'Toner y Suministros, Toner Recarga',
  ],
  suministros: ['Suministros', 'Toner, Suministros'],
  'toner-compatibles': [
    'Toner Compatible',
    'Toner, Toner Compatible',
    'Toner Compatibles',
    'Toner, Toner Compatibles',
    'Toner Compatibles HaiPrint',
    'Toner Compatibles Haitone',
  ],
  'repuestos-compatibles': [
    'Repuestos Compatibles',
    'Repuesto Compatible',
    'Repuestos, Repuestos Compatibles',
  ],
  'unidades-compatibles': [
    'Unidades Compatibles',
    'Unidad Compatible',
    'Repuestos Compatibles, Unidades Compatibles',
    'Repuestos, Repuestos Compatibles, Unidades Compatibles',
  ],
  'rodillos-de-calor': [
    'Rodillo de Calor',
    'Rodillos de Calor',
    'Repuestos Compatibles, Rodillo de Calor',
    'Repuestos, Repuestos Compatibles, Rodillo de Calor',
  ],
  'rodillos-de-presion': [
    'Rodillo de Presión',
    'Rodillos de Presión',
    'Repuestos Compatibles, Rodillo de Presión',
    'Repuestos, Repuestos Compatibles, Rodillo de Presión',
  ],
  'faja-fusora': [
    'Faja Fusora',
    'Fajas Fusoras',
    'Repuestos Compatibles, Faja Fusora',
    'Repuestos, Repuestos Compatibles, Faja Fusora',
  ],
  'cuchillas-de-cilindro': [
    'Cuchillas de Cilindro',
    'Cuchilla de Cilindro',
    'Repuestos Compatibles, Cuchillas de Cilindro',
    'Repuestos, Repuestos Compatibles, Cuchillas de Cilindro',
  ],
  'cuchillas-de-transferencia': [
    'Cuchillas de Transferencia',
    'Cuchilla de Transferencia',
    'Repuestos Compatibles, Cuchillas de Transferencia',
    'Repuestos, Repuestos Compatibles, Cuchillas de Transferencia',
  ],
  'barra-lubricadora': [
    'Barra Lubricadora',
    'Barras Lubricadoras',
    'Repuestos Compatibles, Barra Lubricadora',
    'Repuestos, Repuestos Compatibles, Barra Lubricadora',
  ],
  'rodillo-de-esponja': [
    'Rodillo de Esponja',
    'Rodillos de Esponja',
    'Repuestos Compatibles, Rodillo de Esponja',
    'Repuestos, Repuestos Compatibles, Rodillo de Esponja',
  ],
  'faja-de-transferencia': [
    'Faja de Transferencia',
    'Fajas de Transferencia',
    'Repuestos Compatibles, Faja de Transferencia',
    'Repuestos, Repuestos Compatibles, Faja de Transferencia',
  ],
  almohadilla: [
    'Almohadilla',
    'Almohadillas',
    'Repuestos Compatibles, Almohadilla',
    'Repuestos, Repuestos Compatibles, Almohadilla',
  ],
  'ruedas-casetera': [
    'Ruedas de Casetera',
    'Rueda de Casetera',
    'Repuestos Compatibles, Ruedas de Casetera',
    'Repuestos, Repuestos Compatibles, Ruedas de Casetera',
  ],
  'engranaje-pinon': [
    'Engranaje/Piñon',
    'Engranaje',
    'Piñon',
    'Repuestos Compatibles, Engranaje/Piñon',
    'Repuestos, Repuestos Compatibles, Engranaje/Piñon',
  ],
  bocinas: [
    'Bocinas',
    'Bocina',
    'Repuestos Compatibles, Bocinas',
    'Repuestos, Repuestos Compatibles, Bocinas',
  ],
  espiraladoras: [
    'Espiraladoras',
    'Espiraladora',
    'Equipos de Oficina, Espiraladoras',
  ],
  anilladoras: [
    'Anilladoras',
    'Anilladora',
    'Equipos de Oficina, Anilladoras',
  ],
  enmicadoras: [
    'Enmicadoras',
    'Enmicadora',
    'Equipos de Oficina, Enmicadora',
  ],
  guillotinas: [
    'Guillotinas',
    'Guillotina',
    'Equipos de Oficina, Guillotina',
  ],
  'equipos-de-oficina': ['Equipos de Oficina'],
  'manta-web': [
    'Manta Web',
    'Mantas Web',
    'Repuestos Compatibles, Manta Web',
    'Repuestos, Repuestos Compatibles, Manta Web',
  ],
  revelador: [
    'Revelador',
    'Reveladores',
    'Repuestos Compatibles, Revelador',
    'Repuestos, Repuestos Compatibles, Revelador',
  ],
};

export function resolveSubcategoryInventoryLabels(subSlug) {
  if (!subSlug) return [];
  return SUBCATEGORY_INVENTORY_LABELS[subSlug] ?? [];
}

const NUEVAS_EQUIPMENT_SUBSLUGS = new Set([
  'multifuncionales-nuevas',
  'impresoras-laser-nuevas',
  'escaneres-nuevos',
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

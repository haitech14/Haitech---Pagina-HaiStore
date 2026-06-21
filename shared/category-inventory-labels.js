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
    'Toner',
    'Toner Original',
    'Toner, Toner Original',
    'Toner Compatible',
    'Toner, Toner Compatible',
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

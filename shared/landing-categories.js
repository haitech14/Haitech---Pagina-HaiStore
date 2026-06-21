/** Nombres de categoría alineados con la landing (carrusel «Explora nuestras categorías»). */

export const LANDING_CATEGORY = {
  multifuncionales: 'Multifuncionales',
  multifuncionalesNuevas: 'Multifuncionales Nuevas',
  multifuncionalesSeminuevas: 'Multifuncionales Seminuevas',
  multifuncionalesRemanufacturadas: 'Multifuncionales Remanufacturadas',
  impresoras: 'Impresoras',
  impresorasLaserNuevas: 'Impresoras Láser Nuevas',
  formatoAncho: 'Formato Ancho',
  toner: 'Toner',
  tonerOriginal: 'Toner Original',
  tonerCompatible: 'Toner Compatible',
  suministros: 'Suministros',
  repuestos: 'Repuestos',
  repuestosOriginales: 'Repuestos Originales',
  accesorios: 'Accesorios',
  escaneres: 'Escáneres',
  camaras: 'Cámaras',
  solucionesColaboracion: 'Soluciones de Colaboración',
  solucionesNegocio: 'Soluciones de Negocio',
  computadorasLaptop: 'Computadoras y Laptop',
  monitores: 'Monitores',
  alquiler: 'Alquiler',
};

/** `Padre, Hijo` para inventario. */
export function landingInventoryCategory(parent, child = null) {
  if (!child) return parent;
  return `${parent}, ${child}`;
}

const EXACT_CATEGORY_MAP = new Map([
  ['Multifuncionales Nuevas', landingInventoryCategory(LANDING_CATEGORY.multifuncionales, LANDING_CATEGORY.multifuncionalesNuevas)],
  ['Multifuncionales Seminuevas', landingInventoryCategory(LANDING_CATEGORY.multifuncionales, LANDING_CATEGORY.multifuncionalesSeminuevas)],
  ['Multifuncionales Remanufacturadas', landingInventoryCategory(LANDING_CATEGORY.multifuncionales, LANDING_CATEGORY.multifuncionalesRemanufacturadas)],
  ['Multifuncionales Seminuevas, Multifuncionales', landingInventoryCategory(LANDING_CATEGORY.multifuncionales, LANDING_CATEGORY.multifuncionalesSeminuevas)],
  ['Multifuncionales, Multifuncionales Seminuevas', landingInventoryCategory(LANDING_CATEGORY.multifuncionales, LANDING_CATEGORY.multifuncionalesSeminuevas)],
  ['Toner Original', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerOriginal)],
  ['Toner Compatibles HaiPrint', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerCompatible)],
  ['Toner Compatibles Haitone', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerCompatible)],
  ['Toner Compatibles', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerCompatible)],
  ['Toner, Toner Compatibles', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerCompatible)],
  ['Toner, Toner Originales', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.tonerOriginal)],
  ['Suministros', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.suministros)],
  ['Repuestos Originales', landingInventoryCategory(LANDING_CATEGORY.repuestos, LANDING_CATEGORY.repuestosOriginales)],
  ['Repuestos, Repuestos Originales', landingInventoryCategory(LANDING_CATEGORY.repuestos, LANDING_CATEGORY.repuestosOriginales)],
  ['Computadoras Laptop', LANDING_CATEGORY.computadorasLaptop],
  ['Impresoras Laser Nuevas', landingInventoryCategory(LANDING_CATEGORY.impresoras, LANDING_CATEGORY.impresorasLaserNuevas)],
  ['Impresoras Láser Nuevas', landingInventoryCategory(LANDING_CATEGORY.impresoras, LANDING_CATEGORY.impresorasLaserNuevas)],
  ['Impresoras, Impresoras Laser Nuevas', landingInventoryCategory(LANDING_CATEGORY.impresoras, LANDING_CATEGORY.impresorasLaserNuevas)],
  ['Plotter y Multifuncional de Planos', LANDING_CATEGORY.formatoAncho],
  ['Tóner y Suministros', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.suministros)],
  ['Toner y suministros', landingInventoryCategory(LANDING_CATEGORY.toner, LANDING_CATEGORY.suministros)],
]);

/**
 * Normaliza una etiqueta de categoría de inventario al esquema de la landing.
 * @param {unknown} value
 */
export function normalizeInventoryCategoryToLanding(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return raw;

  const exact = EXACT_CATEGORY_MAP.get(raw);
  if (exact) return exact;

  return raw;
}

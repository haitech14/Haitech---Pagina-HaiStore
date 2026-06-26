/** Párrafos SEO visibles para landings de categoría (150–250 palabras aprox.). */

const ROOT_INTRO: Record<string, string> = {
  multifuncionales:
    'Compra fotocopiadoras y multifuncionales Ricoh nuevas, seminuevas y remanufacturadas con asesoría de Distribuidor Autorizado. Equipos para oficina con impresión, copia, escaneo y fax, instalación y envío a todo el Perú.',
  impresoras:
    'Impresoras láser Ricoh para empresas y oficinas. Venta de equipos nuevos y seminuevos con garantía, asesoría técnica y entrega nacional desde HaiTech, Distribuidor Autorizado Ricoh en Perú.',
  'toner-suministros':
    'Tóner original y compatible, tintas, cartuchos y suministros Ricoh con stock permanente. Compra online con asesoría para elegir el consumible correcto y envío a Lima y provincias.',
  repuestos:
    'Repuestos originales y compatibles Ricoh: unidades de imagen, cilindros, fusores, rodillos y componentes para mantener tu flota operativa. Distribuidor Autorizado con envío nacional.',
  alquiler:
    'Alquiler de fotocopiadoras e impresoras multifuncionales Ricoh para empresas. Planes mensuales con mantenimiento, tóner y soporte técnico incluido en Lima y todo el Perú.',
  'formato-ancho':
    'Plotters y equipos de formato ancho Ricoh para producción gráfica, planos y gran formato. Cotiza con asesoría especializada de Distribuidor Autorizado Ricoh.',
};

const SUB_INTRO: Record<string, string> = {
  'unidades-compatibles':
    'Unidades de imagen compatibles Ricoh e Intercopy para impresoras y fotocopiadoras. Repuestos con stock, precio competitivo y envío a todo el Perú desde HaiTech.',
  'repuestos-compatibles':
    'Repuestos compatibles Ricoh: cilindros, fusores, rodillos, fajas y más componentes para reducir costos sin sacrificar rendimiento. Asesoría técnica incluida.',
  'repuestos-originales':
    'Repuestos originales Ricoh con garantía de fabricante. Unidades de imagen, fusores y componentes certificados para impresoras y multifuncionales.',
  'toner-originales':
    'Tóner original Ricoh para máxima calidad de impresión y vida útil del equipo. Cartuchos certificados con envío a todo el Perú.',
  'toner-compatibles':
    'Tóner compatible Ricoh e iAicon con excelente relación costo-rendimiento. Alternativas probadas para oficinas con alto volumen de impresión.',
  'tintas-originales':
    'Tintas originales Ricoh para impresoras inkjet y equipos de color. Consumibles certificados con asesoría de Distribuidor Autorizado.',
  'multifuncionales-nuevas':
    'Multifuncionales Ricoh nuevas de fábrica con garantía oficial. Fotocopiadoras para oficina con impresión, copia, escaneo y conectividad avanzada.',
  'multifuncionales-seminuevas':
    'Multifuncionales Ricoh seminuevas revisadas y certificadas. Equipos de alta productividad a menor costo con garantía HaiTech.',
};

export function getCategorySeoIntro(slug: string, subSlug?: string | null): string | null {
  if (subSlug?.trim()) {
    return SUB_INTRO[subSlug.trim()] ?? null;
  }
  return ROOT_INTRO[slug] ?? null;
}

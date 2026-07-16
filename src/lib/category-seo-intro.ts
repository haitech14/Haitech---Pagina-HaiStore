/** Párrafos SEO visibles para landings de categoría (150–300 palabras aprox.). */

const ROOT_INTRO: Record<string, string> = {
  multifuncionales:
    'Compra fotocopiadoras y multifuncionales Ricoh nuevas, seminuevas y remanufacturadas con asesoría de Distribuidor Autorizado. En HaiStore encontrarás equipos A4 y A3 para oficina y producción: impresión, copia, escaneo y fax en un solo equipo, con instalación, garantía y envío a todo el Perú. Cotiza modelos de alto volumen o estaciones compactas según páginas mensuales, color o blanco y negro, y conectividad de red. También te orientamos en alquiler de multifuncionales cuando prefieres costo mensual predecible con mantenimiento. Explora el catálogo, compara fichas técnicas y solicita stock y precio por WhatsApp o desde la tienda online.',
  impresoras:
    'Impresoras láser Ricoh para empresas y oficinas en Perú. Venta de equipos nuevos y seminuevos con garantía, asesoría técnica y entrega nacional desde HaiTech, Distribuidor Autorizado Ricoh. Elige impresión monocromo o color, formatos A4/A3 y velocidades según tu flujo de trabajo. Complementa con tóner original o compatible y repuestos para mantener la flota operativa. Cotiza online o por WhatsApp con el modelo que necesitas.',
  'toner-suministros':
    'Tóner original y compatible, tintas, cartuchos y suministros Ricoh con stock permanente. Compra online en HaiStore con asesoría para elegir el consumible correcto según modelo de fotocopiadora o impresora, y envío a Lima y provincias. Reduces paradas de impresión con pedidos rápidos y precios claros en USD. Si gestionas varias sedes, cotizamos volumen corporativo y programas de reposición.',
  repuestos:
    'Repuestos originales y compatibles Ricoh: unidades de imagen, cilindros, fusores, rodillos, fajas y componentes para mantener tu flota operativa. Distribuidor Autorizado con envío nacional y soporte técnico para identificar la pieza correcta. Ideal para talleres, empresas con parque Ricoh y mantenimiento preventivo. Consulta disponibilidad y compatibilidad desde el catálogo o por WhatsApp.',
  alquiler:
    'Alquiler de fotocopiadoras e impresoras multifuncionales Ricoh para empresas. Planes mensuales con mantenimiento, tóner y soporte técnico incluido en Lima y todo el Perú. Ideal si prefieres no inmovilizar capital en compra y necesitas costo por página predecible. Cotiza según volumen de impresión, color y formato; te proponemos el equipo adecuado y condiciones de contrato claras.',
  'formato-ancho':
    'Plotters y equipos de formato ancho Ricoh para producción gráfica, planos y gran formato. Cotiza con asesoría especializada de Distribuidor Autorizado Ricoh en Perú: venta, consumibles y soporte. Envío y puesta en marcha según modelo y ciudad. Habla con un asesor para dimensionar volumen y tipo de soporte (papel, vinilo, etc.).',
};

const SUB_INTRO: Record<string, string> = {
  'unidades-compatibles':
    'Unidades de imagen compatibles Ricoh e Intercopy para impresoras y fotocopiadoras. Repuestos con stock, precio competitivo y envío a todo el Perú desde HaiTech. Verifica compatibilidad por modelo antes de comprar; nuestro equipo te ayuda a elegir la unidad correcta.',
  'repuestos-compatibles':
    'Repuestos compatibles Ricoh: cilindros, fusores, rodillos, fajas y más componentes para reducir costos sin sacrificar rendimiento. Asesoría técnica incluida y envío nacional.',
  'repuestos-originales':
    'Repuestos originales Ricoh con garantía de fabricante. Unidades de imagen, fusores y componentes certificados para impresoras y multifuncionales. Stock y cotización rápida para empresas y servicio técnico.',
  'toner-originales':
    'Tóner original Ricoh para máxima calidad de impresión y vida útil del equipo. Cartuchos certificados con envío a todo el Perú y asesoría de Distribuidor Autorizado.',
  'toner-compatibles':
    'Tóner compatible Ricoh e iAicon con excelente relación costo-rendimiento. Alternativas probadas para oficinas con alto volumen de impresión y envío a Lima y provincias.',
  'tintas-originales':
    'Tintas originales Ricoh para impresoras inkjet y equipos de color. Consumibles certificados con asesoría de Distribuidor Autorizado y entrega nacional.',
  'multifuncionales-nuevas':
    'Multifuncionales Ricoh nuevas de fábrica con garantía oficial. Fotocopiadoras para oficina con impresión, copia, escaneo y conectividad avanzada. Cotiza instalación y envío en Perú.',
  'multifuncionales-seminuevas':
    'Multifuncionales Ricoh seminuevas revisadas y certificadas. Equipos de alta productividad a menor costo con garantía HaiTech, prueba de impresión y soporte postventa.',
};

export function getCategorySeoIntro(slug: string, subSlug?: string | null): string | null {
  if (subSlug?.trim()) {
    return SUB_INTRO[subSlug.trim()] ?? null;
  }
  return ROOT_INTRO[slug] ?? null;
}

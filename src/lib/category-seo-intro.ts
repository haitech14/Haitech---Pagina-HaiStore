/** Párrafos SEO visibles para landings de categoría (150–300 palabras aprox. en roots clave). */

const ROOT_INTRO: Record<string, string> = {
  multifuncionales:
    'Compra fotocopiadoras y multifuncionales Ricoh nuevas, seminuevas y remanufacturadas con asesoría de Distribuidor Autorizado en Perú. En HaiStore encontrarás equipos A4 y A3 para oficina y producción ligera: impresión, copia, escaneo y fax en un solo multifuncional, con instalación, garantía y envío a Lima y provincias. Cotiza modelos de alto volumen o estaciones compactas según páginas mensuales, color o blanco y negro, bandejas de papel y conectividad de red. Si prefieres no inmovilizar capital, también te orientamos en alquiler de fotocopiadoras Ricoh con mantenimiento y tóner según plan. Compara fichas técnicas, stock y precios en USD desde el catálogo, o solicita una cotización por WhatsApp con el modelo y tu ciudad. Nuestro equipo comercial te ayuda a dimensionar el equipo correcto para tu empresa, incluyendo opciones de tóner original o compatible y repuestos para mantener la flota operativa a largo plazo.',
  impresoras:
    'Impresoras láser Ricoh para empresas y oficinas en Perú. Venta de equipos nuevos y seminuevos con garantía, asesoría técnica y entrega nacional desde HaiTech, Distribuidor Autorizado Ricoh. Elige impresión monocromo o color, formatos A4/A3 y velocidades según tu flujo de trabajo diario. Complementa con tóner original o compatible y repuestos (unidades de imagen, fusores) para reducir paradas. Cotiza online o por WhatsApp con el modelo que necesitas; también evaluamos alquiler cuando el costo mensual resulta más conveniente que la compra. Envío, puesta en marcha y soporte postventa disponibles según ciudad y tipo de equipo.',
  'toner-suministros':
    'Tóner original y compatible Ricoh, tintas, cartuchos y suministros con stock permanente en HaiStore. Compra online con asesoría para elegir el consumible correcto según modelo de fotocopiadora, multifuncional o impresora, y envío a Lima y provincias. Reduces paradas de impresión con pedidos rápidos y precios claros en USD. Si gestionas varias sedes o un parque Ricoh amplio, cotizamos volumen corporativo, programas de reposición y alternativas compatibles con buena relación costo-rendimiento. Somos Distribuidor Autorizado: te ayudamos a no mezclar referencias incorrectas y a planificar el consumo de tóner según páginas mensuales. Explora tóner originales, compatibles y tintas desde esta categoría o consulta por WhatsApp con el código del cartucho.',
  repuestos:
    'Repuestos originales y compatibles Ricoh: unidades de imagen, cilindros, fusores, rodillos, fajas y componentes para mantener tu flota de fotocopiadoras e impresoras operativa. Distribuidor Autorizado con envío nacional y soporte técnico para identificar la pieza correcta por modelo. Ideal para talleres de servicio, empresas con parque Ricoh y mantenimiento preventivo programado. Consulta disponibilidad y compatibilidad desde el catálogo o por WhatsApp; si además necesitas tóner o un equipo de reemplazo, te cotizamos venta o alquiler en la misma conversación. Evita paradas prolongadas con stock y asesoría especializada en Lima y cobertura a provincia.',
  alquiler:
    'Alquiler de fotocopiadoras e impresoras multifuncionales Ricoh para empresas en Perú. Planes mensuales con mantenimiento, tóner y soporte técnico incluido según contrato, pensados para Lima y provincias. Ideal si prefieres no inmovilizar capital en compra y necesitas un costo por página predecible. Cotiza según volumen de impresión, color, formato A4/A3 y plazo; te proponemos el equipo adecuado (oficina pequeña, mediana o alto volumen) con condiciones claras. Combina alquiler con suministro de tóner y repuestos, o evalúa compra si tu volumen justifica la inversión. Solicita una cotización desde servicios de alquiler o WhatsApp con páginas mensuales estimadas y ciudad de instalación.',
  'formato-ancho':
    'Plotters y equipos de formato ancho Ricoh para producción gráfica, planos de arquitectura e ingeniería y gran formato. Cotiza con asesoría especializada de Distribuidor Autorizado Ricoh en Perú: venta, consumibles y soporte. Envío y puesta en marcha según modelo y ciudad. Habla con un asesor para dimensionar volumen de trabajo, tipo de soporte (papel, vinilo, etc.) y si conviene compra o alquiler. Accede al catálogo o solicita cotización por WhatsApp.',
};

const SUB_INTRO: Record<string, string> = {
  'unidades-compatibles':
    'Unidades de imagen compatibles Ricoh e Intercopy para impresoras y fotocopiadoras. Repuestos con stock, precio competitivo y envío a todo el Perú desde HaiTech. Verifica compatibilidad por modelo antes de comprar; nuestro equipo te ayuda a elegir la unidad correcta y a complementar con tóner o fusores si hace falta.',
  'repuestos-compatibles':
    'Repuestos compatibles Ricoh: cilindros, fusores, rodillos, fajas y más componentes para reducir costos sin sacrificar rendimiento. Asesoría técnica incluida y envío nacional para talleres y empresas.',
  'repuestos-originales':
    'Repuestos originales Ricoh con garantía de fabricante. Unidades de imagen, fusores y componentes certificados para impresoras y multifuncionales. Stock y cotización rápida para empresas y servicio técnico en Perú.',
  'toner-originales':
    'Tóner original Ricoh para máxima calidad de impresión y vida útil del equipo. Cartuchos certificados con envío a todo el Perú y asesoría de Distribuidor Autorizado. Ideal para oficinas que priorizan calidad y garantía.',
  'toner-compatibles':
    'Tóner compatible Ricoh e iAicon con excelente relación costo-rendimiento. Alternativas probadas para oficinas con alto volumen de impresión y envío a Lima y provincias. Cotiza por modelo o código de cartucho.',
  'tintas-originales':
    'Tintas originales Ricoh para impresoras inkjet y equipos de color. Consumibles certificados con asesoría de Distribuidor Autorizado y entrega nacional.',
  'multifuncionales-nuevas':
    'Multifuncionales Ricoh nuevas de fábrica con garantía oficial. Fotocopiadoras para oficina con impresión, copia, escaneo y conectividad avanzada. Cotiza instalación, envío en Perú y opciones de tóner para el arranque.',
  'multifuncionales-seminuevas':
    'Multifuncionales Ricoh seminuevas revisadas y certificadas. Equipos de alta productividad a menor costo con garantía HaiTech, prueba de impresión y soporte postventa. Alternativa sólida frente a compra de equipo nuevo o alquiler.',
};

export function getCategorySeoIntro(slug: string, subSlug?: string | null): string | null {
  if (subSlug?.trim()) {
    return SUB_INTRO[subSlug.trim()] ?? null;
  }
  return ROOT_INTRO[slug] ?? null;
}

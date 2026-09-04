/** Páginas estáticas indexables (FAQ, confianza, etc.). */
export const STATIC_SEO_ROUTES = [
  {
    pathname: '/preguntas-frecuentes',
    title: 'Preguntas frecuentes RICOH | Fotocopiadora, Tóner y Repuestos | HaiStore',
    description:
      'Respuestas sobre venta y alquiler de fotocopiadoras Ricoh, impresoras, tóner, repuestos, garantía, delivery e instalación. Distribuidor Autorizado en Perú.',
    pageName: 'Preguntas frecuentes',
    jsonLdKind: 'faq',
  },
  {
    pathname: '/por-que-comprar-con-nosotros',
    title: 'Por qué comprar con HaiStore | Distribuidor Autorizado Ricoh | Perú',
    description:
      'Garantía, envío nacional, tóner, repuestos y soporte técnico. Somos Distribuidor Autorizado Ricoh en Perú para fotocopiadoras e impresoras.',
    pageName: 'Por qué comprar con nosotros',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/distribuidor-autorizado-ricoh',
    title: 'Distribuidor Autorizado Ricoh Perú | Fotocopiadora, Impresora y Tóner | HaiStore',
    description:
      'HaiStore es Distribuidor Autorizado Ricoh en Perú. Compra o alquila fotocopiadoras, impresoras, tóner original y repuestos con garantía, instalación en Lima y envío nacional.',
    pageName: 'Distribuidor Autorizado Ricoh',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/fotocopiadoras-peru',
    title: 'Fotocopiadoras Perú | Venta y Alquiler Ricoh | HaiStore',
    description:
      'Compra o alquila fotocopiadoras en Perú con Distribuidor Autorizado Ricoh. Multifuncionales nuevas y seminuevas, tóner, instalación en Lima y envío nacional.',
    pageName: 'Fotocopiadoras Perú',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/fotocopiadoras-ricoh',
    title: 'Fotocopiadoras Ricoh | Multifuncionales | Distribuidor Autorizado HaiStore',
    description:
      'Fotocopiadoras y multifuncionales Ricoh en Perú: venta, alquiler, tóner y repuestos. HaiStore es Distribuidor Autorizado con stock, garantía y soporte técnico.',
    pageName: 'Fotocopiadoras Ricoh',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/alquiler-fotocopiadoras-lima',
    title: 'Alquiler de Fotocopiadoras Lima | Ricoh | HaiStore',
    description:
      'Alquila fotocopiadoras e impresoras Ricoh en Lima con mantenimiento y tóner según plan. Cotiza con Distribuidor Autorizado HaiStore para empresas.',
    pageName: 'Alquiler de fotocopiadoras Lima',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/toner-ricoh',
    title: 'Tóner Ricoh Original y Compatible | HaiStore Perú',
    description:
      'Compra tóner Ricoh original y compatible en Perú. Cartuchos para fotocopiadoras e impresoras con asesoría de Distribuidor Autorizado y envío nacional.',
    pageName: 'Tóner Ricoh',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/guias',
    title: 'Guías Ricoh | Fotocopiadoras, Tóner y Alquiler | HaiStore',
    description:
      'Guías prácticas HaiStore: cómo elegir multifuncional Ricoh, tóner original vs compatible, alquiler vs compra y mantenimiento.',
    pageName: 'Guías HaiStore',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/guias/como-elegir-multifuncional-ricoh',
    title: 'Cómo elegir multifuncional Ricoh | Guía HaiStore Perú',
    description:
      'Guía para elegir multifuncional Ricoh: A4 vs A3, ppm, color, SPDF y alquiler vs compra. Consejos de Distribuidor Autorizado en Perú.',
    pageName: 'Cómo elegir multifuncional Ricoh',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/guias/toner-original-vs-compatible',
    title: 'Tóner Ricoh original vs compatible | Guía HaiStore',
    description:
      'Diferencias entre tóner Ricoh original y compatible: calidad, costo por página y cuándo conviene cada uno. Asesoría de Distribuidor Autorizado.',
    pageName: 'Tóner original vs compatible',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/guias/alquiler-vs-compra-fotocopiadora',
    title: 'Alquiler vs compra de fotocopiadora | Guía HaiStore',
    description:
      'Compara alquilar o comprar fotocopiadora Ricoh en Perú: inversión, mantenimiento, tóner y flexibilidad. Orientación HaiStore Lima.',
    pageName: 'Alquiler vs compra',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/guias/mantenimiento-fotocopiadoras',
    title: 'Mantenimiento de fotocopiadoras Ricoh | Señales y soporte | HaiStore',
    description:
      'Señales de que tu fotocopiadora Ricoh necesita mantenimiento: calidad, ruidos, atascos y contadores. Soporte técnico HaiStore en Perú.',
    pageName: 'Mantenimiento de fotocopiadoras',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos',
    title: 'Modelos Ricoh | Multifuncionales destacados | HaiStore Perú',
    description:
      'Hubs por modelo Ricoh: IM 550F, IM 430F, IM C300F, IM C320F y más. Compra con Distribuidor Autorizado HaiStore.',
    pageName: 'Modelos Ricoh',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-550f',
    title: 'Ricoh IM 550F | Fotocopiadora Multifuncional | HaiStore Perú',
    description:
      'Ricoh IM 550F: multifuncional B/N A4 de alto volumen. Compra nuevo o seminuevo con Distribuidor Autorizado HaiStore. Tóner, instalación y soporte en Perú.',
    pageName: 'Ricoh IM 550F',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-430f',
    title: 'Ricoh IM 430F | Multifuncional A4 | HaiStore Perú',
    description:
      'Ricoh IM 430F: multifuncional B/N compacta para oficina. Venta nueva y seminueva con Distribuidor Autorizado HaiStore en Perú.',
    pageName: 'Ricoh IM 430F',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-c300f',
    title: 'Ricoh IM C300F | Multifuncional Color A4 | HaiStore',
    description:
      'Ricoh IM C300F color A4 con SPDF. Compra nueva o seminueva en HaiStore, Distribuidor Autorizado Ricoh en Perú.',
    pageName: 'Ricoh IM C300F',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-c320f',
    title: 'Ricoh IM C320F | Multifuncional Color | HaiStore Perú',
    description:
      'Ricoh IM C320F multifuncional a color. Venta con Distribuidor Autorizado HaiStore: stock, tóner e instalación en Perú.',
    pageName: 'Ricoh IM C320F',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-460f',
    title: 'Ricoh IM 460F | Multifuncional B/N | HaiStore Perú',
    description:
      'Ricoh IM 460F multifuncional monocromo. Compra con Distribuidor Autorizado HaiStore en Perú.',
    pageName: 'Ricoh IM 460F',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/mp-3055',
    title: 'Ricoh MP 3055 | Multifuncional Seminueva | HaiStore',
    description:
      'Ricoh MP 3055 seminueva B/N. Alternativa de productividad con garantía HaiStore, Distribuidor Autorizado Ricoh.',
    pageName: 'Ricoh MP 3055',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-c2000',
    title: 'Ricoh IM C2000 | Multifuncional Color A3 | HaiStore',
    description:
      'Ricoh IM C2000 color A3 seminueva. Cotiza con HaiStore, Distribuidor Autorizado Ricoh en Perú.',
    pageName: 'Ricoh IM C2000',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/modelos/im-600f',
    title: 'Ricoh IM 600F | Multifuncional B/N | HaiStore Perú',
    description:
      'Ricoh IM 600F seminueva de alto volumen. Stock y soporte con Distribuidor Autorizado HaiStore.',
    pageName: 'Ricoh IM 600F',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/descargas',
    title: 'Descargas de soporte Ricoh | Utilidades técnicas | HaiStore',
    description:
      'Descarga utilidades de soporte técnico para impresoras y fotocopiadoras Ricoh: acceso remoto, diagnóstico de red y herramientas recomendadas por HaiTech, Distribuidor Autorizado.',
    pageName: 'Descargas de soporte',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/contacto',
    title: 'Contacto | Cotizar Fotocopiadora, Impresora o Tóner Ricoh | HaiStore',
    description:
      'Cotiza fotocopiadoras, impresoras, tóner y repuestos Ricoh con Distribuidor Autorizado en Lima y Perú. Ventas, soporte técnico y asesoría comercial por WhatsApp, teléfono o formulario.',
    pageName: 'Contacto',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/software',
    title: 'Software Ricoh | Gestión documental y automatización | HaiStore Perú',
    description:
      'Software de gestión documental, automatización de procesos e integración Ricoh para empresas en Perú. Cotiza licencias y planes con Distribuidor Autorizado HaiTech.',
    pageName: 'Software',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/haiprotect',
    title: 'HaiProtect | Garantía extendida para equipos Ricoh | HaiStore',
    description:
      'Extiende la garantía de tu fotocopiadora o impresora Ricoh con HaiProtect. Planes de cobertura, soporte técnico y respaldo oficial en Perú.',
    pageName: 'HaiProtect',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/foro',
    title: 'Foro técnico Ricoh | Comunidad HaiStore Perú',
    description:
      'Comunidad técnica HaiStore: consultas de firmware, mantenimiento, tóner y multifuncionales Ricoh. Comparte experiencias con técnicos y clientes en Perú.',
    pageName: 'Foro técnico',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/terminos',
    title: 'Términos y condiciones | HaiStore — Distribuidor Autorizado Ricoh',
    description:
      'Condiciones de venta, alquiler, garantías y envíos de HaiStore, Distribuidor Autorizado Ricoh en Perú. Conoce tus derechos y obligaciones al comprar.',
    pageName: 'Términos y condiciones',
    jsonLdKind: 'webpage',
  },
  {
    pathname: '/privacidad',
    title: 'Política de privacidad | HaiStore Perú',
    description:
      'Cómo HaiStore trata datos personales de clientes y visitantes: finalidades, conservación y derechos ARCO según la normativa peruana de protección de datos.',
    pageName: 'Política de privacidad',
    jsonLdKind: 'webpage',
  },
];

export function findStaticSeoRoute(pathname) {
  return STATIC_SEO_ROUTES.find((route) => route.pathname === pathname) ?? null;
}

export function buildStaticSeoRecord(route, siteOrigin, buildAbsoluteUrlFn) {
  return {
    pathname: route.pathname,
    canonical: buildAbsoluteUrlFn(route.pathname, siteOrigin),
    title: route.title,
    description: route.description,
    ogType: 'website',
    pageName: route.pageName,
    jsonLdKind: route.jsonLdKind,
  };
}

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

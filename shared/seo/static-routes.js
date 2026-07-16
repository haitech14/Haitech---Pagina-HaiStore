/** Páginas estáticas indexables (FAQ, confianza, etc.). */
export const STATIC_SEO_ROUTES = [
  {
    pathname: '/preguntas-frecuentes',
    title: 'Preguntas frecuentes | Fotocopiadoras Ricoh | HaiStore',
    description:
      'Respuestas sobre venta y alquiler de fotocopiadoras Ricoh, garantía, delivery, tóner, repuestos y soporte técnico. Distribuidor Autorizado en Perú.',
    pageName: 'Preguntas frecuentes',
    jsonLdKind: 'faq',
  },
  {
    pathname: '/por-que-comprar-con-nosotros',
    title: 'Por qué comprar con nosotros | Distribuidor Autorizado Ricoh | HaiStore',
    description:
      'Distribuidor Autorizado Ricoh en Perú: venta y alquiler de fotocopiadoras, tóner, repuestos, cobertura nacional y soporte técnico especializado.',
    pageName: 'Por qué comprar con nosotros',
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

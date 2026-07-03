/** Rutas de servicios indexables con metas SEO dedicadas. */
export const SERVICE_HUB_SECTIONS = [
  {
    pathname: '/servicios?seccion=alquiler',
    title: 'Alquiler de fotocopiadoras e impresoras Ricoh | HaiStore',
    description:
      'Alquiler mensual de fotocopiadoras e impresoras multifuncionales Ricoh para empresas. Planes con mantenimiento, tóner y soporte técnico en Lima y Perú.',
    serviceName: 'Alquiler de equipos de impresión',
    serviceType: 'Alquiler de fotocopiadoras',
  },
  {
    pathname: '/servicios?seccion=servicio-tecnico',
    title: 'Soporte técnico para fotocopiadoras Ricoh | HaiStore',
    description:
      'Mantenimiento preventivo y correctivo, reparación y firmware para impresoras y multifuncionales Ricoh. Técnicos certificados en Lima y Perú.',
    serviceName: 'Soporte técnico especializado',
    serviceType: 'Servicio técnico de impresoras',
  },
  {
    pathname: '/servicios?seccion=outsourcing',
    title: 'Outsourcing de impresión empresarial | HaiStore',
    description:
      'Externaliza tu flota de impresión con outsourcing HaiTech: equipos, consumibles, repuestos y soporte con costo por página predecible.',
    serviceName: 'Outsourcing de impresión',
    serviceType: 'Gestión documental empresarial',
  },
  {
    pathname: '/servicios?seccion=servicios-corporativos',
    title: 'Servicios corporativos de impresión | HaiStore',
    description:
      'Soluciones integrales para empresas: flotas de impresión, suministros, repuestos y soporte con Distribuidor Autorizado Ricoh en Perú.',
    serviceName: 'Servicios corporativos',
    serviceType: 'Soluciones de impresión empresarial',
  },
];

export const SERVICE_DETAIL_ROUTES = [
  {
    pathname: '/servicios/alquiler-alquiler-mensual',
    title: 'Alquiler mensual de fotocopiadoras Ricoh | HaiStore',
    description:
      'Plan de alquiler mensual de fotocopiadoras e impresoras multifuncionales Ricoh. Incluye mantenimiento, tóner y soporte técnico para empresas en Perú.',
    serviceName: 'Alquiler mensual de equipos',
    serviceType: 'Alquiler de fotocopiadoras',
  },
  {
    pathname: '/servicios/servicio-tecnico-mantenimiento-preventivo',
    title: 'Mantenimiento preventivo Ricoh | HaiStore',
    description:
      'Mantenimiento preventivo programado para impresoras y multifuncionales Ricoh. Evita paradas con técnicos especializados en Lima y Perú.',
    serviceName: 'Mantenimiento preventivo',
    serviceType: 'Servicio técnico de impresoras',
  },
  {
    pathname: '/servicios/outsourcing-outsourcing-impresion',
    title: 'Outsourcing de impresión | HaiStore Perú',
    description:
      'Outsourcing de impresión con equipos Ricoh, consumibles, repuestos y soporte incluido. Costo predecible por página para tu empresa.',
    serviceName: 'Outsourcing de impresión',
    serviceType: 'Gestión documental empresarial',
  },
];

export const SERVICE_SEO_ROUTES = [
  {
    pathname: '/servicios',
    title: 'Servicios de impresión y alquiler | HaiStore Perú',
    description:
      'Alquiler de fotocopiadoras, soporte técnico, outsourcing de impresión y servicios corporativos. Distribuidor Autorizado Ricoh en Perú.',
    serviceName: 'Servicios HaiTech',
    serviceType: 'Servicios de impresión empresarial',
  },
  ...SERVICE_HUB_SECTIONS,
  ...SERVICE_DETAIL_ROUTES,
];

export function findServiceSeoRoute(pathname, search = '') {
  const routeKey = search ? `${pathname}?${search}` : pathname;
  return SERVICE_SEO_ROUTES.find((route) => route.pathname === routeKey);
}

export function buildServiceSeoRecord(route, siteOrigin, buildAbsoluteUrlFn) {
  const canonical = buildAbsoluteUrlFn(route.pathname, siteOrigin);
  return {
    pathname: route.pathname,
    canonical,
    title: route.title,
    description: route.description,
    ogType: 'website',
    serviceName: route.serviceName,
    serviceType: route.serviceType,
  };
}

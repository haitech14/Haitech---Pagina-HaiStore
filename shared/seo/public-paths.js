/** Prefijos de rutas SPA válidas. El resto de HTML se redirige (evita 404/soft 404). */
export const VALID_HTML_PREFIXES = [
  '/tienda',
  '/categoria',
  '/servicios',
  '/software',
  '/foro',
  '/preguntas-frecuentes',
  '/por-que-comprar-con-nosotros',
  '/sobre-nosotros',
  '/distribuidor-autorizado-ricoh',
  '/fotocopiadoras-peru',
  '/fotocopiadoras-ricoh',
  '/alquiler-fotocopiadoras-lima',
  '/toner-ricoh',
  '/guias',
  '/modelos',
  '/descargas',
  '/contacto',
  '/haiprotect',
  '/terminos',
  '/privacidad',
  '/login',
  '/checkout',
  '/mi-cuenta',
  '/favoritos',
  '/admin',
  '/panel',
  '/alquiler',
  '/servicio-tecnico',
  '/outsourcing',
  '/servicios-corporativos',
];

export const STORE_SHOWCASE_SLUGS = new Set([
  'multifuncionales',
  'formato-ancho',
  'impresoras',
  'laptops',
  'monitores',
  'pantallas-interactivas',
  'videoconferencia',
  'toner',
  'repuestos',
  'escaneres',
  'camaras',
  'accesorios',
  'software',
  'toner-repuestos',
  'plotter',
  'multifuncional-planos',
]);

/** Vitrina /tienda/:slug → categoría canónica (evita duplicados). */
export const VITRINA_CANONICAL_PATH = {
  multifuncionales: '/tienda/multifuncionales',
  impresoras: '/tienda/impresoras',
  'formato-ancho': '/tienda/formato-ancho',
  toner: '/tienda/toner',
  'toner-repuestos': '/tienda/toner',
  repuestos: '/tienda/repuestos',
  accesorios: '/tienda/accesorios',
  escaneres: '/tienda/escaneres',
  laptops: '/tienda/laptops',
  monitores: '/tienda/monitores',
  camaras: '/tienda/camaras',
  'pantallas-interactivas': '/tienda/pantallas-interactivas',
  videoconferencia: '/tienda/videoconferencia',
  software: '/software',
};

export function vitrinaCanonicalPath(slug) {
  const key = String(slug ?? '');
  return VITRINA_CANONICAL_PATH[key] ?? `/tienda/${key}`;
}

const INDEXABLE_ROBOTS =
  'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1';

export function indexableRobots() {
  return INDEXABLE_ROBOTS;
}

export const NOINDEX_ROBOTS = 'noindex,nofollow';

/** Rutas privadas: no deben heredar el canónico del home. */
export const NOINDEX_HTML_PREFIXES = [
  '/login',
  '/checkout',
  '/mi-cuenta',
  '/favoritos',
  '/admin',
  '/panel',
];

export function noindexRobots() {
  return NOINDEX_ROBOTS;
}

export function isNoindexHtmlPath(pathname) {
  return NOINDEX_HTML_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isValidHtmlPath(pathname) {
  if (pathname === '/') return true;
  return VALID_HTML_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function looksLikeLegacyCmsPath(pathname) {
  return (
    /^\/(wp-admin|wp-content|wp-includes|wordpress|blog)\b/i.test(pathname) ||
    /\.php$/i.test(pathname) ||
    /^\/(product|productos|shop|catalogo|catálogo)\b/i.test(pathname)
  );
}

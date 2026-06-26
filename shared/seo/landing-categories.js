/** Categorías principales para sitemap y snapshot SEO (alineado con src/data/categories.ts). */
export const LANDING_CATEGORY_SEO = [
  {
    slug: 'multifuncionales',
    name: 'Multifuncionales',
    tagline: 'Imprime, escanea y copia en un solo equipo',
    image: '/categories/multifuncionales.png',
  },
  {
    slug: 'impresoras',
    name: 'Impresoras',
    tagline: 'Láser, inkjet y soluciones de impresión',
    image: '/categories/impresoras.png',
  },
  {
    slug: 'formato-ancho',
    name: 'Formato ancho',
    tagline: 'Plotters y equipos de gran formato',
    image: '/categories/formato-ancho.png',
  },
  {
    slug: 'toner-suministros',
    name: 'Suministros',
    tagline: 'Tóner original, remanufacturado y recargas',
    image: '/categories/toner-suministros.png',
  },
  {
    slug: 'repuestos',
    name: 'Repuestos',
    tagline: 'Partes y componentes para tu equipo',
    image: '/categories/repuestos.png',
  },
  {
    slug: 'accesorios',
    name: 'Accesorios',
    tagline: 'Complementos para tu flota de impresión',
    image: '/categories/accesorios.png',
  },
  {
    slug: 'software',
    name: 'Software',
    tagline: 'Soluciones de gestión documental',
    image: '/categories/software.png',
  },
  {
    slug: 'alquiler',
    name: 'Alquiler',
    tagline: 'Equipos de impresión y tecnología en modalidad de alquiler',
    image: '/categories/alquiler.png',
  },
];

function resolveCategoryLandingHref(categoryLabel) {
  const normalized = String(categoryLabel ?? '').toLowerCase();
  if (normalized.includes('multifuncional')) {
    return '/categoria/multifuncionales?sub=all';
  }
  if (normalized.includes('impresora')) {
    return '/categoria/impresoras?sub=all';
  }
  if (/toner|tóner|suministro|cartucho/i.test(normalized)) {
    return '/categoria/toner-suministros';
  }
  if (/repuesto|partes|unidad de imagen/i.test(normalized)) {
    return '/categoria/repuestos';
  }
  return '/tienda';
}

export function buildSimpleProductBreadcrumbs(product) {
  const crumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/tienda' },
  ];
  if (product.category?.trim()) {
    const label = product.category.trim();
    crumbs.push({ label, href: resolveCategoryLandingHref(label) });
  }
  crumbs.push({ label: product.name });
  return crumbs;
}

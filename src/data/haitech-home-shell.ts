import { megaMenuImageForSlug } from '@/data/mega-menu';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import { storeShowcasePath } from '@/lib/store-showcase-path';

function homeCategoryImage(slug: string): string {
  return megaMenuImageForSlug(slug) ?? `/categories/${slug}.png`;
}
import {
  HEADER_BUY_RENT_WHATSAPP_LINK,
  HEADER_BUY_RENT_WHATSAPP_LABEL,
  HEADER_LIMA_MAPS_LINK,
  HEADER_PIURA_MAPS_LINK,
  HEADER_SALES_EMAIL,
  HEADER_SERVICE_WHATSAPP_LINK,
  HEADER_SUPPORT_EMAIL,
  HEADER_SUPPORT_PHONE_DISPLAY,
  HEADER_TOPBAR_ADDRESS,
  HEADER_TOPBAR_PROMO_TEXT,
  HEADER_PIURA_ADDRESS,
} from '@/data/site-header';

/** Tokens visuales home estilo ecommerce (marca HAITECH). */
export const HAITECH_HOME = {
  brand: '#E30613',
  accent: '#FF6B00',
  blackNav: '#131313',
  text: '#343434',
  grayBg: '#F5F5F5',
  maxWidth: '1400px',
  /** Contenedor del hero: ~7% más ancho en desktop, sin full-bleed. */
  heroMaxWidth: '1500px',
} as const;

export const HAITECH_TOPBAR_BRANDS = [
  { label: 'Tienda', href: 'https://www.haitech.pe' },
  { label: 'HaiSupport', href: 'https://soporte.haitech.pe' },
  { label: 'HaiSales', href: 'https://ventas.haitech.pe' },
] as const;

/** Enlaces planos de la barra negra del home HAITECH (sin mega menú). */
export const HAITECH_BLACK_NAV_LINKS = [
  {
    id: 'servicio-tecnico',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicio Técnico',
    matchActive: ({ pathname, search }: { pathname: string; search: string }) =>
      pathname.startsWith('/servicios') && search.includes('seccion=servicio-tecnico'),
  },
  {
    id: 'alquiler',
    to: serviceHubPath('alquiler'),
    label: 'Alquiler',
    matchActive: ({ pathname }: { pathname: string }) =>
      pathname.startsWith('/servicios/alquiler') ||
      pathname === '/alquiler' ||
      pathname.startsWith('/categoria/alquiler'),
  },
  {
    id: 'nosotros',
    to: '/por-que-comprar-con-nosotros',
    label: 'Nosotros',
    matchActive: ({ pathname }: { pathname: string }) =>
      pathname.startsWith('/por-que-comprar-con-nosotros'),
  },
  {
    id: 'contacto',
    to: '/contacto',
    label: 'Contacto',
    matchActive: ({ pathname }: { pathname: string }) => pathname.startsWith('/contacto'),
  },
] as const;

/** Nav negra legacy (izquierda del separador). */
export const HAITECH_PRIMARY_CATEGORIES_LEFT = [
  { label: 'Multifuncionales', to: categoryLandingPath('multifuncionales') },
  { label: 'Impresión', to: categoryLandingPath('impresoras') },
  { label: 'Tóner y consumibles', to: categoryLandingPath('toner-suministros') },
] as const;

/** Nav negra: servicios (derecha del separador). */
export const HAITECH_PRIMARY_CATEGORIES_RIGHT = [
  { label: 'Servicio técnico', to: serviceHubPath('servicio-tecnico') },
  { label: 'Alquiler', to: serviceHubPath('alquiler') },
] as const;

export const HAITECH_NAV_QUOTE_HREF = buildHaitechWhatsAppUrl(
  'Hola HAITECH, quiero comprar por WhatsApp.',
);

/** @deprecated Preferir LEFT/RIGHT; se mantiene por compatibilidad. */
export const HAITECH_PRIMARY_CATEGORIES = [
  ...HAITECH_PRIMARY_CATEGORIES_LEFT,
  ...HAITECH_PRIMARY_CATEGORIES_RIGHT,
] as const;

export const HAITECH_SECONDARY_NAV = [
  { id: 'marcas', label: 'Nuestras marcas', icon: '🏷️', hasMenu: true, to: '/tienda' },
  { id: 'alquiler', label: 'Alquiler de equipos', icon: '🖨️', hasMenu: false, to: serviceHubPath('alquiler') },
  { id: 'servicio', label: 'Servicio técnico', icon: '🛠️', hasMenu: false, to: serviceHubPath('servicio-tecnico') },
  { id: 'toner', label: 'Tóner y suministros', icon: '📦', hasMenu: false, to: categoryLandingPath('toner-suministros') },
  { id: 'corporativo', label: 'Soluciones empresas', icon: '🏢', hasMenu: false, to: '/contacto' },
  { id: 'soporte', label: 'Soporte HAITECH', icon: '🛡️', hasMenu: false, to: serviceHubPath('servicio-tecnico') },
] as const;

export const HAITECH_PRODUCT_TABS = [
  { id: 'ofertas', label: 'Ofertas top', to: '/tienda' },
  { id: 'multi', label: 'Multifuncionales', to: categoryLandingPath('multifuncionales') },
  { id: 'impresoras', label: 'Impresoras', to: categoryLandingPath('impresoras') },
  { id: 'toner', label: 'Tóner', to: categoryLandingPath('toner-suministros') },
  { id: 'repuestos', label: 'Repuestos', to: categoryLandingPath('repuestos') },
] as const;

/** Carrusel de categorías debajo de los catálogos Nuevos / Seminuevos / Remanufacturado. */
export const HAITECH_HOME_CATEGORY_CAROUSEL = [
  {
    id: 'multifuncionales',
    name: 'Multifuncionales',
    description: 'Impresión, copia y escaneo',
    image: homeCategoryImage('multifuncionales'),
    to: storeShowcasePath({ categoryId: 'multifuncionales' }),
  },
  {
    id: 'impresoras',
    name: 'Impresoras',
    description: 'Láser mono y color',
    image: homeCategoryImage('impresoras'),
    to: storeShowcasePath({ categoryId: 'impresoras' }),
  },
  {
    id: 'toner',
    name: 'Tóner y consumibles',
    description: 'Originales Ricoh',
    image: homeCategoryImage('toner-suministros'),
    to: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'toner' }),
  },
  {
    id: 'repuestos',
    name: 'Repuestos',
    description: 'Unidades, fusores y más',
    image: homeCategoryImage('repuestos'),
    to: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'repuestos' }),
  },
  {
    id: 'formato-ancho',
    name: 'Formato ancho',
    description: 'Plotters y planos',
    image: homeCategoryImage('formato-ancho'),
    to: storeShowcasePath({ categoryId: 'formato-ancho' }),
  },
  {
    id: 'computadoras-laptop',
    name: 'Computadoras y laptop',
    description: 'Equipos de cómputo',
    image: homeCategoryImage('computadoras-laptop'),
    to: storeShowcasePath({ categoryId: 'laptops' }),
  },
  {
    id: 'monitores',
    name: 'Monitores',
    description: 'Pantallas para oficina',
    image: homeCategoryImage('monitores'),
    to: storeShowcasePath({ categoryId: 'monitores' }),
  },
  {
    id: 'escaneres',
    name: 'Escáneres',
    description: 'Digitalización documental',
    image: homeCategoryImage('escaneres'),
    to: storeShowcasePath({ categoryId: 'escaneres' }),
  },
  {
    id: 'accesorios',
    name: 'Accesorios',
    description: 'Complementos de impresión',
    image: homeCategoryImage('accesorios'),
    to: storeShowcasePath({ categoryId: 'accesorios' }),
  },
  {
    id: 'software',
    name: 'Software',
    description: 'Licencias y soluciones',
    image: homeCategoryImage('software'),
    to: '/software',
  },
] as const;

export const HAITECH_HOME_WHATSAPP_URL = buildHaitechWhatsAppUrl(
  'Hola HAITECH, quiero comprar / cotizar por WhatsApp.',
);

/** Banner intermedio home — repuestos originales Ricoh. */
export const HAITECH_HOME_MID_BANNER = {
  png: '/hero/haitech-home-mid-banner-cropped.png',
  webp: '/hero/haitech-home-mid-banner-cropped.webp',
  width: 1779,
  height: 445,
  alt: 'Repuestos originales para fotocopiadoras Ricoh — calidad garantizada y disponibilidad inmediata',
  href: storeShowcasePath({ categoryId: 'toner-repuestos', consumableKind: 'repuestos' }),
} as const;

/** Banners intermedios de servicio técnico y alquiler. */
export const HAITECH_HOME_POST_SERVICES_BANNERS = [
  {
    id: 'mid-servicio',
    png: '/hero/haitech-home-mid-banner-servicio.png',
    width: 2048,
    height: 493,
    alt: 'Servicio técnico especializado HAITECH — diagnóstico, mantenimiento y reparaciones',
    href: serviceHubPath('servicio-tecnico'),
  },
  {
    id: 'mid-alquiler',
    png: '/hero/haitech-home-mid-banner-alquiler.png',
    width: 1774,
    height: 375,
    alt: 'Alquiler de equipos Ricoh — planes flexibles para empresas',
    href: serviceHubPath('alquiler'),
  },
] as const;

/** Encabezado de la sección Nuestros Servicios (encima del banner de alquiler). */
export const HAITECH_HOME_SERVICES_SECTION_HEADER = {
  eyebrow: 'Soluciones para tu empresa',
  titleBefore: 'Nuestros ',
  titleAccent: 'Servicios',
  description:
    'Te acompañamos en cada etapa, con soluciones integrales para mejorar la productividad de tu negocio.',
  tagline: 'Tu aliado en soluciones de impresión',
} as const;

/** @deprecated Usar HAITECH_HOME_SERVICES_SECTION_HEADER */
export const HAITECH_HOME_ALQUILER_HEADER = HAITECH_HOME_SERVICES_SECTION_HEADER;

export const HAITECH_HOME_HERO_SLIDES = [
  {
    id: 'hero-slide-3',
    src: '/hero/haitech-home-hero-slide-3.webp',
    /** Fallback si el navegador no soporta WebP. */
    srcPng: '/hero/haitech-home-hero-slide-3.png',
    alt: 'HAITECH — Distribuidor Autorizado Ricoh. Equipos, tóner y soporte técnico en Perú',
    href: HAITECH_HOME_WHATSAPP_URL,
    /** Móvil: zoom al lockup RICOH + titular. */
    mobileObjectPosition: 'left 18%',
    objectPosition: 'center 50%',
  },
  {
    id: 'hero-main',
    src: '/hero/haitech-home-hero.png',
    alt: 'HAITECH — Distribuidor Autorizado Ricoh. Equipos, tóner y soporte técnico en Perú',
    href: HAITECH_HOME_WHATSAPP_URL,
    mobileObjectPosition: 'left 16%',
    /** Recorta margen superior y centra el contenido principal. */
    objectPosition: 'center 62%',
  },
  {
    id: 'hero-slide-2',
    src: '/hero/haitech-home-hero-slide-2.png',
    alt: 'HAITECH — Distribuidor Autorizado Ricoh. Equipos, tóner y soporte técnico en Perú',
    href: HAITECH_HOME_WHATSAPP_URL,
    mobileObjectPosition: 'left 20%',
    objectPosition: 'center 70%',
  },
] as const;

export const HAITECH_HOME_TOPBAR = {
  promo: HEADER_TOPBAR_PROMO_TEXT,
  salesLabel: HEADER_BUY_RENT_WHATSAPP_LABEL,
  salesPhone: '915-149290',
  salesHref: HEADER_BUY_RENT_WHATSAPP_LINK,
  salesEmail: HEADER_SALES_EMAIL,
  supportLabel: 'Soporte técnico',
  supportPhone: HEADER_SUPPORT_PHONE_DISPLAY,
  supportHref: HEADER_SERVICE_WHATSAPP_LINK,
  supportEmail: HEADER_SUPPORT_EMAIL,
  locations: [
    {
      id: 'lima',
      city: 'Lima',
      address: HEADER_TOPBAR_ADDRESS,
      href: HEADER_LIMA_MAPS_LINK,
    },
    {
      id: 'piura',
      city: 'Piura',
      address: HEADER_PIURA_ADDRESS,
      href: HEADER_PIURA_MAPS_LINK,
    },
  ],
} as const;

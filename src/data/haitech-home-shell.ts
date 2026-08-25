import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';
import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import {
  HEADER_BUY_RENT_WHATSAPP_LINK,
  HEADER_LIMA_MAPS_LINK,
  HEADER_PIURA_MAPS_LINK,
  HEADER_SALES_EMAIL,
  HEADER_SALES_PHONE_DISPLAY,
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
} as const;

export const HAITECH_TOPBAR_BRANDS = [
  { label: 'Tienda', href: 'https://www.haitech.pe' },
  { label: 'HaiSupport', href: 'https://soporte.haitech.pe' },
  { label: 'HaiSales', href: 'https://ventas.haitech.pe' },
] as const;

/** Nav negra estilo barra soluciones (izquierda del separador). */
export const HAITECH_PRIMARY_CATEGORIES_LEFT = [
  { label: 'Multifuncionales', to: categoryLandingPath('multifuncionales') },
  { label: 'Impresión', to: categoryLandingPath('impresoras') },
  { label: 'Tóner y consumibles', to: categoryLandingPath('toner-suministros') },
] as const;

/** Nav negra: servicios y empresa (derecha del separador, antes de Recursos). */
export const HAITECH_PRIMARY_CATEGORIES_RIGHT = [
  { label: 'Servicio técnico', to: serviceHubPath('servicio-tecnico') },
  { label: 'Renting', to: serviceHubPath('alquiler') },
  { label: 'Empresas', to: '/por-que-comprar-con-nosotros' },
] as const;

export const HAITECH_NAV_RECURSOS = [
  { label: 'Foro y comunidad', to: '/foro' },
  { label: 'Preguntas frecuentes', to: '/preguntas-frecuentes' },
  { label: 'Por qué comprar con nosotros', to: '/por-que-comprar-con-nosotros' },
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
    image: '/categories/haitech-home/cat-multifuncionales.png',
    to: categoryLandingPath('multifuncionales'),
  },
  {
    id: 'impresoras',
    name: 'Impresoras',
    description: 'Láser mono y color',
    image: '/categories/haitech-home/cat-impresoras.png',
    to: categoryLandingPath('impresoras'),
  },
  {
    id: 'toner',
    name: 'Tóner y consumibles',
    description: 'Originales Ricoh',
    image: '/categories/haitech-home/cat-toner.png',
    to: categoryLandingPath('toner-suministros'),
  },
  {
    id: 'repuestos',
    name: 'Repuestos',
    description: 'Unidades, fusores y más',
    image: '/categories/haitech-home/cat-repuestos.png',
    to: categoryLandingPath('repuestos'),
  },
  {
    id: 'formato-ancho',
    name: 'Formato ancho',
    description: 'Plotters y planos',
    image: '/categories/haitech-home/cat-formato-ancho.png',
    to: categoryLandingPath('formato-ancho'),
  },
  {
    id: 'alquiler',
    name: 'Alquiler',
    description: 'Planes con mantenimiento',
    image: '/categories/haitech-home/cat-alquiler.png',
    to: serviceHubPath('alquiler'),
  },
  {
    id: 'servicio',
    name: 'Servicio técnico',
    description: 'Soporte certificado',
    image: '/categories/haitech-home/cat-servicio.png',
    to: serviceHubPath('servicio-tecnico'),
  },
] as const;

export const HAITECH_HOME_HERO_SLIDES = [
  {
    id: 'hero-1',
    src: '/hero/haitech-home-hero.png',
    alt: 'HAITECH — Banner promocional de impresión y tecnología',
  },
  {
    id: 'hero-2',
    src: '/hero/haitech-home-hero-2.png',
    alt: 'HAITECH — Soluciones de impresión Ricoh',
  },
] as const;

export const HAITECH_HOME_WHATSAPP_URL = buildHaitechWhatsAppUrl(
  'Hola HAITECH, quiero comprar / cotizar por WhatsApp.',
);

export const HAITECH_HOME_TOPBAR = {
  promo: HEADER_TOPBAR_PROMO_TEXT,
  salesLabel: 'Ventas/Alquiler',
  salesPhone: HEADER_SALES_PHONE_DISPLAY,
  salesHref: HEADER_BUY_RENT_WHATSAPP_LINK,
  salesEmail: HEADER_SALES_EMAIL,
  supportLabel: 'Soporte',
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

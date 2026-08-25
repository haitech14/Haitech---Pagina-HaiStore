import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import { HAITECH_HOME_WHATSAPP_URL } from '@/data/haitech-home-shell';

export const HAITECH_LANDING_MAX_WIDTH = '1320px';

export const HAITECH_LANDING_COLORS = {
  primary: '#e30613',
  primaryDark: '#bd0010',
  textPrimary: '#111111',
  textSecondary: '#666666',
  border: '#e7e7e7',
  backgroundSoft: '#fafafa',
  white: '#ffffff',
} as const;

export type FeaturedLandingBadge = 'OFERTA' | 'NUEVO';

export interface FeaturedLandingProduct {
  id: string;
  name: string;
  description: string;
  image: string;
  pricePEN: number;
  badge?: FeaturedLandingBadge;
  /** ID de catálogo cuando exista (para enlazar/API). */
  catalogProductId?: string;
}

export const HAITECH_LANDING_FEATURED_PRODUCTS: FeaturedLandingProduct[] = [
  {
    id: 'landing-ricoh-im-430f',
    name: 'RICOH IM 430F',
    description: 'Multifuncional A4',
    image: '/products/ricoh-im-430f.webp',
    pricePEN: 3199,
    badge: 'OFERTA',
    catalogProductId: 'ricoh-im-430f',
  },
  {
    id: 'landing-ricoh-p-502',
    name: 'Impresora Láser',
    description: 'RICOH P 502',
    image: '/home/category-chips/equipment/impresora-laser.webp',
    pricePEN: 1299,
    badge: 'NUEVO',
  },
  {
    id: 'landing-toner-mpc2503',
    name: 'Tóner RICOH',
    description: 'MP C2503 Negro',
    image: '/products/generico-rv-mp-c2503-negro.webp',
    pricePEN: 289,
    badge: 'OFERTA',
  },
  {
    id: 'landing-ricoh-im-c3000',
    name: 'RICOH IM C3000',
    description: 'Multifuncional A3 Color',
    image: '/products/color-ricoh-im-c3000.webp',
    pricePEN: 8899,
    badge: 'NUEVO',
  },
  {
    id: 'landing-unidad-sp-c840',
    name: 'Unidad de Imagen',
    description: 'RICOH SP C840',
    image: '/products/laser-color-ricoh-sp-c840dn.webp',
    pricePEN: 349,
  },
];

export const HAITECH_LANDING_WHY_BUY = [
  { id: 'ricoh', title: 'Distribuidor', subtitle: 'Autorizado Ricoh', icon: 'shield' },
  { id: 'garantia', title: 'Garantía', subtitle: 'oficial', icon: 'shield-check' },
  { id: 'instalacion', title: 'Instalación', subtitle: 'y capacitación', icon: 'wrench' },
  { id: 'asesoria', title: 'Asesoría', subtitle: 'personalizada', icon: 'user' },
  { id: 'facturacion', title: 'Facturación', subtitle: 'y crédito', icon: 'file' },
  { id: 'empresas', title: '+1000 empresas', subtitle: 'confían en nosotros', icon: 'users' },
] as const;

export const HAITECH_LANDING_TRUSTED_BRANDS = [
  { name: 'Ricoh', logo: '/brands/ricoh.png' },
  { name: 'HP', logo: '/brands/hp.png' },
  { name: 'Epson', logo: '/brands/epson.png' },
  { name: 'Brother', logo: '/brands/brother.svg' },
  { name: 'Lexmark', logo: '/brands/lexmark.png' },
  { name: 'Canon', logo: '/brands/canon.png' },
] as const;

export const HAITECH_LANDING_COMPANY_BENEFITS = [
  {
    id: 'envios',
    title: 'Envíos a todo el Perú',
    subtitle: '24 a 48 horas',
    icon: 'truck',
  },
  {
    id: 'soporte',
    title: 'Soporte 24/7',
    subtitle: 'Siempre a tu disposición',
    icon: 'headphones',
  },
  {
    id: 'experiencia',
    title: '+15 años de experiencia',
    subtitle: 'Soluciones confiables',
    icon: 'medal',
  },
  {
    id: 'originales',
    title: '100% Originales',
    subtitle: 'Calidad garantizada',
    icon: 'badge',
  },
] as const;

export const HAITECH_LANDING_LINKS = {
  allProducts: '/tienda',
  offers: '/tienda',
  service: serviceHubPath('servicio-tecnico'),
  rental: serviceHubPath('alquiler'),
  whatsapp: HAITECH_HOME_WHATSAPP_URL,
  multifuncionales: categoryLandingPath('multifuncionales'),
} as const;

export const HAITECH_LANDING_SERVICE_CARDS = [
  {
    id: 'servicio-tecnico',
    title: 'Servicio técnico especializado',
    description: 'Técnicos certificados, repuestos originales y respuesta rápida.',
    bullets: ['Diagnóstico preciso', 'Mantenimiento preventivo', 'Reparaciones con garantía'],
    cta: 'Solicitar servicio',
    href: serviceHubPath('servicio-tecnico'),
    image: '/promo-cards/technician-service.webp',
    imageAlt: 'Técnico RICOH reparando una multifuncional',
  },
  {
    id: 'alquiler',
    title: 'Alquiler de equipos',
    description: 'Planes flexibles para empresas y proyectos de cualquier tamaño.',
    bullets: ['Sin inversión inicial', 'Mantenimiento incluido', 'Equipos de última generación'],
    cta: 'Conoce los planes',
    href: serviceHubPath('alquiler'),
    image: '/services/alquiler/impresoras.png',
    imageAlt: 'Multifuncional profesional RICOH en alquiler',
  },
] as const;

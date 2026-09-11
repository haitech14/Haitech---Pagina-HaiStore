import { serviceHubPath } from '@/lib/service-hub';
import { HAITECH_WHATSAPP_DISPLAY } from '@/lib/whatsapp-sales';

export type StorefrontChannelBannerId = 'alquiler' | 'servicio-tecnico' | 'soluciones';

export type StorefrontChannelBannerProduct = {
  id: string;
  name: string;
  image: string;
  price: string;
  compareAt?: string;
  specs: string;
};

export type StorefrontChannelBanner = {
  id: StorefrontChannelBannerId;
  href: string;
  campaign: string;
  eyebrow: string;
  titleLines: readonly [string, string, string];
  /** Línea del titular en rojo (el resto va en negro). Por defecto 0 y 2. */
  titleAccentLine?: 0 | 1 | 2;
  features: readonly { id: string; label: string }[];
  ctaLabel: string;
  phoneDisplay: string;
  quoteLines: readonly string[];
  products: readonly StorefrontChannelBannerProduct[];
  barItems: readonly { id: string; title: string; subtitle: string }[];
  tagline: string;
};

const PHONE = HAITECH_WHATSAPP_DISPLAY.replace('+51 ', '');

export const STOREFRONT_CHANNEL_BANNERS: Record<
  StorefrontChannelBannerId,
  StorefrontChannelBanner
> = {
  alquiler: {
    id: 'alquiler',
    href: serviceHubPath('alquiler'),
    campaign: 'alquiler-promo-banner',
    eyebrow: 'Impulsa tu negocio',
    titleLines: ['ALQUILA EQUIPOS', 'DESDE S/ 699 /MES', 'FOTOCOPIADORA RICOH'],
    titleAccentLine: 1,
    features: [
      { id: 'rendimiento', label: 'Mantenimiento incluido' },
      { id: 'tech', label: 'Tóner y repuestos' },
      { id: 'negocio', label: 'Sin inversión inicial' },
    ],
    ctaLabel: 'Alquilar ahora',
    phoneDisplay: PHONE,
    quoteLines: [
      'Vi el banner de alquiler: equipos Ricoh desde S/ 699 al mes.',
      'Me interesa cotizar un plan de alquiler.',
    ],
    products: [
      {
        id: 'mp-305',
        name: 'RICOH MP 305+',
        image: '/home/promos/ricoh-mp-3055.png',
        price: 'S/ 699',
        specs: 'Desde /mes · A4 · B/N',
      },
      {
        id: 'im-430f',
        name: 'RICOH IM 430F',
        image: '/home/promos/ricoh-im-430f.png',
        price: 'S/ 849',
        specs: 'Desde /mes · A4 · B/N',
      },
      {
        id: 'im-460f',
        name: 'RICOH IM 460F',
        image: '/home/promos/ricoh-im-460f.png',
        price: 'S/ 1,099',
        specs: 'Desde /mes · A4 · B/N',
      },
    ],
    barItems: [
      { id: 'originales', title: 'Equipos originales', subtitle: 'Garantía Ricoh' },
      { id: 'envios', title: 'Envíos a todo el Perú', subtitle: 'Rápido y seguro' },
      { id: 'soporte', title: 'Soporte técnico', subtitle: 'Incluido en el plan' },
      { id: 'contratos', title: 'Contratos flexibles', subtitle: 'Planes a tu medida' },
    ],
    tagline: 'Tu operación sin límites',
  },
  'servicio-tecnico': {
    id: 'servicio-tecnico',
    href: serviceHubPath('servicio-tecnico'),
    campaign: 'servicio-tecnico-promo-banner',
    eyebrow: 'Cuida tu operación',
    titleLines: ['SERVICIO TÉCNICO', 'ESPECIALIZADO', 'PARA TU EMPRESA'],
    features: [
      { id: 'rapida', label: 'Respuesta rápida' },
      { id: 'cobertura', label: 'Cobertura integral' },
      { id: 'planes', label: 'Planes flexibles' },
    ],
    ctaLabel: 'Solicitar servicio',
    phoneDisplay: PHONE,
    quoteLines: [
      'Vi el banner de servicio técnico especializado Ricoh.',
      'Me interesa coordinar mantenimiento o reparación.',
    ],
    products: [
      {
        id: 'preventivo',
        name: 'Preventivo',
        image: '/services/servicio-tecnico/preventivo.png',
        price: 'S/ 150',
        specs: 'B/N desde · visita técnica',
      },
      {
        id: 'correctivo',
        name: 'Correctivo',
        image: '/services/servicio-tecnico/correctivo.png',
        price: 'S/ 200',
        specs: 'Diagnóstico y reparación',
      },
      {
        id: 'planes',
        name: 'Plan mensual',
        image: '/services/servicio-tecnico/planes.png',
        price: 'S/ 89',
        specs: 'Desde /mes · prioridad',
      },
    ],
    barItems: [
      { id: 'tecnicos', title: 'Técnicos certificados', subtitle: 'Especialistas Ricoh' },
      { id: 'repuestos', title: 'Repuestos originales', subtitle: 'Calidad asegurada' },
      { id: 'cobertura', title: 'Lima y provincias', subtitle: 'Atención nacional' },
      { id: 'planes', title: 'Planes de mantenimiento', subtitle: 'Preventivo y correctivo' },
    ],
    tagline: 'Continuidad para tu negocio',
  },
  soluciones: {
    id: 'soluciones',
    href: '/software?seccion=gestion-documental',
    campaign: 'soluciones-promo-banner',
    eyebrow: 'Digitaliza tu empresa',
    titleLines: ['SOLUCIONES DE', 'SOFTWARE', 'PARA TU NEGOCIO'],
    titleAccentLine: 1,
    features: [
      { id: 'documental', label: 'Gestión documental' },
      { id: 'automatizacion', label: 'Automatización' },
      { id: 'ricoh', label: 'Integración Ricoh' },
    ],
    ctaLabel: 'Cotizar ahora',
    phoneDisplay: PHONE,
    quoteLines: [
      'Vi el banner de soluciones de software Haitech.',
      'Me interesa cotizar licencias o un plan empresarial.',
    ],
    products: [
      {
        id: 'gestion',
        name: 'Documental',
        image: '/categories/soluciones-negocio.png',
        price: 'Desde',
        specs: 'Gestión y archivo',
      },
      {
        id: 'antivirus',
        name: 'Antivirus',
        image: '/products/eset-nod32-licencia-12-meses.webp',
        price: 'Licencias',
        specs: 'Protección empresarial',
      },
      {
        id: 'saas',
        name: 'Empresarial',
        image: '/services/servicios-corporativos/saas.png',
        price: 'A medida',
        specs: 'Software y SaaS',
      },
    ],
    barItems: [
      { id: 'asesoria', title: 'Asesoría especializada', subtitle: 'Sin compromiso' },
      { id: 'licencias', title: 'Licencias flexibles', subtitle: 'Mensual o anual' },
      { id: 'integracion', title: 'Integración Ricoh', subtitle: 'Flujos de impresión' },
      { id: 'soporte', title: 'Soporte Haitech', subtitle: 'Acompañamiento local' },
    ],
    tagline: 'Software que impulsa tu operación',
  },
};

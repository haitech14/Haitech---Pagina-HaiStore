import { Award, Headphones, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

import { categoryLandingPath, categoryPathWithCondition } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterValueProp {
  icon: LucideIcon;
  label: string;
}

export const FOOTER_TAGLINE = 'SOLUCIONES DE IMPRESIÓN';

export const FOOTER_DESCRIPTION =
  'Soluciones de impresión confiables y tecnología de vanguardia para que tu empresa sea más eficiente.';

export const FOOTER_VALUE_PROPS: FooterValueProp[] = [
  { icon: ShieldCheck, label: 'Equipos 100% originales' },
  { icon: Award, label: 'Garantía oficial' },
  { icon: Headphones, label: 'Soporte técnico especializado' },
  { icon: Truck, label: 'Envíos a todo el país' },
];

export const FOOTER_NAV_LINKS: FooterLink[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Fotocopiadoras', href: categoryLandingPath('multifuncionales') },
  { label: 'Impresoras', href: categoryLandingPath('impresoras') },
  { label: 'Tóner y tintas', href: categoryLandingPath('toner-suministros') },
  { label: 'Repuestos', href: categoryLandingPath('repuestos') },
  { label: 'Alquiler de equipos', href: serviceHubPath('alquiler') },
  { label: 'Servicio técnico', href: serviceHubPath('servicio-tecnico') },
  { label: 'Descargas', href: '/descargas' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Blog', href: '/foro' },
];

export const FOOTER_CATEGORY_LINKS: FooterLink[] = [
  { label: 'Impresoras multifuncionales', href: categoryLandingPath('multifuncionales') },
  { label: 'Impresoras láser', href: categoryLandingPath('impresoras') },
  { label: 'Impresoras de producción', href: categoryLandingPath('formato-ancho') },
  { label: 'Consumibles y repuestos', href: categoryLandingPath('toner-suministros') },
  {
    label: 'Equipos seminuevos',
    href: categoryPathWithCondition('multifuncionales', 'compatibles'),
  },
  { label: 'Alquiler mensual', href: categoryLandingPath('alquiler') },
];

export const FOOTER_WHATSAPP_LINK = 'https://wa.me/51926224243';

export const FOOTER_ADDRESS = 'Av. Los Próceres 123, San Isidro Lima, Perú';

export const FOOTER_HOURS = 'Lun - Sáb: 9:00 am a 6:00 pm';

export const FOOTER_SALES_EMAIL = 'ventas@nbntecnologia.com';

export const FOOTER_SUPPORT_EMAIL = 'servicioalcliente@haitech.pe';

export const FOOTER_SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://facebook.com/' },
  { label: 'Instagram', href: 'https://instagram.com/' },
  { label: 'YouTube', href: 'https://youtube.com/' },
  { label: 'TikTok', href: 'https://tiktok.com/' },
] as const;

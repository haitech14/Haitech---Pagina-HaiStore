import { Award, Headphones, ShieldCheck, type LucideIcon } from 'lucide-react';

import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import { HAITECH_WHATSAPP_URL } from '@/lib/whatsapp-sales';
import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';

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
  'Impresión confiable y tecnología para empresas más eficientes.';

export const FOOTER_VALUE_PROPS: FooterValueProp[] = [
  { icon: ShieldCheck, label: 'Equipos 100% originales' },
  { icon: Award, label: 'Garantía oficial' },
  { icon: Headphones, label: 'Soporte técnico especializado' },
];

/** Enlaces esenciales alineados con Productos, Servicios y Empresa del menú principal. */
export const FOOTER_NAV_LINKS: FooterLink[] = [
  { label: 'Multifuncionales', href: categoryLandingPath('multifuncionales') },
  { label: 'Impresoras', href: categoryLandingPath('impresoras') },
  { label: 'Tóner y tintas', href: categoryLandingPath('toner-suministros') },
  { label: 'Repuestos', href: categoryLandingPath('repuestos') },
  { label: 'Alquiler de equipos', href: serviceHubPath('alquiler') },
  { label: 'Servicio técnico', href: serviceHubPath('servicio-tecnico') },
  { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
  { label: 'Distribuidor Autorizado Ricoh', href: '/distribuidor-autorizado-ricoh' },
  { label: 'Fotocopiadoras Perú', href: '/fotocopiadoras-peru' },
  { label: 'Fotocopiadoras Ricoh', href: '/fotocopiadoras-ricoh' },
  { label: 'Alquiler Lima', href: '/alquiler-fotocopiadoras-lima' },
  { label: 'Tóner Ricoh', href: '/toner-ricoh' },
  { label: 'Guías', href: '/guias' },
  { label: 'Modelos', href: '/modelos' },
  { label: 'Por qué comprar con nosotros', href: '/por-que-comprar-con-nosotros' },
  { label: 'Descargas', href: '/descargas' },
  { label: 'Contacto', href: '/contacto' },
];

/** Dirección principal (Lima) — misma que barra superior del sitio. */
export const FOOTER_ADDRESS = 'Av. Petit Thouars 1935 - Lince, Lima';

export const FOOTER_HOURS = 'Lun - Vie: 9:00 a.m. - 6:00 p.m.';

export const FOOTER_SALES_WHATSAPP_LINK = HAITECH_WHATSAPP_URL;
export const FOOTER_SALES_PHONE_DISPLAY = '915 149 290';

export const FOOTER_SUPPORT_PHONE_DISPLAY = '965 805 873';
export const FOOTER_SUPPORT_PHONE_TEL = 'tel:+51965805873';

/** @deprecated Usar FOOTER_SALES_WHATSAPP_LINK */
export const FOOTER_WHATSAPP_LINK = FOOTER_SALES_WHATSAPP_LINK;

export const FOOTER_SALES_EMAIL = 'ventas@haitech.pe';
export const FOOTER_SUPPORT_EMAIL = 'servicioalcliente@haitech.pe';

export const FOOTER_RUC = DEFAULT_COMPANY_SETTINGS.ruc;

/** Solo URLs reales de marca; vacío si no hay perfiles verificados (evitar placeholders). */
export const FOOTER_SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string }> = [];

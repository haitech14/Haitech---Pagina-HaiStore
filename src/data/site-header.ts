import { Clock, Mail, Phone, Truck, type LucideIcon } from 'lucide-react';

import { FOOTER_WHATSAPP_LINK } from '@/data/site-footer';
import { buildHaitechWhatsAppUrl } from '@/lib/whatsapp-sales';

/** Contacto comercial (barra superior del header). */
export const HEADER_SALES_PHONE_DISPLAY = '915 149 290';
export const HEADER_SALES_PHONE_TEL = 'tel:+51915149290';
export const HEADER_SALES_EMAIL = 'ventas@haitech.pe';
export const HEADER_SALES_EMAIL_MAILTO = 'mailto:ventas@haitech.pe';
export const HEADER_BUSINESS_HOURS = 'Lun - Vie: 9:00 a.m. - 6:00 p.m.';

/** WhatsApp de asesoría comercial (barra superior). */
export const HEADER_ADVISOR_WHATSAPP_LINK = FOOTER_WHATSAPP_LINK;

export const HEADER_QUOTE_WHATSAPP_MESSAGE =
  'Hola, vengo desde HaiStore. Me gustaría cotizar un equipo o insumo.';
export const HEADER_QUOTE_WHATSAPP_LINK = buildHaitechWhatsAppUrl(HEADER_QUOTE_WHATSAPP_MESSAGE);
export const HEADER_QUOTE_WHATSAPP_LABEL = 'Cotizar por WhatsApp';

export const HEADER_FORUM_LABEL = 'Foro';
export const HEADER_FORUM_PATH = '/foro';

export interface HeaderUtilityItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
}

export const HEADER_UTILITY_LEFT_ITEMS: HeaderUtilityItem[] = [
  {
    id: 'telefono',
    label: HEADER_SALES_PHONE_DISPLAY,
    icon: Phone,
    href: HEADER_SALES_PHONE_TEL,
  },
  {
    id: 'email',
    label: HEADER_SALES_EMAIL,
    icon: Mail,
    href: HEADER_SALES_EMAIL_MAILTO,
  },
  {
    id: 'horario',
    label: HEADER_BUSINESS_HOURS,
    icon: Clock,
  },
];

export const HEADER_UTILITY_RIGHT_ITEMS: HeaderUtilityItem[] = [
  { id: 'envios', label: 'Envíos a nivel nacional', icon: Truck },
];

/** @deprecated Usar HEADER_UTILITY_LEFT_ITEMS / HEADER_UTILITY_RIGHT_ITEMS */
export const HEADER_UTILITY_ITEMS: HeaderUtilityItem[] = [
  ...HEADER_UTILITY_LEFT_ITEMS,
  ...HEADER_UTILITY_RIGHT_ITEMS,
];

export const HEADER_NAV_ADVISOR = {
  title: 'Asesoría especializada',
  subtitle: 'Encuentra la solución ideal para tu negocio',
  href: FOOTER_WHATSAPP_LINK,
} as const;

export const HEADER_ADVISOR_LABEL = 'Cotiza con un asesor';

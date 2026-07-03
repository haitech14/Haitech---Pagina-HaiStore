import { AppWindow, Building2, Calendar, Droplets, Mail, type LucideIcon } from 'lucide-react';

import { rentalCategories } from '@/data/rental-categories';
import { SOFTWARE_CATALOG_CATEGORIES } from '@/data/software-catalog';
import {
  FOOTER_ADDRESS,
  FOOTER_WHATSAPP_LINK,
} from '@/data/site-footer';
import {
  HEADER_FORUM_PATH,
  HEADER_SALES_EMAIL_MAILTO,
  HEADER_SALES_PHONE_TEL,
} from '@/data/site-header';
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

export type HeaderNavSubmenuItem = {
  label: string;
  href: string;
  external?: boolean;
};

export type HeaderNavSubmenuConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: HeaderNavSubmenuItem[];
  matchActive: (location: { pathname: string; search: string; hash: string }) => boolean;
};

const FOOTER_MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(FOOTER_ADDRESS)}`;

export const TONER_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'toner-repuestos',
  label: 'Tóner y Repuestos',
  icon: Droplets,
  matchActive: ({ pathname }) =>
    pathname.startsWith('/categoria/toner-suministros') ||
    pathname.startsWith('/categoria/repuestos'),
  items: [
    { label: 'Tóner y tintas', href: categoryLandingPath('toner-suministros') },
    { label: 'Tóner compatibles', href: categoryPath('toner-suministros', 'toner-compatibles') },
    { label: 'Tóner originales', href: categoryPath('toner-suministros', 'toner-originales') },
    { label: 'Repuestos', href: categoryLandingPath('repuestos') },
  ],
};

export const SOFTWARE_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'software',
  label: 'Software',
  icon: AppWindow,
  matchActive: ({ pathname }) =>
    pathname === '/software' || pathname.startsWith('/software/'),
  items: [
    { label: 'Ver catálogo de software', href: '/software' },
    ...SOFTWARE_CATALOG_CATEGORIES.map((category) => ({
      label: category.label,
      href: `/software?seccion=${category.id}`,
    })),
  ],
};

export const RENTALS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'alquileres',
  label: 'Alquileres',
  icon: Calendar,
  matchActive: ({ pathname, search }) => {
    if (pathname === '/alquiler') return true;
    if (pathname.startsWith('/categoria/alquiler')) return true;
    if (pathname !== '/servicios') return false;
    const seccion = new URLSearchParams(search).get('seccion');
    return !seccion || seccion === 'alquiler';
  },
  items: [
    { label: 'Alquiler de equipos', href: serviceHubPath('alquiler') },
    { label: 'Alquiler mensual', href: categoryLandingPath('alquiler') },
    ...rentalCategories.map((category) => ({
      label: category.title,
      href: categoryPath('alquiler', category.slug),
    })),
  ],
};

export const ABOUT_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'nosotros',
  label: 'Nosotros',
  icon: Building2,
  matchActive: ({ pathname, hash }) =>
    pathname === '/' &&
    (hash === '#clientes' ||
      hash === '#clientes-recomiendan-titulo' ||
      hash === '#faq-titulo'),
  items: [
    { label: 'Nuestros clientes', href: '/#clientes' },
    { label: 'Testimonios', href: '/#clientes-recomiendan-titulo' },
    { label: 'Preguntas frecuentes', href: '/#faq-titulo' },
    { label: 'Foro', href: HEADER_FORUM_PATH },
    { label: 'Descargas', href: '/descargas' },
  ],
};

export const CONTACT_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'contacto',
  label: 'Contacto',
  icon: Mail,
  matchActive: ({ pathname }) => pathname === '/contacto',
  items: [
    { label: 'Formulario de contacto', href: '/contacto' },
    { label: 'WhatsApp', href: FOOTER_WHATSAPP_LINK, external: true },
    { label: 'Ubicación', href: FOOTER_MAPS_LINK, external: true },
    { label: 'Teléfono de ventas', href: HEADER_SALES_PHONE_TEL },
    { label: 'Correo de ventas', href: HEADER_SALES_EMAIL_MAILTO },
  ],
};

export const HEADER_NAV_SUBMENUS: HeaderNavSubmenuConfig[] = [
  RENTALS_NAV_SUBMENU,
  TONER_NAV_SUBMENU,
  SOFTWARE_NAV_SUBMENU,
  ABOUT_NAV_SUBMENU,
  CONTACT_NAV_SUBMENU,
];

import {
  AppWindow,
  Building2,
  Calendar,
  Cog,
  Droplets,
  Package,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

import { SOFTWARE_CATALOG_CATEGORIES } from '@/data/software-catalog';
import { rentalCategories } from '@/data/rental-categories';
import {
  categoryLandingPath,
  categoryPath,
} from '@/lib/category-path';
import { serviceDetailPathFromLanding, serviceHubPath } from '@/lib/service-hub';

export type HeaderNavSubmenuHeadingItem = {
  kind: 'heading';
  label: string;
};

export type HeaderNavSubmenuInfoItem = {
  kind: 'info';
  label: string;
  value: string;
  href?: string;
  external?: boolean;
};

export type HeaderNavSubmenuLinkItem = {
  kind?: 'link';
  label: string;
  href: string;
  external?: boolean;
};

export type HeaderNavSubmenuItem =
  | HeaderNavSubmenuHeadingItem
  | HeaderNavSubmenuInfoItem
  | HeaderNavSubmenuLinkItem;

export function getHeaderNavSubmenuDefaultHref(items: HeaderNavSubmenuItem[]): string {
  for (const item of items) {
    if (item.kind === 'heading' || item.kind === 'info') continue;
    return item.href;
  }
  return '/contacto';
}

export type HeaderNavSubmenuConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: HeaderNavSubmenuItem[];
  matchActive: (location: { pathname: string; search: string; hash: string }) => boolean;
};

export const PRODUCTOS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'productos',
  label: 'Equipos',
  icon: Package,
  matchActive: ({ pathname }) =>
    (pathname.startsWith('/categoria') &&
      !pathname.startsWith('/categoria/software') &&
      !pathname.startsWith('/categoria/toner-suministros') &&
      !pathname.startsWith('/categoria/repuestos') &&
      !pathname.startsWith('/categoria/alquiler')) ||
    pathname.startsWith('/tienda') ||
    pathname.startsWith('/producto'),
  items: [
    { label: 'Fotocopiadoras', href: categoryLandingPath('multifuncionales') },
    { label: 'Impresoras', href: categoryLandingPath('impresoras') },
    { label: 'Formato ancho', href: categoryLandingPath('formato-ancho') },
    { label: 'Accesorios', href: categoryLandingPath('accesorios') },
  ],
};

export const ALQUILER_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'alquiler',
  label: 'Alquiler',
  icon: Calendar,
  matchActive: ({ pathname }) =>
    pathname.startsWith('/servicios/alquiler') ||
    pathname === '/alquiler' ||
    pathname.startsWith('/categoria/alquiler'),
  items: [
    { label: 'Ver alquiler', href: serviceHubPath('alquiler') },
    ...rentalCategories.map((category) => ({
      label: category.name,
      href: categoryPath('alquiler', category.slug),
    })),
  ],
};

export const TONER_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'toner-repuestos',
  label: 'Toner y Repuestos',
  icon: Droplets,
  matchActive: ({ pathname }) =>
    pathname.startsWith('/categoria/toner-suministros') ||
    pathname.startsWith('/categoria/repuestos'),
  items: [
    { kind: 'heading', label: 'Toner' },
    { label: 'Ver toner y suministros', href: categoryLandingPath('toner-suministros') },
    { label: 'Tóner originales', href: categoryPath('toner-suministros', 'toner-originales') },
    { label: 'Tóner compatibles', href: categoryPath('toner-suministros', 'toner-compatibles') },
    {
      label: 'Tóner remanufacturado',
      href: categoryPath('toner-suministros', 'toner-remanufacturado'),
    },
    { label: 'Recargas de tóner', href: categoryPath('toner-suministros', 'toner-recarga') },
    { kind: 'heading', label: 'Repuestos' },
    { label: 'Ver repuestos', href: categoryLandingPath('repuestos') },
    { label: 'Partes y componentes', href: categoryLandingPath('repuestos') },
  ],
};

/** @deprecated Usar TONER_NAV_SUBMENU */
export const CONSUMIBLES_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'consumibles',
  label: 'Consumibles',
  icon: Droplets,
  matchActive: ({ pathname }) => pathname.startsWith('/categoria/toner-suministros'),
  items: [
    { label: 'Ver consumibles', href: categoryLandingPath('toner-suministros') },
    { label: 'Tóner originales', href: categoryPath('toner-suministros', 'toner-originales') },
    { label: 'Tóner compatibles', href: categoryPath('toner-suministros', 'toner-compatibles') },
    {
      label: 'Tóner remanufacturado',
      href: categoryPath('toner-suministros', 'toner-remanufacturado'),
    },
    { label: 'Recargas de tóner', href: categoryPath('toner-suministros', 'toner-recarga') },
  ],
};

/** @deprecated Usar TONER_NAV_SUBMENU */
export const REPUESTOS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'repuestos',
  label: 'Repuestos',
  icon: Cog,
  matchActive: ({ pathname }) => pathname.startsWith('/categoria/repuestos'),
  items: [
    { label: 'Ver repuestos', href: categoryLandingPath('repuestos') },
    { label: 'Partes y componentes', href: categoryLandingPath('repuestos') },
  ],
};

export const SERVICIOS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'servicios',
  label: 'Servicios',
  icon: Wrench,
  matchActive: ({ pathname }) =>
    pathname.startsWith('/servicios') ||
    pathname === '/alquiler' ||
    pathname.startsWith('/categoria/alquiler'),
  items: [
    { label: 'Ver todos los servicios', href: '/servicios' },
    { kind: 'heading', label: 'Alquiler' },
    { label: 'Ver alquiler', href: serviceHubPath('alquiler') },
    ...rentalCategories.map((category) => ({
      label: category.name,
      href: categoryPath('alquiler', category.slug),
    })),
    { kind: 'heading', label: 'Soporte' },
    { label: 'Soporte técnico', href: serviceHubPath('servicio-tecnico') },
    {
      label: 'Mantenimiento',
      href: serviceDetailPathFromLanding('servicio-tecnico', 'preventivo'),
    },
    {
      label: 'Instalación',
      href: serviceDetailPathFromLanding('servicio-tecnico', 'instalacion-config-capacitacion'),
    },
  ],
};

export const EMPRESAS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'empresas',
  label: 'Empresas',
  icon: Building2,
  matchActive: ({ pathname, hash }) =>
    pathname === '/contacto' ||
    pathname === '/preguntas-frecuentes' ||
    pathname === '/por-que-comprar-con-nosotros' ||
    (pathname === '/' && (hash === '#clientes' || hash === '#testimonios')),
  items: [
    { label: 'Nosotros', href: '/contacto' },
    { label: 'Por qué comprar con nosotros', href: '/por-que-comprar-con-nosotros' },
    { label: 'Clientes', href: '/#clientes' },
    { label: 'Testimonios', href: '/#testimonios' },
    { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
  ],
};

export const SOFTWARE_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'software',
  label: 'Soluciones',
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

/** @deprecated Usar ALQUILER_NAV_SUBMENU */
export const RENTALS_NAV_SUBMENU = ALQUILER_NAV_SUBMENU;

export const HEADER_NAV_SUBMENUS: HeaderNavSubmenuConfig[] = [
  PRODUCTOS_NAV_SUBMENU,
  TONER_NAV_SUBMENU,
  SERVICIOS_NAV_SUBMENU,
  SOFTWARE_NAV_SUBMENU,
];

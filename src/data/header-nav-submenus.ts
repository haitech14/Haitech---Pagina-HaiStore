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
import { categoryLandingPath, categoryPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';
import { storeShowcaseCategoryFromPathname, storeShowcasePath } from '@/lib/store-showcase-path';

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
  matchActive: ({ pathname, search }) => {
    const vitrinaSlug = storeShowcaseCategoryFromPathname(pathname);
    if (vitrinaSlug && vitrinaSlug !== 'toner' && vitrinaSlug !== 'repuestos') return true;
    if (
      pathname === '/tienda' &&
      search.includes('vitrina=') &&
      !search.includes('vitrina=toner') &&
      !search.includes('vitrina=repuestos')
    ) {
      return true;
    }
    if (pathname.startsWith('/producto')) return true;
    return (
      pathname.startsWith('/categoria') &&
      !pathname.startsWith('/categoria/software') &&
      !pathname.startsWith('/categoria/toner-suministros') &&
      !pathname.startsWith('/categoria/repuestos') &&
      !pathname.startsWith('/categoria/alquiler')
    );
  },
  items: [
    { label: 'Multifuncionales', href: storeShowcasePath({ categoryId: 'multifuncionales' }) },
    { label: 'Impresoras', href: storeShowcasePath({ categoryId: 'impresoras' }) },
    { label: 'Formato ancho', href: storeShowcasePath({ categoryId: 'formato-ancho' }) },
    { label: 'Accesorios', href: storeShowcasePath({ categoryId: 'accesorios' }) },
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
  id: 'consumibles',
  label: 'Consumibles',
  icon: Droplets,
  matchActive: ({ pathname, search }) =>
    storeShowcaseCategoryFromPathname(pathname) === 'toner' ||
    storeShowcaseCategoryFromPathname(pathname) === 'repuestos' ||
    (pathname === '/tienda' &&
      (search.includes('vitrina=toner') ||
        search.includes('vitrina=repuestos') ||
        search.includes('vitrina=toner-repuestos'))) ||
    pathname.startsWith('/categoria/toner-suministros') ||
    pathname.startsWith('/categoria/repuestos'),
  items: [
    { kind: 'heading', label: 'Tóner' },
    {
      label: 'Ver tóner',
      href: storeShowcasePath({ categoryId: 'toner' }),
    },
    {
      label: 'Tóner originales',
      href: storeShowcasePath({
        categoryId: 'toner',
        filter: 'originales',
      }),
    },
    {
      label: 'Tóner compatibles',
      href: storeShowcasePath({
        categoryId: 'toner',
        filter: 'compatibles',
      }),
    },
    {
      label: 'Tóner remanufacturado',
      href: storeShowcasePath({
        categoryId: 'toner',
        filter: 'remanufacturados',
      }),
    },
    { kind: 'heading', label: 'Repuestos' },
    {
      label: 'Ver repuestos',
      href: storeShowcasePath({ categoryId: 'repuestos' }),
    },
    {
      label: 'Partes y componentes',
      href: storeShowcasePath({ categoryId: 'repuestos' }),
    },
  ],
};

export const CONSUMIBLES_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'consumibles',
  label: 'Consumibles',
  icon: Droplets,
  matchActive: TONER_NAV_SUBMENU.matchActive,
  items: TONER_NAV_SUBMENU.items,
};

/** @deprecated Usar TONER_NAV_SUBMENU / CONSUMIBLES_NAV_SUBMENU */
export const REPUESTOS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'repuestos',
  label: 'Repuestos',
  icon: Cog,
  matchActive: ({ pathname }) =>
    storeShowcaseCategoryFromPathname(pathname) === 'repuestos' ||
    pathname.startsWith('/categoria/repuestos'),
  items: [
    {
      label: 'Ver repuestos',
      href: storeShowcasePath({ categoryId: 'repuestos' }),
    },
    {
      label: 'Partes y componentes',
      href: storeShowcasePath({ categoryId: 'repuestos' }),
    },
  ],
};

export const SERVICIOS_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'servicios',
  label: 'Alquiler',
  icon: Wrench,
  matchActive: ({ pathname, search }) =>
    pathname.startsWith('/servicios') ||
    pathname === '/alquiler' ||
    pathname.startsWith('/categoria/alquiler') ||
    (pathname === '/contacto' && search.includes('tema=leasing')),
  items: [
    { kind: 'heading', label: 'Alquiler' },
    { label: 'Ver alquiler', href: serviceHubPath('alquiler') },
    ...rentalCategories.map((category) => ({
      label: category.name,
      href: categoryPath('alquiler', category.slug),
    })),
    { kind: 'heading', label: 'Leasing' },
    { label: 'Cotizar leasing', href: '/contacto?tema=leasing' },
    { kind: 'heading', label: 'Outsourcing' },
    { label: 'Ver outsourcing', href: serviceHubPath('outsourcing') },
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
    pathname === '/sobre-nosotros' ||
    pathname === '/distribuidor-autorizado-ricoh' ||
    pathname === '/fotocopiadoras-peru' ||
    pathname === '/fotocopiadoras-ricoh' ||
    pathname === '/alquiler-fotocopiadoras-lima' ||
    pathname === '/toner-ricoh' ||
    pathname === '/privacidad' ||
    pathname === '/descargas' ||
    pathname === '/software' ||
    pathname === '/haiprotect' ||
    pathname === '/foro' ||
    pathname === '/terminos' ||
    pathname === '/guias' ||
    pathname.startsWith('/guias/') ||
    pathname === '/modelos' ||
    pathname.startsWith('/modelos/') ||
    (pathname === '/' && (hash === '#clientes' || hash === '#testimonios')),
  items: [
    { label: 'Sobre Nosotros', href: '/sobre-nosotros' },
    { label: 'Distribuidor Autorizado Ricoh', href: '/distribuidor-autorizado-ricoh' },
    { label: 'Fotocopiadoras Perú', href: '/fotocopiadoras-peru' },
    { label: 'Fotocopiadoras Ricoh', href: '/fotocopiadoras-ricoh' },
    { label: 'Multifuncionales', href: categoryLandingPath('multifuncionales') },
    { label: 'Tóner', href: '/toner-ricoh' },
    { label: 'Repuestos', href: categoryLandingPath('repuestos') },
    { label: 'Alquiler', href: '/alquiler-fotocopiadoras-lima' },
    { label: 'Servicio técnico', href: serviceHubPath('servicio-tecnico') },
    { label: 'Preguntas frecuentes', href: '/preguntas-frecuentes' },
    { label: 'Contacto', href: '/contacto' },
    { label: 'Guías', href: '/guias' },
    { label: 'Modelos', href: '/modelos' },
    { label: 'Políticas', href: '/privacidad' },
    { label: 'Descargas', href: '/descargas' },
    { label: 'Software', href: '/software' },
    { label: 'HaiProtect', href: '/haiprotect' },
    { label: 'Foro', href: '/foro' },
    { label: 'Términos', href: '/terminos' },
    { label: 'Por qué comprar', href: '/por-que-comprar-con-nosotros' },
    { label: 'Outsourcing', href: serviceHubPath('outsourcing') },
    { label: 'Accesorios', href: categoryLandingPath('accesorios') },
    { label: 'Formato ancho', href: categoryLandingPath('formato-ancho') },
    { label: 'Escáneres', href: categoryLandingPath('escaneres') },
    { label: 'Clientes', href: '/#clientes' },
    { label: 'Testimonios', href: '/#testimonios' },
  ],
};

export const SOFTWARE_NAV_SUBMENU: HeaderNavSubmenuConfig = {
  id: 'software',
  label: 'Soluciones',
  icon: AppWindow,
  matchActive: ({ pathname }) =>
    pathname === '/software' || pathname.startsWith('/software/'),
  items: [
    { label: 'Software', href: '/software' },
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

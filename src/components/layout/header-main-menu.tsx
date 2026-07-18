import { NavLink, useLocation } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { categoryLandingPath } from '@/lib/category-path';
import { cn } from '@/lib/utils';
import { serviceHubPath } from '@/lib/service-hub';

export type HeaderMainNavLink = {
  id: string;
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string; hash: string }) => boolean;
};

function MockupNavLink({
  item,
  linkClassName,
}: {
  item: HeaderMainNavLink;
  linkClassName: (isActive: boolean) => string;
}) {
  const location = useLocation();

  return (
    <NavLink
      to={item.to}
      end={item.end ?? false}
      className={({ isActive }) =>
        linkClassName(item.matchActive ? item.matchActive(location) : isActive)
      }
    >
      {item.label}
    </NavLink>
  );
}

/** Enlaces comerciales de la cabecera (compra + alquiler + servicio). */
const STORE_HEADER_LINKS: HeaderMainNavLink[] = [
  {
    id: 'fotocopiadoras',
    to: categoryLandingPath('multifuncionales'),
    label: 'Fotocopiadoras',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/multifuncionales'),
  },
  {
    id: 'impresoras',
    to: categoryLandingPath('impresoras'),
    label: 'Impresoras',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/impresoras'),
  },
  {
    id: 'suministros',
    to: categoryLandingPath('toner-suministros'),
    label: 'Suministros',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/toner-suministros'),
  },
  {
    id: 'escaneres',
    to: categoryLandingPath('escaneres'),
    label: 'Escáneres',
    matchActive: ({ pathname }) => pathname.startsWith('/categoria/escaneres'),
  },
  {
    id: 'ofertas',
    to: '/#promociones',
    label: 'Ofertas',
    matchActive: ({ pathname, hash }) => pathname === '/' && hash === '#promociones',
  },
  {
    id: 'alquiler',
    to: serviceHubPath('alquiler'),
    label: 'Alquiler',
    matchActive: ({ pathname, search }) =>
      pathname.startsWith('/servicios') && search.includes('seccion=alquiler'),
  },
  {
    id: 'servicio-tecnico',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicio técnico',
    matchActive: ({ pathname, search }) =>
      pathname.startsWith('/servicios') && search.includes('seccion=servicio-tecnico'),
  },
];

/**
 * Menú comercial de la tienda.
 * Orden: Categorías · Fotocopiadoras · Impresoras · Suministros · Escáneres · Ofertas · Alquiler · Servicio técnico
 */
export function HeaderMainMenu({
  linkClassName,
  className,
  menuVariant = 'default',
  menuDensity = 'default',
  showIcons = true,
  showCategories = true,
}: {
  linkClassName: (isActive: boolean) => string;
  className?: string;
  menuVariant?: 'default' | 'secondary' | 'light';
  menuDensity?: 'default' | 'compact';
  showIcons?: boolean;
  /** Si false, Categorías va aparte (p. ej. a la izquierda del buscador). */
  showCategories?: boolean;
}) {
  const dropdownVariant =
    menuVariant === 'light' && menuDensity === 'compact'
      ? 'light-compact'
      : menuVariant === 'light'
        ? 'light'
        : menuVariant === 'secondary'
          ? 'secondary'
          : 'default';

  return (
    <ul
      className={cn(
        'flex min-w-0 items-center',
        menuDensity === 'compact'
          ? 'gap-1.5 lg:gap-2'
          : showIcons
            ? 'gap-2.5 lg:gap-3'
            : 'gap-2.5 lg:gap-3.5',
        className,
      )}
    >
      {showCategories ? (
        <li className="shrink-0">
          <CategoriesMegaMenu
            navRow={dropdownVariant}
            showIcon={showIcons}
            triggerVariant={menuVariant === 'light' ? 'categories-button' : 'nav'}
            label="Categorías"
          />
        </li>
      ) : null}
      {STORE_HEADER_LINKS.map((item) => (
        <li key={item.id} className="shrink-0">
          <MockupNavLink item={item} linkClassName={linkClassName} />
        </li>
      ))}
    </ul>
  );
}

export { MockupNavLink, STORE_HEADER_LINKS };

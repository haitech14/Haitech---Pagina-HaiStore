import { NavLink, useLocation } from 'react-router-dom';

import { DeferredCategoriesMegaMenu } from '@/components/layout/deferred-categories-mega-menu';
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

/** Enlaces principales de la cabecera. */
const STORE_HEADER_LINKS: HeaderMainNavLink[] = [
  {
    id: 'inicio',
    to: '/',
    label: 'Inicio',
    end: true,
  },
  {
    id: 'catalogo',
    to: '/tienda',
    label: 'Catálogo',
    matchActive: ({ pathname }) =>
      pathname === '/tienda' ||
      pathname.startsWith('/tienda/') ||
      pathname.startsWith('/categoria/'),
  },
  {
    id: 'servicio-tecnico',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicio Técnico',
    matchActive: ({ pathname, search }) =>
      pathname.startsWith('/servicios') && search.includes('seccion=servicio-tecnico'),
  },
  {
    id: 'nosotros',
    to: '/sobre-nosotros',
    label: 'Nosotros',
    matchActive: ({ pathname }) =>
      pathname.startsWith('/sobre-nosotros') ||
      pathname.startsWith('/distribuidor-autorizado-ricoh') ||
      pathname.startsWith('/por-que-comprar-con-nosotros'),
  },
];

/**
 * Menú principal de la tienda.
 * Orden: Inicio · Catálogo · Servicio Técnico · Nosotros
 */
export function HeaderMainMenu({
  linkClassName,
  className,
  menuVariant = 'default',
  menuDensity = 'default',
  showIcons = true,
  showCategories = false,
}: {
  linkClassName: (isActive: boolean) => string;
  className?: string;
  menuVariant?: 'default' | 'secondary' | 'light';
  menuDensity?: 'default' | 'compact';
  showIcons?: boolean;
  /** Mega menú Categorías (desactivado por defecto). */
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

  const categoriesButton = menuVariant === 'light';

  return (
    <ul
      className={cn(
        'flex min-w-0',
        categoriesButton ? 'items-stretch' : 'items-center',
        menuDensity === 'compact'
          ? 'gap-1.5 lg:gap-2'
          : showIcons
            ? 'gap-2.5 lg:gap-3'
            : 'gap-2.5 lg:gap-3.5',
        className,
      )}
    >
      {showCategories ? (
        <li className={cn('shrink-0', categoriesButton && 'flex self-stretch')}>
          <DeferredCategoriesMegaMenu
            navRow={dropdownVariant}
            showIcon={showIcons}
            triggerVariant={categoriesButton ? 'categories-button' : 'nav'}
            label="Categorías"
          />
        </li>
      ) : null}
      {STORE_HEADER_LINKS.map((item) => (
        <li
          key={item.id}
          className={cn('shrink-0', categoriesButton && 'flex items-center')}
        >
          <MockupNavLink item={item} linkClassName={linkClassName} />
        </li>
      ))}
    </ul>
  );
}

export { MockupNavLink, STORE_HEADER_LINKS };

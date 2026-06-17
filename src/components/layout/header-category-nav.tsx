import { NavLink } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { SolutionsMegaMenu } from '@/components/layout/solutions-mega-menu';
import { mainNavLinkClass, MAIN_NAV_BAR_CLASS, MAIN_NAV_ROW_CLASS } from '@/components/layout/main-nav-styles';
import { categoryLandingPath } from '@/lib/category-path';
import { serviceHubPath } from '@/lib/service-hub';

type MainNavItem =
  | {
      kind: 'link';
      to: string;
      label: string;
      end?: boolean;
      matchActive?: (location: { pathname: string; search: string }) => boolean;
    }
  | { kind: 'productos' }
  | { kind: 'soluciones' };

const mainNavItems: MainNavItem[] = [
  { kind: 'productos' },
  { kind: 'soluciones' },
  {
    kind: 'link',
    to: '/servicios',
    label: 'Servicios',
    matchActive: ({ pathname }) => pathname === '/servicios',
  },
  {
    kind: 'link',
    to: categoryLandingPath('soluciones-negocio'),
    label: 'Industrias',
    matchActive: ({ pathname }) => pathname === categoryLandingPath('soluciones-negocio'),
  },
  {
    kind: 'link',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Soporte',
    matchActive: ({ pathname, search }) => {
      if (pathname !== '/servicios') return false;
      const seccion = new URLSearchParams(search).get('seccion');
      return seccion === 'servicio-tecnico';
    },
  },
  {
    kind: 'link',
    to: '/contacto',
    label: 'Contacto',
    end: true,
    matchActive: ({ pathname }) => pathname === '/contacto',
  },
];

export function HeaderCategoryNav() {
  return (
    <nav aria-label="Menú principal" className={MAIN_NAV_BAR_CLASS}>
      <div className={MAIN_NAV_ROW_CLASS}>
        <ul className="flex min-w-0 flex-1 items-stretch gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
          {mainNavItems.map((item) => {
            if (item.kind === 'productos') {
              return (
                <li key="productos" className="shrink-0">
                  <CategoriesMegaMenu triggerVariant="nav" />
                </li>
              );
            }

            if (item.kind === 'soluciones') {
              return (
                <li key="soluciones" className="shrink-0">
                  <SolutionsMegaMenu />
                </li>
              );
            }

            const linkProps = item.matchActive
              ? {
                  to: item.to,
                  end: item.end ?? false,
                  isActive: (_match: unknown, location: { pathname: string; search: string }) =>
                    item.matchActive!(location),
                }
              : { to: item.to, end: item.end ?? false };

            return (
              <li key={item.to} className="shrink-0">
                <NavLink
                  {...linkProps}
                  className={({ isActive }) => mainNavLinkClass(isActive)}
                >
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export { mainNavItems };

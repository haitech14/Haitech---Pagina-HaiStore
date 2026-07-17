import { NavLink, useLocation } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { SoftwareNavMegaMenu } from '@/components/layout/software-nav-mega-menu';
import { cn } from '@/lib/utils';

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

/** Enlaces principales del mockup. */
export function HeaderMainMenu({
  linkClassName,
  className,
  menuVariant = 'default',
  menuDensity = 'default',
  showIcons = true,
}: {
  linkClassName: (isActive: boolean) => string;
  className?: string;
  menuVariant?: 'default' | 'secondary' | 'light';
  menuDensity?: 'default' | 'compact';
  showIcons?: boolean;
}) {
  const dropdownVariant =
    menuVariant === 'light' && menuDensity === 'compact'
      ? 'light-compact'
      : menuVariant === 'light'
        ? 'light'
        : menuVariant === 'secondary'
          ? 'secondary'
          : 'default';

  const links: HeaderMainNavLink[] = [
    {
      id: 'inicio',
      to: '/',
      label: 'Inicio',
      end: true,
      matchActive: ({ pathname, hash }) => pathname === '/' && hash !== '#promociones',
    },
    {
      id: 'servicio-tecnico',
      to: '/servicios?seccion=servicio-tecnico',
      label: 'Servicio técnico',
      matchActive: ({ pathname, search }) =>
        pathname === '/servicios' && search.includes('seccion=servicio-tecnico'),
    },
    {
      id: 'alquiler',
      to: '/servicios?seccion=alquiler',
      label: 'Alquiler',
      matchActive: ({ pathname, search }) =>
        pathname === '/servicios' && search.includes('seccion=alquiler'),
    },
    {
      id: 'ofertas',
      to: '/#promociones',
      label: 'Ofertas',
      matchActive: ({ pathname, hash }) => pathname === '/' && hash === '#promociones',
    },
    {
      id: 'contacto',
      to: '/contacto',
      label: 'Contacto',
    },
  ];

  return (
    <ul
      className={cn(
        'flex min-w-0 items-center',
        menuDensity === 'compact' ? 'gap-1.5 lg:gap-2' : showIcons ? 'gap-3 lg:gap-3.5 xl:gap-4' : 'gap-6 lg:gap-7 xl:gap-9',
        className,
      )}
    >
      <li className="shrink-0">
        <MockupNavLink item={links[0]!} linkClassName={linkClassName} />
      </li>
      <li className="shrink-0">
        <CategoriesMegaMenu
          navRow={dropdownVariant}
          showIcon={showIcons}
          triggerVariant="nav"
          label="Productos"
        />
      </li>
      <li className="shrink-0">
        <SoftwareNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <MockupNavLink item={links[1]!} linkClassName={linkClassName} />
      </li>
      <li className="shrink-0">
        <MockupNavLink item={links[2]!} linkClassName={linkClassName} />
      </li>
      <li className="relative shrink-0">
        <MockupNavLink item={links[3]!} linkClassName={linkClassName} />
        <span
          className="absolute -right-1.5 top-0 size-1.5 rounded-full bg-lime-400"
          aria-hidden="true"
        />
      </li>
      <li className="shrink-0">
        <MockupNavLink item={links[4]!} linkClassName={linkClassName} />
      </li>
    </ul>
  );
}

export { MockupNavLink };

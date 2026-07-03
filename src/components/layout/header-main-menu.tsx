import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Building2 } from 'lucide-react';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { HeaderNavDropdown } from '@/components/layout/header-nav-dropdown';
import {
  MAIN_NAV_ICON_CLASS,
  MAIN_NAV_ICON_COMPACT_CLASS,
  darkNavLinkClass,
} from '@/components/layout/main-nav-styles';
import { RentalsNavMegaMenu } from '@/components/layout/rentals-nav-mega-menu';
import { ServicesNavMegaMenu } from '@/components/layout/services-nav-mega-menu';
import { TonerNavMegaMenu } from '@/components/layout/toner-nav-mega-menu';
import {
  ABOUT_NAV_SUBMENU,
  CONTACT_NAV_SUBMENU,
  SOFTWARE_NAV_SUBMENU,
} from '@/data/header-nav-submenus';
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

function HeaderNavIconLink({
  to,
  label,
  icon: Icon,
  matchActive,
  linkClassName = darkNavLinkClass,
  iconClassName = MAIN_NAV_ICON_CLASS,
  showIcon = true,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
  matchActive?: (location: { pathname: string; search: string; hash: string }) => boolean;
  linkClassName?: (isActive: boolean) => string;
  iconClassName?: string;
  showIcon?: boolean;
}) {
  const location = useLocation();
  const isActive = matchActive ? matchActive(location) : false;

  return (
    <NavLink to={to} className={linkClassName(isActive)}>
      {showIcon ? <Icon className={iconClassName} strokeWidth={1.75} aria-hidden="true" /> : null}
      {label}
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
  const iconClassName =
    menuVariant === 'light' && menuDensity === 'compact'
      ? MAIN_NAV_ICON_COMPACT_CLASS
      : MAIN_NAV_ICON_CLASS;

  return (
    <ul
      className={cn(
        'flex min-w-0 items-center',
        menuDensity === 'compact' ? 'gap-1.5 lg:gap-2' : showIcons ? 'gap-3 lg:gap-3.5 xl:gap-4' : 'gap-6 lg:gap-7 xl:gap-9',
        className,
      )}
    >
      <li className="shrink-0">
        <CategoriesMegaMenu triggerVariant="nav" navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <ServicesNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <RentalsNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <TonerNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <HeaderNavDropdown config={SOFTWARE_NAV_SUBMENU} navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <HeaderNavIconLink
          to="/#clientes"
          label="Nosotros"
          icon={Building2}
          matchActive={ABOUT_NAV_SUBMENU.matchActive}
          linkClassName={linkClassName}
          iconClassName={iconClassName}
          showIcon={showIcons}
        />
      </li>
      <li className="shrink-0">
        <HeaderNavDropdown config={CONTACT_NAV_SUBMENU} navRow={dropdownVariant} showIcon={showIcons} />
      </li>
    </ul>
  );
}

export { MockupNavLink };

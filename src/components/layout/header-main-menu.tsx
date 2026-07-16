import { NavLink, useLocation } from 'react-router-dom';

import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { ServicesNavMegaMenu } from '@/components/layout/services-nav-mega-menu';
import { SoftwareNavMegaMenu } from '@/components/layout/software-nav-mega-menu';
import { TonerNavMegaMenu } from '@/components/layout/toner-nav-mega-menu';
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

  return (
    <ul
      className={cn(
        'flex min-w-0 items-center',
        menuDensity === 'compact' ? 'gap-1.5 lg:gap-2' : showIcons ? 'gap-3 lg:gap-3.5 xl:gap-4' : 'gap-6 lg:gap-7 xl:gap-9',
        className,
      )}
    >
      <li className="shrink-0">
        <CategoriesMegaMenu navRow={dropdownVariant} showIcon={showIcons} triggerVariant="nav" />
      </li>
      <li className="shrink-0">
        <TonerNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <ServicesNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
      <li className="shrink-0">
        <SoftwareNavMegaMenu navRow={dropdownVariant} showIcon={showIcons} />
      </li>
    </ul>
  );
}

export { MockupNavLink };

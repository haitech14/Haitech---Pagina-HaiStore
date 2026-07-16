import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { SOFTWARE_NAV_SUBMENU } from '@/data/header-nav-submenus';
import {
  buildSoftwareNavMegaMenu,
  SOFTWARE_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function SoftwareNavMegaMenu({
  navRow = 'default',
  showIcon = true,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
}) {
  const location = useLocation();
  const menu = useMemo(() => buildSoftwareNavMegaMenu(), []);
  const isRouteActive = SOFTWARE_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label={SOFTWARE_NAV_SUBMENU.label}
      icon={SOFTWARE_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
    />
  );
}

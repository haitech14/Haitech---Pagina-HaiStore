import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { ALQUILER_NAV_SUBMENU } from '@/data/header-nav-submenus';
import {
  buildRentalsNavMegaMenu,
  RENTALS_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function RentalsNavMegaMenu({
  navRow = 'default',
  showIcon = true,
  label = 'Alquiler',
  triggerHref,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact' | 'haitech-black' | 'haitech-white';
  showIcon?: boolean;
  label?: string;
  triggerHref?: string;
}) {
  const location = useLocation();
  const menu = useMemo(() => buildRentalsNavMegaMenu(), []);
  const isRouteActive = ALQUILER_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label={label}
      icon={RENTALS_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
      {...(triggerHref ? { triggerHref } : {})}
      {...(navRow === 'haitech-black' || navRow === 'haitech-white'
        ? { mockupMenuKind: 'alquiler' as const }
        : {})}
    />
  );
}

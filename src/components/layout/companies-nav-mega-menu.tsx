import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { EMPRESAS_NAV_SUBMENU } from '@/data/header-nav-submenus';
import {
  buildCompaniesNavMegaMenu,
  COMPANIES_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function CompaniesNavMegaMenu({
  navRow = 'default',
  showIcon = true,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
}) {
  const location = useLocation();
  const menu = useMemo(() => buildCompaniesNavMegaMenu(), []);
  const isRouteActive = EMPRESAS_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label="Empresas"
      icon={COMPANIES_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
    />
  );
}

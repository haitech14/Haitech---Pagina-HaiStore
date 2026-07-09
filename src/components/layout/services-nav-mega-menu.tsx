import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { SERVICIOS_NAV_SUBMENU } from '@/data/header-nav-submenus';
import { buildServicesNavMegaMenu } from '@/lib/nav-mega-menu-builders';

export function ServicesNavMegaMenu({
  navRow = 'default',
  showIcon = true,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
}) {
  const location = useLocation();
  const menu = useMemo(() => buildServicesNavMegaMenu(), []);
  const isRouteActive = SERVICIOS_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label="Servicios"
      icon={Wrench}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
    />
  );
}

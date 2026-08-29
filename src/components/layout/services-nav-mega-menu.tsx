import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { SERVICIOS_NAV_SUBMENU } from '@/data/header-nav-submenus';
import { buildServicesNavMegaMenu } from '@/lib/nav-mega-menu-builders';

export function ServicesNavMegaMenu({
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
  const menu = useMemo(() => buildServicesNavMegaMenu(), []);
  const isRouteActive = SERVICIOS_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label={label}
      icon={Wrench}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
      {...(triggerHref ? { triggerHref } : {})}
      {...(navRow === 'haitech-black' || navRow === 'haitech-white'
        ? { mockupMenuKind: 'servicios' as const }
        : {})}
    />
  );
}

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Headphones } from 'lucide-react';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { buildServicesNavMegaMenu } from '@/lib/nav-mega-menu-builders';

export function ServicioTecnicoNavMegaMenu({
  navRow = 'default',
  showIcon = true,
  label = 'Servicio Técnico',
  triggerHref,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact' | 'haitech-black' | 'haitech-white';
  showIcon?: boolean;
  label?: string;
  triggerHref?: string;
}) {
  const location = useLocation();
  const menu = useMemo(() => buildServicesNavMegaMenu(), []);
  const isRouteActive =
    location.pathname.startsWith('/servicios') &&
    location.search.includes('seccion=servicio-tecnico');

  return (
    <StaticNavMegaMenu
      label={label}
      icon={Headphones}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
      {...(triggerHref ? { triggerHref } : {})}
      {...(navRow === 'haitech-black' || navRow === 'haitech-white'
        ? { mockupMenuKind: 'servicio-tecnico' as const }
        : {})}
    />
  );
}

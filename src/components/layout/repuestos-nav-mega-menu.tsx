import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { REPUESTOS_NAV_SUBMENU } from '@/data/header-nav-submenus';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import {
  buildRepuestosNavMegaMenu,
  buildRepuestosNavMegaMenuStatic,
  REPUESTOS_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function RepuestosNavMegaMenu({
  navRow = 'default',
  showIcon = true,
  label = 'Repuestos',
  triggerHref,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact' | 'haitech-black' | 'haitech-white';
  showIcon?: boolean;
  label?: string;
  triggerHref?: string;
}) {
  const location = useLocation();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(
    () =>
      categoryTree.length > 0
        ? buildRepuestosNavMegaMenu(categoryTree)
        : buildRepuestosNavMegaMenuStatic(),
    [categoryTree],
  );
  const isRouteActive = REPUESTOS_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label={label}
      icon={REPUESTOS_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
      {...(triggerHref ? { triggerHref } : {})}
      {...(navRow === 'haitech-black' || navRow === 'haitech-white'
        ? { mockupMenuKind: 'repuestos' as const }
        : {})}
    />
  );
}

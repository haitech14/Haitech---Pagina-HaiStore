import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { TONER_NAV_SUBMENU } from '@/data/header-nav-submenus';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import {
  buildTonerRepuestosNavMegaMenu,
  buildTonerRepuestosNavMegaMenuStatic,
  TONER_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function TonerNavMegaMenu({
  navRow = 'default',
  showIcon = true,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
}) {
  const location = useLocation();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(
    () =>
      categoryTree.length > 0
        ? buildTonerRepuestosNavMegaMenu(categoryTree)
        : buildTonerRepuestosNavMegaMenuStatic(),
    [categoryTree],
  );
  const isRouteActive = TONER_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label="Tóner y Repuestos"
      icon={TONER_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
    />
  );
}

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { StaticNavMegaMenu } from '@/components/layout/static-nav-mega-menu';
import { CONSUMIBLES_NAV_SUBMENU } from '@/data/header-nav-submenus';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import {
  buildConsumiblesNavMegaMenu,
  buildConsumiblesNavMegaMenuStatic,
  CONSUMABLES_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function ConsumiblesNavMegaMenu({
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
        ? buildConsumiblesNavMegaMenu(categoryTree)
        : buildConsumiblesNavMegaMenuStatic(),
    [categoryTree],
  );
  const isRouteActive = CONSUMIBLES_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label="Consumibles"
      icon={CONSUMABLES_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
    />
  );
}

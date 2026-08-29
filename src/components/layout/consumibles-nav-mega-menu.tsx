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
  label = 'Tóner y Consumibles',
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
        ? buildConsumiblesNavMegaMenu(categoryTree)
        : buildConsumiblesNavMegaMenuStatic(),
    [categoryTree],
  );
  const isRouteActive = CONSUMIBLES_NAV_SUBMENU.matchActive(location);

  return (
    <StaticNavMegaMenu
      label={label}
      icon={CONSUMABLES_NAV_MEGA_MENU_ICON}
      menu={menu}
      isRouteActive={isRouteActive}
      navRow={navRow}
      showIcon={showIcon}
      {...(triggerHref ? { triggerHref } : {})}
      {...(navRow === 'haitech-black' || navRow === 'haitech-white'
        ? { mockupMenuKind: 'toner' as const }
        : {})}
    />
  );
}

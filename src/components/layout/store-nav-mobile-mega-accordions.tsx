import { useMemo } from 'react';

import { StaticNavMobileAccordion } from '@/components/layout/static-nav-mobile-accordion';
import {
  ALQUILER_NAV_SUBMENU,
  CONSUMIBLES_NAV_SUBMENU,
  PRODUCTOS_NAV_SUBMENU,
  REPUESTOS_NAV_SUBMENU,
  SERVICIOS_NAV_SUBMENU,
  SOFTWARE_NAV_SUBMENU,
} from '@/data/header-nav-submenus';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildProductosNavMegaMenu } from '@/lib/mega-menu-from-store-categories';
import {
  buildConsumiblesNavMegaMenu,
  buildConsumiblesNavMegaMenuStatic,
  buildRentalsNavMegaMenu,
  buildRepuestosNavMegaMenu,
  buildRepuestosNavMegaMenuStatic,
  buildServicesNavMegaMenu,
  buildSoftwareNavMegaMenu,
  CONSUMABLES_NAV_MEGA_MENU_ICON,
  RENTALS_NAV_MEGA_MENU_ICON,
  REPUESTOS_NAV_MEGA_MENU_ICON,
  SOFTWARE_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

function ProductosNavMobileAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildProductosNavMegaMenu(categoryTree), [categoryTree]);

  return (
    <StaticNavMobileAccordion
      label={PRODUCTOS_NAV_SUBMENU.label}
      icon={PRODUCTOS_NAV_SUBMENU.icon}
      menu={menu}
      {...(onNavigate ? { onNavigate } : {})}
    />
  );
}

export function StoreNavMobileMegaAccordions({ onNavigate }: { onNavigate?: () => void }) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const rentalsMenu = useMemo(() => buildRentalsNavMegaMenu(), []);
  const consumiblesMenu = useMemo(
    () =>
      categoryTree.length > 0
        ? buildConsumiblesNavMegaMenu(categoryTree)
        : buildConsumiblesNavMegaMenuStatic(),
    [categoryTree],
  );
  const repuestosMenu = useMemo(
    () =>
      categoryTree.length > 0
        ? buildRepuestosNavMegaMenu(categoryTree)
        : buildRepuestosNavMegaMenuStatic(),
    [categoryTree],
  );
  const servicesMenu = useMemo(() => buildServicesNavMegaMenu(), []);
  const softwareMenu = useMemo(() => buildSoftwareNavMegaMenu(), []);

  return (
    <>
      <ProductosNavMobileAccordion {...(onNavigate ? { onNavigate } : {})} />
      <StaticNavMobileAccordion
        label={ALQUILER_NAV_SUBMENU.label}
        icon={RENTALS_NAV_MEGA_MENU_ICON}
        menu={rentalsMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
      <StaticNavMobileAccordion
        label={CONSUMIBLES_NAV_SUBMENU.label}
        icon={CONSUMABLES_NAV_MEGA_MENU_ICON}
        menu={consumiblesMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
      <StaticNavMobileAccordion
        label={REPUESTOS_NAV_SUBMENU.label}
        icon={REPUESTOS_NAV_MEGA_MENU_ICON}
        menu={repuestosMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
      <StaticNavMobileAccordion
        label={SERVICIOS_NAV_SUBMENU.label}
        icon={SERVICIOS_NAV_SUBMENU.icon}
        menu={servicesMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
      <StaticNavMobileAccordion
        label={SOFTWARE_NAV_SUBMENU.label}
        icon={SOFTWARE_NAV_MEGA_MENU_ICON}
        menu={softwareMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
    </>
  );
}

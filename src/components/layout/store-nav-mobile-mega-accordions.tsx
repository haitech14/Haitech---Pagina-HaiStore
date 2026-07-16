import { useMemo } from 'react';

import { StaticNavMobileAccordion } from '@/components/layout/static-nav-mobile-accordion';
import {
  ALQUILER_NAV_SUBMENU,
  PRODUCTOS_NAV_SUBMENU,
  SERVICIOS_NAV_SUBMENU,
  SOFTWARE_NAV_SUBMENU,
  TONER_NAV_SUBMENU,
} from '@/data/header-nav-submenus';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildProductosNavMegaMenu } from '@/lib/mega-menu-from-store-categories';
import {
  buildRentalsNavMegaMenu,
  buildServicesNavMegaMenu,
  buildSoftwareNavMegaMenu,
  buildTonerRepuestosNavMegaMenu,
  buildTonerRepuestosNavMegaMenuStatic,
  RENTALS_NAV_MEGA_MENU_ICON,
  SOFTWARE_NAV_MEGA_MENU_ICON,
  TONER_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

function ProductosNavMobileAccordion({ onNavigate }: { onNavigate?: () => void }) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildProductosNavMegaMenu(categoryTree), [categoryTree]);

  return (
    <StaticNavMobileAccordion
      label={PRODUCTOS_NAV_SUBMENU.label}
      icon={PRODUCTOS_NAV_SUBMENU.icon}
      menu={menu}
      labelHref="/tienda"
      {...(onNavigate ? { onNavigate } : {})}
    />
  );
}

export function StoreNavMobileMegaAccordions({ onNavigate }: { onNavigate?: () => void }) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const rentalsMenu = useMemo(() => buildRentalsNavMegaMenu(), []);
  const tonerRepuestosMenu = useMemo(
    () =>
      categoryTree.length > 0
        ? buildTonerRepuestosNavMegaMenu(categoryTree)
        : buildTonerRepuestosNavMegaMenuStatic(),
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
        label={TONER_NAV_SUBMENU.label}
        icon={TONER_NAV_MEGA_MENU_ICON}
        menu={tonerRepuestosMenu}
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

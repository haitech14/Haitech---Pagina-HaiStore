import { useMemo } from 'react';
import { Wrench } from 'lucide-react';

import { StaticNavMobileAccordion } from '@/components/layout/static-nav-mobile-accordion';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import {
  buildRentalsNavMegaMenu,
  buildServicesNavMegaMenu,
  buildTonerRepuestosNavMegaMenu,
  buildTonerRepuestosNavMegaMenuStatic,
  RENTALS_NAV_MEGA_MENU_ICON,
  TONER_NAV_MEGA_MENU_ICON,
} from '@/lib/nav-mega-menu-builders';

export function StoreNavMobileMegaAccordions({ onNavigate }: { onNavigate?: () => void }) {
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const servicesMenu = useMemo(() => buildServicesNavMegaMenu(), []);
  const rentalsMenu = useMemo(() => buildRentalsNavMegaMenu(), []);
  const tonerMenu = useMemo(
    () =>
      categoryTree.length > 0
        ? buildTonerRepuestosNavMegaMenu(categoryTree)
        : buildTonerRepuestosNavMegaMenuStatic(),
    [categoryTree],
  );

  return (
    <>
      <StaticNavMobileAccordion
        label="Servicios"
        icon={Wrench}
        menu={servicesMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
      <StaticNavMobileAccordion
        label="Alquileres"
        icon={RENTALS_NAV_MEGA_MENU_ICON}
        menu={rentalsMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
      <StaticNavMobileAccordion
        label="Tóner y Repuestos"
        icon={TONER_NAV_MEGA_MENU_ICON}
        menu={tonerMenu}
        {...(onNavigate ? { onNavigate } : {})}
      />
    </>
  );
}

import { useLocation } from 'react-router-dom';

import { HeaderStoreDesktopActions } from '@/components/layout/header-store-desktop-actions';
import { HeaderForumPublishButton } from '@/components/layout/header-forum-publish-button';
import { HeaderStoreUtilityBar } from '@/components/layout/header-store-utility-bar';
import { MockupNavLink } from '@/components/layout/header-main-menu';
import type { HeaderMainNavLink } from '@/components/layout/header-main-menu';
import {
  MAIN_NAV_LIGHT_BAR_CLASS,
  darkNavSecondaryLinkClass,
  mainNavLinkClass,
} from '@/components/layout/main-nav-styles';
import { HeaderBrandLogos } from '@/components/layout/site-logo';
import { SiteSearchForm } from '@/components/layout/site-search-form';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { FORUM_HEADER_NAV } from '@/data/forum-home-layout';
import {
  getHeaderNavSubmenuDefaultHref,
  PRODUCTOS_NAV_SUBMENU,
} from '@/data/header-nav-submenus';
import { formatPenFromUsd } from '@/lib/utils';
export type { HeaderMainNavLink } from '@/components/layout/header-main-menu';

export const headerMainNavLinks: HeaderMainNavLink[] = [
  {
    id: PRODUCTOS_NAV_SUBMENU.id,
    to: getHeaderNavSubmenuDefaultHref(PRODUCTOS_NAV_SUBMENU.items),
    label: PRODUCTOS_NAV_SUBMENU.label,
    matchActive: PRODUCTOS_NAV_SUBMENU.matchActive,
  },
];

export const forumHeaderNavLinks: HeaderMainNavLink[] = FORUM_HEADER_NAV.map((item) => ({
  id: item.id,
  to: item.to,
  label: item.label,
  end: item.end,
  matchActive: (location: { pathname: string; search: string; hash: string }) =>
    item.matchActive(location),
}));

export function isForumPath(pathname: string): boolean {
  return pathname === '/foro' || pathname.startsWith('/foro/');
}

function HeaderBrandLogo() {
  return (
    <HeaderBrandLogos
      heightClass="h-9 lg:h-10"
      width={176}
      height={39}
      loading="eager"
    />
  );
}

export function HeaderCategoryNav() {
  const { pathname } = useLocation();
  const { totalItems, totalPrice, openCart } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const cartTotalAria =
    displayCurrency === 'PEN'
      ? `${formatPenFromUsd(totalPrice)}, tipo de cambio venta`
      : `${totalPrice.toFixed(2)} dólares`;
  const forumMode = isForumPath(pathname);
  const navLinks = forumMode ? forumHeaderNavLinks : headerMainNavLinks;
  const linkClassName = forumMode ? mainNavLinkClass : darkNavSecondaryLinkClass;

  return (
    <>
      <nav
        aria-label={forumMode ? 'Menú del foro' : 'Barra superior de la tienda'}
        className={forumMode ? MAIN_NAV_LIGHT_BAR_CLASS : 'hidden overflow-visible lg:block'}
      >
        {!forumMode ? (
          <div className="container flex h-[4.5rem] items-center gap-4 overflow-visible py-3 xl:h-[4.875rem] xl:gap-5">
            <div className="shrink-0">
              <HeaderBrandLogo />
            </div>

            <div
              id="header-store-search"
              className="min-w-0 w-full max-w-[30rem] flex-1 ml-5 lg:ml-7 xl:ml-9 lg:max-w-[32rem] xl:max-w-[36rem]"
            >
              <SiteSearchForm
                className="w-full"
                variant="segmented"
                size="dense"
                showSearchIcons
              />
            </div>

            <div className="ml-auto flex shrink-0 items-center justify-end gap-3 xl:gap-4">
              <HeaderStoreDesktopActions
                cartCount={totalItems}
                cartAriaLabel={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
                onOpenCart={openCart}
              />
            </div>
          </div>
        ) : (
          <div className="container flex h-14 items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-6 lg:gap-7">
              <ul className="flex min-w-0 items-center gap-5 sm:gap-6 lg:gap-7">
                {navLinks.map((item) => (
                  <li key={item.id} className="shrink-0">
                    <MockupNavLink item={item} linkClassName={linkClassName} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <HeaderForumPublishButton />
            </div>
          </div>
        )}
      </nav>

      {!forumMode ? <HeaderStoreUtilityBar /> : null}
    </>
  );
}

export { HeaderMainMenu } from '@/components/layout/header-main-menu';

/** @deprecated Usar headerMainNavLinks */
export const mainNavItems = headerMainNavLinks;

import { useLocation } from 'react-router-dom';

import { HeaderStoreDesktopActions } from '@/components/layout/header-store-desktop-actions';
import { HeaderForumPublishButton } from '@/components/layout/header-forum-publish-button';
import { HeaderMainMenu, MockupNavLink } from '@/components/layout/header-main-menu';
import type { HeaderMainNavLink } from '@/components/layout/header-main-menu';
import {
  MAIN_NAV_LIGHT_BAR_CLASS,
  mainNavLinkClass,
} from '@/components/layout/main-nav-styles';
import { HeaderBrandLogos } from '@/components/layout/site-logo';
import { SiteSearchForm } from '@/components/layout/site-search-form';
import { FORUM_HEADER_NAV } from '@/data/forum-home-layout';
import {
  getHeaderNavSubmenuDefaultHref,
  PRODUCTOS_NAV_SUBMENU,
} from '@/data/header-nav-submenus';

export type { HeaderMainNavLink } from '@/components/layout/header-main-menu';

export const headerMainNavLinks: HeaderMainNavLink[] = [
  {
    id: PRODUCTOS_NAV_SUBMENU.id,
    to: getHeaderNavSubmenuDefaultHref(PRODUCTOS_NAV_SUBMENU.items),
    label: 'Categorías',
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

type HeaderCategoryNavProps = {
  cartCount?: number;
  cartAriaLabel?: string;
  onOpenCart?: () => void;
};

/**
 * Cabecera tienda (desktop):
 * Fila 1 — Logo | Buscador | Atención | Cuenta | Carrito
 * Fila 2 (blanca) — Categorías | Fotocopiadoras | Impresoras | … | Servicio técnico
 */
export function HeaderCategoryNav({
  cartCount = 0,
  cartAriaLabel = 'Carrito de compras',
  onOpenCart,
}: HeaderCategoryNavProps) {
  const { pathname } = useLocation();
  const forumMode = isForumPath(pathname);
  const navLinks = forumMode ? forumHeaderNavLinks : headerMainNavLinks;

  return (
    <div className={forumMode ? MAIN_NAV_LIGHT_BAR_CLASS : 'hidden overflow-visible lg:block'}>
      {!forumMode ? (
        <>
          <div className="container grid h-16 grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1fr)] items-center gap-3 overflow-visible py-2.5 xl:gap-4">
            <div className="flex min-w-0 items-center justify-start">
              <HeaderBrandLogo />
            </div>

            <div
              id="header-store-search"
              className="mx-auto w-full max-w-[28rem] xl:max-w-[34rem] 2xl:max-w-[40rem]"
            >
              <SiteSearchForm
                className="w-full"
                variant="segmented"
                size="compact"
                showSearchIcons
              />
            </div>

            <div className="flex min-w-0 items-center justify-end">
              <HeaderStoreDesktopActions
                cartCount={cartCount}
                cartAriaLabel={cartAriaLabel}
                onOpenCart={onOpenCart ?? (() => undefined)}
              />
            </div>
          </div>

          <nav
            aria-label="Navegación de productos"
            className="overflow-visible border-t border-black/10 bg-white"
          >
            <div className="container flex min-h-11 items-center justify-start gap-4 overflow-visible py-1.5">
              <HeaderMainMenu
                linkClassName={mainNavLinkClass}
                menuVariant="light"
                showIcons={false}
                menuDensity="default"
                showCategories
                className="justify-start gap-3 xl:gap-5"
              />
            </div>
          </nav>
        </>
      ) : (
        <nav aria-label="Menú del foro">
          <div className="container flex h-14 items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-6 lg:gap-7">
              <ul className="flex min-w-0 items-center gap-5 sm:gap-6 lg:gap-7">
                {navLinks.map((item) => (
                  <li key={item.id} className="shrink-0">
                    <MockupNavLink item={item} linkClassName={mainNavLinkClass} />
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <HeaderForumPublishButton />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

export { HeaderMainMenu } from '@/components/layout/header-main-menu';

/** @deprecated Usar headerMainNavLinks */
export const mainNavItems = headerMainNavLinks;

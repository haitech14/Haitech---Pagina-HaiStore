import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Grid3x3, Menu, ShoppingCart, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import {
  HeaderActionStrip,
  headerIconActionButtonClass,
} from '@/components/layout/header-action-strip';
import {
  HeaderCategoryNav,
  forumHeaderNavLinks,
  isForumPath,
} from '@/components/layout/header-category-nav';
import { HeaderCustomerServiceAction } from '@/components/layout/header-customer-service-action';
import { HeaderSupportButton } from '@/components/layout/header-support-button';
import { HeaderForumPublishButton } from '@/components/layout/header-forum-publish-button';
import { STORE_HEADER_LINKS } from '@/components/layout/header-main-menu';
import { HeaderTopBar } from '@/components/layout/header-top-bar';
import { StoreNavMobileMegaAccordions } from '@/components/layout/store-nav-mobile-mega-accordions';
import { HeaderBrandLogos } from '@/components/layout/site-logo';
import { SiteSearchForm } from '@/components/layout/site-search-form';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { cn, formatPenFromUsd } from '@/lib/utils';
import { prefetchStoreRouteFromEvent } from '@/lib/prefetch-store-route';

const HEADER_DARK_CLASS = 'bg-[#1A1A1A]';

type MainNavItem = {
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string; hash: string }) => boolean;
};

const mobileNavItems: MainNavItem[] = [
  ...STORE_HEADER_LINKS.map((item) => ({
    to: item.to,
    label: item.label,
    ...(item.end !== undefined ? { end: item.end } : {}),
    ...(item.matchActive ? { matchActive: item.matchActive } : {}),
  })),
  { to: '/contacto', label: 'Contacto' },
];

function resolveNavItemActive(
  item: MainNavItem,
  location: { pathname: string; search: string; hash: string },
  linkIsActive: boolean,
): boolean {
  if (item.matchActive) return item.matchActive(location);
  return linkIsActive;
}

export function Header() {
  const location = useLocation();
  const { totalItems, totalPrice, openCart } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const cartTotalAria =
    displayCurrency === 'PEN'
      ? `${formatPenFromUsd(totalPrice)}, tipo de cambio venta`
      : `${totalPrice.toFixed(2)} dólares`;
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const forumMode = isForumPath(location.pathname);
  const mobileLinks: MainNavItem[] = forumMode
    ? forumHeaderNavLinks.map((item) => ({
        to: item.to,
        label: item.label,
        ...(item.end !== undefined ? { end: item.end } : {}),
        ...(item.matchActive ? { matchActive: item.matchActive } : {}),
      }))
    : mobileNavItems;

  return (
    <header
      className={cn(
        'relative z-50 w-full overflow-visible',
        forumMode
          ? 'bg-white supports-[backdrop-filter]:bg-white/95 supports-[backdrop-filter]:backdrop-blur-sm shadow-[0_4px_14px_rgba(15,23,42,0.12)]'
          : cn(HEADER_DARK_CLASS, 'shadow-none'),
      )}
    >
      {!forumMode ? <HeaderTopBar /> : null}
      <div
        className={cn(
          'container flex items-center gap-3 py-2 sm:gap-4 sm:py-2.5',
          !forumMode && 'lg:hidden',
        )}
      >
        <div className="flex min-h-11 flex-1 items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'min-h-11 min-w-11 lg:hidden',
              !forumMode && 'text-white hover:bg-white/10 hover:text-white',
            )}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>

          {!forumMode ? (
            <Button
              type="button"
              variant="ghost"
              className={cn(
                'h-9 gap-1.5 rounded-md px-2.5 text-xs font-semibold lg:hidden',
                'text-white hover:bg-white/10 hover:text-white',
              )}
              aria-label={mobileOpen ? 'Cerrar categorías' : 'Abrir categorías'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              <Grid3x3 className="size-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
              <span className="hidden min-[380px]:inline">Categorías</span>
            </Button>
          ) : null}

          <HeaderBrandLogos
            heightClass="h-9 sm:h-10"
            width={160}
            height={35}
            loading="eager"
            partnerTone={forumMode ? 'light' : 'dark'}
          />
        </div>

        {forumMode ? (
          <div className="hidden flex-1 justify-center px-2 md:flex lg:px-4">
            <SiteSearchForm className="max-w-3xl lg:max-w-4xl" variant="segmented" />
          </div>
        ) : null}

        <HeaderActionStrip
          className="ml-auto"
          tone={forumMode ? 'light' : 'dark'}
          cartCount={totalItems}
          cartAriaLabel={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
          onOpenCart={openCart}
        />

        <div className="ml-auto flex items-center gap-1.5 sm:hidden">
          <AccountDropdown tone={forumMode ? 'light' : 'dark'} />
          <button
            type="button"
            className={headerIconActionButtonClass(forumMode ? 'light' : 'dark', 'md')}
            aria-label={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
            onClick={openCart}
          >
            <ShoppingCart className="size-5" strokeWidth={1.75} aria-hidden="true" />
            {totalItems > 0 ? (
              <Badge
                className={cn(
                  'absolute -right-0.5 -top-0.5 h-4 min-w-4 justify-center px-0.5 text-[0.6rem] text-white',
                  forumMode ? 'bg-red-600 text-white' : 'bg-white text-red-600',
                )}
                aria-hidden="true"
              >
                {totalItems}
              </Badge>
            ) : null}
          </button>
        </div>
      </div>

      {!forumMode ? (
        <>
          <div className="container border-t border-white/15 pb-2.5 pt-2 lg:hidden">
            <SiteSearchForm variant="header-dark" onNavigate={() => setMobileOpen(false)} />
          </div>
          <HeaderCategoryNav
            cartCount={totalItems}
            cartAriaLabel={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
            onOpenCart={openCart}
          />
        </>
      ) : (
        <>
          <div className="container border-t border-border/60 pb-2 pt-2 md:hidden">
            <SiteSearchForm variant="simple" onNavigate={() => setMobileOpen(false)} />
          </div>
          <HeaderCategoryNav />
        </>
      )}

      {mobileOpen && (
        <div className={cn('border-t lg:hidden', forumMode ? 'border-border/60' : 'border-white/15')}>
          <div className="container flex flex-col gap-3 py-3 sm:gap-4 sm:py-4">
            <nav aria-label={forumMode ? 'Navegación móvil del foro' : 'Navegación móvil'}>
              <ul className="flex flex-col">
                {mobileLinks.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      end={item.end ?? false}
                      onClick={() => setMobileOpen(false)}
                      onMouseEnter={item.to === '/tienda' ? prefetchStoreRouteFromEvent : undefined}
                      onFocus={item.to === '/tienda' ? prefetchStoreRouteFromEvent : undefined}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2.5 text-sm font-normal transition-colors',
                          forumMode
                            ? cn(
                                'hover:bg-accent',
                                resolveNavItemActive(item, location, isActive)
                                  ? 'text-red-600'
                                  : 'text-foreground',
                              )
                            : cn(
                                'text-white/90 hover:bg-white/10 hover:text-white',
                                resolveNavItemActive(item, location, isActive) && 'text-white',
                              ),
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            {!forumMode ? (
              <StoreNavMobileMegaAccordions onNavigate={() => setMobileOpen(false)} />
            ) : null}
            {!forumMode ? (
              <>
                <HeaderCustomerServiceAction variant="mobile" />
                <HeaderSupportButton variant="compact" className="min-h-11 w-full justify-center" />
              </>
            ) : null}
            {forumMode ? (
              <HeaderForumPublishButton className="min-h-11 w-full justify-center" />
            ) : null}
          </div>
        </div>
      )}
    </header>
  );
}

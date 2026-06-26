import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  ShoppingCart,
  Menu,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { CatalogMobileAccordion } from '@/components/layout/catalog-mobile-accordion';
import { HeaderActionStrip } from '@/components/layout/header-action-strip';
import { HeaderCategoryNav, forumHeaderNavLinks, headerMainNavLinks, isForumPath } from '@/components/layout/header-category-nav';
import { HeaderForumButton } from '@/components/layout/header-forum-button';
import { HeaderForumPublishButton } from '@/components/layout/header-forum-publish-button';
import { HeaderQuoteWhatsAppButton } from '@/components/layout/header-quote-whatsapp-button';
import { HeaderUtilityBar } from '@/components/layout/header-utility-bar';
import {
  HeaderCurrencyControl,
  HeaderCurrencySymbolToggle,
} from '@/components/layout/header-currency-control';
import { SolutionsMobileAccordion } from '@/components/layout/solutions-mobile-accordion';
import { HeaderLogoImage } from '@/components/layout/site-logo';
import { SiteSearchForm } from '@/components/layout/site-search-form';
import { useCart } from '@/context/cart-context';
import { useDisplayCurrency } from '@/context/display-currency-context';
import { cn, formatPenFromUsd } from '@/lib/utils';

type MainNavItem = {
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string }) => boolean;
};

const homeItem: MainNavItem = { to: '/', label: 'Inicio', end: true };

const mobileNavItems: MainNavItem[] = headerMainNavLinks.map((item) => {
  const mapped: MainNavItem = {
    to: item.to,
    label: item.label,
  };
  if (item.end !== undefined) mapped.end = item.end;
  if (item.matchActive) mapped.matchActive = item.matchActive;
  return mapped;
});

const navItems: MainNavItem[] = mobileNavItems;

function resolveNavItemActive(
  item: MainNavItem,
  location: { pathname: string; search: string },
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
  }, [location.pathname, location.search]);

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
    : navItems;

  return (
    <header
      className={cn(
        'relative z-50 w-full bg-white supports-[backdrop-filter]:bg-white/95 supports-[backdrop-filter]:backdrop-blur-sm',
        'shadow-[0_4px_14px_rgba(15,23,42,0.12)]',
      )}
    >
      <HeaderUtilityBar />

      {/* Fila principal */}
      <div className="container flex items-center gap-3 py-2.5 sm:gap-4 sm:py-3">
        <div className="flex min-h-12 flex-1 items-center gap-3 sm:gap-4">
          {/* Botón menú móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 lg:hidden"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>

          <Link
            to="/"
            className="flex shrink-0 items-center gap-2 sm:gap-2.5"
            aria-label="Haitech, inicio"
          >
            <HeaderLogoImage heightClass="h-8 sm:h-9 md:h-10" width={197} height={53} />
            <span className="hidden h-9 w-px shrink-0 bg-border/70 sm:block md:h-10" aria-hidden="true" />
            <img
              src="/ricohpartner.png"
              alt="Ricoh Alliance Partner"
              className="hidden h-9 w-auto rounded-sm sm:block sm:h-10 md:h-12"
              loading="lazy"
            />
          </Link>

          {/* Buscador */}
          <div className="hidden flex-1 justify-center px-2 md:flex lg:px-4">
            <SiteSearchForm className="max-w-3xl lg:max-w-4xl" variant="segmented" />
          </div>
        </div>

        <HeaderActionStrip
          className="ml-auto"
          cartCount={totalItems}
          cartAriaLabel={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
          onOpenCart={openCart}
        />

        <div className="ml-auto flex items-center gap-1 sm:hidden">
          <AccountDropdown />
          <HeaderCurrencySymbolToggle className="min-h-11 p-1 [&_button]:min-h-9 [&_button]:min-w-8 [&_button]:px-1.5 [&_button]:text-xs" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="relative size-11"
            aria-label={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
            onClick={openCart}
          >
            <ShoppingCart className="size-6 text-red-600" aria-hidden="true" />
            {totalItems > 0 && (
              <Badge
                className="absolute -right-1 -top-1 h-5 min-w-5 justify-center bg-red-600 px-1"
                aria-hidden="true"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <div className="container border-t border-border/60 pb-2 pt-2 md:hidden">
        <SiteSearchForm variant="simple" onNavigate={() => setMobileOpen(false)} />
      </div>

      <HeaderCategoryNav />

      {/* Panel móvil */}
      {mobileOpen && (
        <div className="border-t lg:hidden">
          <div className="container flex flex-col gap-4 py-4">
            <HeaderCurrencyControl className="w-full md:hidden" />
            {!forumMode ? <CatalogMobileAccordion onNavigate={() => setMobileOpen(false)} /> : null}
            {!forumMode ? <SolutionsMobileAccordion onNavigate={() => setMobileOpen(false)} /> : null}
            <nav aria-label={forumMode ? 'Navegación móvil del foro' : 'Navegación móvil'}>
              <ul className="flex flex-col">
                {!forumMode ? (
                  <li>
                    <NavLink
                      to={homeItem.to}
                      end={homeItem.end ?? false}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                          isActive ? 'text-red-600' : 'text-foreground',
                        )
                      }
                    >
                      {homeItem.label}
                    </NavLink>
                  </li>
                ) : null}
                {mobileLinks.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      end={item.end ?? false}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                          resolveNavItemActive(item, location, isActive)
                            ? 'text-red-600'
                            : 'text-foreground',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-col gap-2 sm:flex-row">
              {forumMode ? (
                <HeaderForumPublishButton className="min-h-11 w-full justify-center sm:flex-1" />
              ) : (
                <>
                  <HeaderForumButton className="min-h-11 w-full justify-center sm:flex-1" />
                  <HeaderQuoteWhatsAppButton className="min-h-11 w-full justify-center sm:flex-1" />
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </header>
  );
}

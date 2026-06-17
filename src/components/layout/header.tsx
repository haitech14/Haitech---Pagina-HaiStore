import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
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
import { HeaderCategoryNav, mainNavItems } from '@/components/layout/header-category-nav';
import { HeaderTopBar } from '@/components/layout/header-top-bar';
import { HeaderCurrencyControl } from '@/components/layout/header-currency-control';
import { SolutionsMobileAccordion } from '@/components/layout/solutions-mobile-accordion';
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

const mobileNavItems: MainNavItem[] = mainNavItems
  .filter((item): item is Extract<typeof item, { kind: 'link' }> => item.kind === 'link')
  .map((item) => {
    const mapped: MainNavItem = {
      to: item.to,
      label: item.label,
    };
    if (item.end !== undefined) mapped.end = item.end;
    if (item.matchActive) mapped.matchActive = item.matchActive;
    return mapped;
  });


const navItems: MainNavItem[] = [
  { to: '/tienda', label: 'Productos' },
  ...mobileNavItems.filter((item) => item.label !== 'Servicios' && item.label !== 'Contacto'),
  ...mobileNavItems.filter((item) => item.label === 'Servicios' || item.label === 'Contacto'),
];

function mainNavLinkProps(item: MainNavItem) {
  if (!item.matchActive) {
    return { to: item.to, end: item.end ?? false };
  }

  return {
    to: item.to,
    end: item.end ?? false,
    isActive: (_match: unknown, location: { pathname: string; search: string }) =>
      item.matchActive!(location),
  };
}

export function Header() {
  const { totalItems, totalPrice, openCart } = useCart();
  const { displayCurrency } = useDisplayCurrency();
  const cartTotalAria =
    displayCurrency === 'PEN'
      ? `${formatPenFromUsd(totalPrice)}, tipo de cambio venta`
      : `${totalPrice.toFixed(2)} dólares`;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateScrolled = () => {
      setScrolled(window.scrollY > 4);
    };

    updateScrolled();
    window.addEventListener('scroll', updateScrolled, { passive: true });
    return () => window.removeEventListener('scroll', updateScrolled);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-white supports-[backdrop-filter]:bg-white/95 supports-[backdrop-filter]:backdrop-blur-sm',
        'shadow-[0_4px_14px_rgba(15,23,42,0.12)]',
        scrolled && 'shadow-[0_6px_20px_rgba(15,23,42,0.16)]',
      )}
    >
      <HeaderTopBar />

      {/* Fila principal */}
      <div className="container flex items-center gap-3 py-2 sm:gap-4">
        <div className="flex min-h-12 flex-1 items-center gap-3 sm:gap-4">
          {/* Botón menú móvil */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
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
            <img src="/logo.png" alt="Haitech Soluciones Tecnológicas" className="h-10 w-auto" />
            <img
              src="/ricohpartner.png"
              alt="Ricoh Alliance Partner"
              className="h-14 w-auto rounded-sm sm:h-16"
              loading="lazy"
            />
          </Link>

          {/* Buscador */}
          <div className="hidden flex-1 justify-center md:flex">
            <SiteSearchForm className="max-w-lg" variant="segmented" />
          </div>
        </div>

        <HeaderActionStrip
          className="ml-auto"
          cartCount={totalItems}
          cartAriaLabel={`Carrito de compras, ${totalItems} artículos, total ${cartTotalAria}`}
          onOpenCart={openCart}
        />

        <div className="ml-auto flex items-center gap-0.5 sm:hidden">
          <AccountDropdown />
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

      <HeaderCategoryNav />

      {/* Panel móvil */}
      {mobileOpen && (
        <div className="border-t lg:hidden">
          <div className="container flex flex-col gap-4 py-4">
            <HeaderCurrencyControl className="w-full md:hidden" />
            <SiteSearchForm variant="simple" onNavigate={() => setMobileOpen(false)} />
            <CatalogMobileAccordion onNavigate={() => setMobileOpen(false)} />
            <SolutionsMobileAccordion onNavigate={() => setMobileOpen(false)} />
            <nav aria-label="Navegación móvil">
              <ul className="flex flex-col">
                {[homeItem, ...navItems].map((item) => (
                  <li key={item.label}>
                    <NavLink
                      {...mainNavLinkProps(item)}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent',
                          isActive ? 'text-red-600' : 'text-foreground',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}

    </header>
  );
}

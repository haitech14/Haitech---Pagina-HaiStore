import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Heart,
  ShoppingCart,
  Search,
  Menu,
  X,
  Mail,
  MapPin,
  Download,
  Phone,
} from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp, mdiFacebook, mdiInstagram, mdiYoutube } from '@mdi/js';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AccountDropdown } from '@/components/layout/account-dropdown';
import { CategoriesMegaMenu } from '@/components/layout/categories-mega-menu';
import { useCart } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { cn } from '@/lib/utils';

const homeItem = { to: '/', label: 'Inicio', end: true } as const;

const navItems = [
  { to: '/tienda', label: 'Tienda', end: false },
  { to: '/tienda', label: 'Ofertas', end: false },
  { to: '/tienda', label: 'Novedades', end: false },
  { to: '/tienda', label: 'Marcas', end: false },
  { to: '/tienda', label: 'Blog', end: false },
  { to: '/contacto', label: 'Contacto', end: false },
] as const;

const utilityLinksLeft = [
  {
    label: 'Ventas 915 149 290',
    href: 'https://wa.me/51915149290',
    external: true,
    icon: 'whatsapp' as const,
  },
  {
    label: 'Soporte 965 805 873',
    href: 'https://wa.me/51965805873',
    external: true,
    icon: 'phone' as const,
  },
  {
    label: 'ventas@haitech.pe',
    href: 'mailto:ventas@haitech.pe',
    external: false,
    icon: 'mail' as const,
  },
  {
    label: 'Ubicación',
    href: '/contacto',
    external: false,
    icon: 'location' as const,
  },
] as const;

const downloadsLink = {
  label: 'Descargas',
  href: '/contacto',
  icon: 'download' as const,
} as const;

type UtilityIconType =
  | (typeof utilityLinksLeft)[number]['icon']
  | typeof downloadsLink.icon;

function UtilityIcon({ type }: { type: UtilityIconType }) {
  const className = 'size-4 shrink-0 text-current';

  switch (type) {
    case 'whatsapp':
      return <Icon path={mdiWhatsapp} size={0.67} className={className} aria-hidden="true" />;
    case 'phone':
      return <Phone className={className} aria-hidden="true" />;
    case 'mail':
      return <Mail className={className} aria-hidden="true" />;
    case 'location':
      return <MapPin className={className} aria-hidden="true" />;
    case 'download':
      return <Download className={className} aria-hidden="true" />;
  }
}

const TIKTOK_PATH =
  'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z';

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/', path: mdiFacebook },
  { label: 'Instagram', href: 'https://instagram.com/', path: mdiInstagram },
  { label: 'TikTok', href: 'https://tiktok.com/', path: TIKTOK_PATH },
  { label: 'YouTube', href: 'https://youtube.com/', path: mdiYoutube },
] as const;

const utilityLinkClass =
  'flex shrink-0 items-center gap-1.5 whitespace-nowrap text-neutral-400 transition-colors hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50';

function UtilityBarLink({
  label,
  href,
  icon,
  external,
}: {
  label: string;
  href: string;
  icon: UtilityIconType;
  external?: boolean;
}) {
  if (external || href.startsWith('mailto:')) {
    return (
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={utilityLinkClass}
      >
        <UtilityIcon type={icon} />
        <span>{label}</span>
      </a>
    );
  }

  return (
    <Link to={href} className={utilityLinkClass}>
      <UtilityIcon type={icon} />
      <span>{label}</span>
    </Link>
  );
}

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'relative inline-flex h-10 items-center px-3 text-sm font-medium transition-colors hover:bg-red-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
    isActive
      ? 'font-semibold text-white after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-white'
      : 'text-white/90',
  );

function SearchForm({ className }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <form
      role="search"
      className={cn('flex w-full items-stretch', className)}
      onSubmit={(event) => {
        event.preventDefault();
        void navigate('/tienda');
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        Buscar productos
      </label>
      <input
        id="site-search"
        type="search"
        placeholder="Buscar productos, marcas y más..."
        className="h-11 w-full rounded-l-md border border-r-0 border-input bg-background px-4 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="flex h-11 w-12 shrink-0 items-center justify-center rounded-r-md bg-red-600 text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>
    </form>
  );
}

function favoritesSubtitle(count: number): string {
  if (count === 0) return 'Vacío';
  return count === 1 ? '1 guardado' : `${count} guardados`;
}

export function Header() {
  const { totalItems, totalPrice, openCart } = useCart();
  const { totalItems: favoritesCount } = useWishlist();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Barra superior de utilidades */}
      <div className="bg-black text-neutral-400">
        <div className="container flex h-9 items-center justify-between gap-4 overflow-x-auto text-xs sm:gap-6 sm:overflow-visible">
          <div className="flex items-center gap-4 sm:gap-6">
            {utilityLinksLeft.map((item) => (
              <UtilityBarLink
                key={item.label}
                label={item.label}
                href={item.href}
                icon={item.icon}
                external={item.external}
              />
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-4 sm:gap-6">
            <ul aria-label="Redes sociales" className="flex items-center gap-2 sm:gap-2.5">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400/50"
                  >
                    <Icon path={social.path} size={0.65} aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>

            <UtilityBarLink
              label={downloadsLink.label}
              href={downloadsLink.href}
              icon={downloadsLink.icon}
            />
          </div>
        </div>
      </div>

      {/* Cabecera fija */}
      <div className="sticky top-0 z-40 bg-background">
      {/* Fila principal */}
      <div className="container flex h-16 items-center gap-3 sm:gap-4">
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
          <img src="/logo.png" alt="Haitech" className="h-10 w-auto" />
          <img
            src="/ricohpartner.png"
            alt="Ricoh Alliance Partner"
            className="h-14 w-auto rounded-sm sm:h-16"
            loading="lazy"
          />
        </Link>

        {/* Buscador */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchForm className="max-w-md" />
        </div>

        <AccountDropdown />

        <div className="ml-auto flex items-center gap-0.5 sm:ml-0 sm:gap-1">
          {/* Favoritos */}
          <Button
            variant="ghost"
            className="h-11 gap-2 px-2"
            asChild
          >
            <Link
              to="/favoritos"
              aria-label={`Favoritos, ${favoritesCount} productos guardados`}
            >
              <span className="relative">
                <Heart className="size-6 text-red-600" strokeWidth={2} aria-hidden="true" />
                {favoritesCount > 0 && (
                  <Badge
                    className="absolute -right-2 -top-2 h-5 min-w-5 justify-center bg-red-600 px-1"
                    aria-hidden="true"
                  >
                    {favoritesCount}
                  </Badge>
                )}
              </span>
              <span className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-sm font-semibold">Favoritos</span>
                <span className="text-xs text-muted-foreground">
                  {favoritesSubtitle(favoritesCount)}
                </span>
              </span>
            </Link>
          </Button>

          {/* Carrito */}
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-2 px-2"
          aria-label={`Carrito de compras, ${totalItems} artículos`}
          onClick={openCart}
        >
          <span className="relative">
            <ShoppingCart className="size-6 text-red-600" aria-hidden="true" />
            {totalItems > 0 && (
              <Badge
                className="absolute -right-2 -top-2 h-5 min-w-5 justify-center bg-red-600 px-1 motion-safe:animate-in motion-safe:zoom-in"
                aria-hidden="true"
              >
                {totalItems}
              </Badge>
            )}
          </span>
          <span className="hidden flex-col items-start leading-tight sm:flex">
            <span className="text-sm font-semibold">Carrito</span>
            <span className="text-xs text-muted-foreground">${totalPrice.toFixed(2)}</span>
          </span>
        </Button>
        </div>
      </div>

      {/* Navegación secundaria (desktop) */}
      <nav
        aria-label="Navegación principal"
        className="hidden border-0 bg-red-600 lg:block"
      >
        <div className="container flex h-10 items-stretch gap-2">
          <CategoriesMegaMenu />

          <ul className="flex items-center gap-1">
            <li>
              <NavLink to={homeItem.to} end={homeItem.end} className={desktopLinkClass}>
                {homeItem.label}
              </NavLink>
            </li>
            {navItems.map((item) => (
              <li key={item.label}>
                <NavLink to={item.to} end={item.end} className={desktopLinkClass}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Panel móvil */}
      {mobileOpen && (
        <div className="border-t lg:hidden">
          <div className="container flex flex-col gap-4 py-4">
            <SearchForm />
            <nav aria-label="Navegación móvil">
              <ul className="flex flex-col">
                {[homeItem, ...navItems].map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      end={item.end}
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
      </div>
    </header>
  );
}

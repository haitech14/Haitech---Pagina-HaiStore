import { NavLink, useLocation } from 'react-router-dom';
import { Headphones, Home, Menu, Tag, User } from 'lucide-react';

import {
  MOBILE_BOTTOM_NAV_HEIGHT_PX,
  useSetMobileBottomNavInset,
} from '@/context/mobile-bottom-inset-context';
import { HAITECH_HOME_TOPBAR } from '@/data/haitech-home-shell';
import { openHaitechMobileCategories } from '@/lib/haitech-mobile-nav-events';
import { shouldShowMobileBottomNav } from '@/lib/mobile-bottom-nav';
import { cn } from '@/lib/utils';

const navItemClass =
  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[0.625rem] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

export function MobileBottomNav() {
  const { pathname } = useLocation();

  const visible = shouldShowMobileBottomNav(pathname);
  useSetMobileBottomNavInset(visible ? MOBILE_BOTTOM_NAV_HEIGHT_PX : 0);

  return (
    visible ? (
      <nav
        aria-label="Navegación principal móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E8E8] bg-white lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch gap-0.5 px-1 py-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
              )
            }
          >
            <Home className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Inicio</span>
          </NavLink>

          <button
            type="button"
            onClick={openHaitechMobileCategories}
            aria-controls="haitech-mobile-menu-sheet"
            className={cn(navItemClass, 'text-[#6B6B6B] hover:text-[#222]')}
          >
            <Menu className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Menú</span>
          </button>

          <NavLink
            to="/tienda"
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
              )
            }
          >
            <Tag className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Ofertas</span>
          </NavLink>

          <a
            href={HAITECH_HOME_TOPBAR.supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(navItemClass, 'text-[#6B6B6B] hover:text-[#222]')}
          >
            <Headphones className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Soporte</span>
          </a>

          <NavLink
            to="/mi-cuenta"
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
              )
            }
          >
            <User className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Cuenta</span>
          </NavLink>
        </div>
      </nav>
    ) : null
  );
}

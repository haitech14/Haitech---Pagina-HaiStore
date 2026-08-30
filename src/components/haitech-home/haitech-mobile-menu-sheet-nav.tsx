import { ChevronRight } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

import { HAITECH_BLACK_NAV_LINKS } from '@/data/haitech-home-shell';
import { prefetchStoreRouteFromEvent } from '@/lib/prefetch-store-route';
import { serviceHubPath } from '@/lib/service-hub';
import { storeShowcasePath } from '@/lib/store-showcase-path';
import { cn } from '@/lib/utils';

type NavItem = {
  id: string;
  to: string;
  label: string;
  end?: boolean;
  matchActive?: (location: { pathname: string; search: string }) => boolean;
  prefetch?: boolean;
};

const HAITECH_MOBILE_NAV_LINKS: NavItem[] = [
  { id: 'inicio', to: '/', label: 'Inicio', end: true },
  { id: 'tienda', to: '/tienda', label: 'Tienda', prefetch: true },
  {
    id: 'equipos',
    to: storeShowcasePath({ categoryId: 'multifuncionales' }),
    label: 'Equipos',
    prefetch: true,
    matchActive: ({ pathname }) =>
      pathname.startsWith('/tienda') ||
      pathname.startsWith('/categoria/') ||
      pathname.startsWith('/producto/'),
  },
  {
    id: 'consumibles',
    to: storeShowcasePath({ categoryId: 'toner' }),
    label: 'Consumibles',
    prefetch: true,
    matchActive: ({ pathname }) =>
      pathname.includes('toner') ||
      pathname.includes('repuestos') ||
      pathname.includes('consumible'),
  },
  {
    id: 'servicio-tecnico',
    to: serviceHubPath('servicio-tecnico'),
    label: 'Servicio Técnico',
    matchActive: ({ pathname, search }) =>
      pathname.startsWith('/servicios') && search.includes('seccion=servicio-tecnico'),
  },
  {
    id: 'alquiler',
    to: serviceHubPath('alquiler'),
    label: 'Alquiler',
    matchActive: ({ pathname }) =>
      pathname.startsWith('/servicios/alquiler') ||
      pathname === '/alquiler' ||
      pathname.startsWith('/categoria/alquiler'),
  },
  ...HAITECH_BLACK_NAV_LINKS.filter(
    (item) => item.id !== 'servicio-tecnico' && item.id !== 'alquiler',
  ).map((item) => ({
    id: item.id,
    to: item.to,
    label: item.label,
    ...('end' in item && item.end === true ? { end: true as const } : {}),
    ...('matchActive' in item && item.matchActive ? { matchActive: item.matchActive } : {}),
  })),
];

type HaitechMobileMenuSheetNavProps = {
  onNavigate?: () => void;
};

export function HaitechMobileMenuSheetNav({ onNavigate }: HaitechMobileMenuSheetNavProps) {
  const location = useLocation();

  return (
    <nav aria-label="Navegación principal" className="min-h-0 flex-1 overflow-y-auto bg-white">
      <ul className="flex flex-col">
        {HAITECH_MOBILE_NAV_LINKS.map((item) => {
          const isActive = item.matchActive
            ? item.matchActive(location)
            : item.end
              ? location.pathname === item.to
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <li key={item.id} className="border-b border-[#E8E8E8] last:border-b-0">
              <NavLink
                to={item.to}
                {...(item.end ? { end: true } : {})}
                onClick={() => onNavigate?.()}
                {...(item.prefetch
                  ? {
                      onMouseEnter: prefetchStoreRouteFromEvent,
                      onFocus: prefetchStoreRouteFromEvent,
                    }
                  : {})}
                className={cn(
                  'flex min-h-12 items-center justify-between gap-3 px-4 py-3 text-[15px] font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-inset',
                  isActive ? 'bg-[#FFF5F5] text-[#E30613]' : 'text-[#222] hover:bg-[#FAFAFA]',
                )}
              >
                <span>{item.label}</span>
                <ChevronRight
                  className={cn('size-4 shrink-0', isActive ? 'text-[#E30613]' : 'text-[#BBB]')}
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

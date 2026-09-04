import { NavLink } from 'react-router-dom';

import { DeferredCategoriesMegaMenu } from '@/components/layout/deferred-categories-mega-menu';
import { ServicioTecnicoNavMegaMenu } from '@/components/layout/servicio-tecnico-nav-mega-menu';
import { ServicesNavMegaMenu } from '@/components/layout/services-nav-mega-menu';
import {
  HAITECH_HOME,
  HAITECH_HOME_SECONDARY_NAV_LINKS,
  type HaitechHomeSecondaryNavLink,
} from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const SECONDARY_NAV_ROW = 'haitech-white' as const;

function SecondaryNavPlainLink({ item }: { item: HaitechHomeSecondaryNavLink }) {
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'inline-flex h-full items-center whitespace-nowrap px-3.5 text-[13px] font-medium transition-colors sm:px-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35',
          isActive ? 'text-[#E30613]' : 'text-[#1A1A1A] hover:text-[#E30613]',
        )
      }
    >
      {item.label}
    </NavLink>
  );
}

function SecondaryNavDropdown({ item }: { item: HaitechHomeSecondaryNavLink }) {
  if (!('menu' in item) || !item.menu) {
    return <SecondaryNavPlainLink item={item} />;
  }

  const shared = {
    navRow: SECONDARY_NAV_ROW,
    showIcon: false,
    label: item.label,
    triggerHref: item.href,
  } as const;

  switch (item.menu) {
    case 'equipos':
      return (
        <DeferredCategoriesMegaMenu
          triggerVariant="nav"
          eager
          {...shared}
        />
      );
    case 'servicio-tecnico':
      return <ServicioTecnicoNavMegaMenu {...shared} />;
    case 'alquiler':
      return <ServicesNavMegaMenu {...shared} />;
    default:
      return <SecondaryNavPlainLink item={item} />;
  }
}

/** Barra secundaria: Todas las Categorías (rojo + mega menú) + enlaces con dropdown. */
export function HaitechHomeSecondaryCategoryNav({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Secciones de la tienda"
      className={cn('hidden w-full border-b border-[#E8E8E8] bg-white sm:block', className)}
    >
      <div
        className="mx-auto flex h-[42px] items-stretch gap-0 px-3 sm:px-4 xl:px-6"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <DeferredCategoriesMegaMenu
          triggerVariant="brand-red"
          label="Todas las Categorías"
          showIcon
          eager
          triggerHref="/tienda"
        />

        <ul className="flex min-w-0 flex-1 items-stretch overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {HAITECH_HOME_SECONDARY_NAV_LINKS.map((item) => (
            <li key={item.id} className="flex shrink-0 items-stretch">
              {'menu' in item && item.menu ? (
                <SecondaryNavDropdown item={item} />
              ) : (
                <SecondaryNavPlainLink item={item} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';

import { DeferredCategoriesMegaMenu } from '@/components/layout/deferred-categories-mega-menu';
import { ServicioTecnicoNavMegaMenu } from '@/components/layout/servicio-tecnico-nav-mega-menu';
import { ServicesNavMegaMenu } from '@/components/layout/services-nav-mega-menu';
import {
  HAITECH_HOME_SECONDARY_NAV_LINKS,
  type HaitechHomeSecondaryNavLink,
} from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

const SECONDARY_NAV_ROW = 'haitech-white' as const;
const NAV_LINK_CLASS =
  'relative inline-flex h-full items-center whitespace-nowrap px-2.5 text-[14px] font-medium text-[#111] transition-colors hover:text-[#E30613] after:absolute after:inset-x-2.5 after:bottom-0 after:h-0.5 after:bg-[#E30613] after:opacity-0 after:transition-opacity hover:after:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/35';

function SecondaryNavPlainLink({ item }: { item: HaitechHomeSecondaryNavLink }) {
  return (
    <NavLink to={item.href} className={NAV_LINK_CLASS}>
      {item.label}
    </NavLink>
  );
}

function SecondaryNavDropdown({ item }: { item: HaitechHomeSecondaryNavLink }) {
  const shared = {
    navRow: SECONDARY_NAV_ROW,
    showIcon: false,
    showChevron: false,
    label: item.label,
    triggerHref: item.href,
  } as const;

  switch (item.menu) {
    case 'equipos':
      return <DeferredCategoriesMegaMenu triggerVariant="nav" eager {...shared} />;
    case 'servicio-tecnico':
      return <ServicioTecnicoNavMegaMenu {...shared} />;
    case 'alquiler':
      return <ServicesNavMegaMenu {...shared} />;
    case 'mas':
      return <SecondaryNavPlainLink item={item} />;
  }
}

export function HaitechHomePrimaryNavLinks({ className }: { className?: string }) {
  return (
    <ul className={cn('flex h-full min-w-0 items-stretch gap-2 lg:gap-3', className)} role="list">
      {HAITECH_HOME_SECONDARY_NAV_LINKS.filter((item) => item.id !== 'mas').map((item) => (
        <li key={item.id} className="flex shrink-0 items-stretch">
          {'menu' in item && item.menu ? (
            <SecondaryNavDropdown item={item} />
          ) : (
            <SecondaryNavPlainLink item={item} />
          )}
        </li>
      ))}
    </ul>
  );
}

import { mdiWhatsapp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { NavLink } from 'react-router-dom';

import { DeferredCategoriesMegaMenu } from '@/components/layout/deferred-categories-mega-menu';
import {
  HAITECH_HOME,
  HAITECH_NAV_QUOTE_HREF,
  HAITECH_PRIMARY_CATEGORIES_LEFT,
  HAITECH_PRIMARY_CATEGORIES_RIGHT,
} from '@/data/haitech-home-shell';
import { cn } from '@/lib/utils';

function CategoryNavLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className="inline-flex h-[38px] items-center whitespace-nowrap text-white transition-colors duration-200 hover:text-white/80"
    >
      {label}
    </NavLink>
  );
}

export function HaitechHomeCategoryNavigation({ className }: { className?: string }) {
  return (
    <nav
      aria-label="Navegación principal"
      className={cn(
        'hidden w-full bg-black sm:block',
        '[font-family:"Space_Grotesk",Montserrat,system-ui,sans-serif]',
        className,
      )}
    >
      <div
        className="mx-auto flex h-[38px] items-center gap-2 overflow-x-auto px-3 text-[12.5px] font-medium tracking-[0.01em] text-white [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-3 sm:px-4 sm:text-[13px] xl:gap-4 xl:px-6 [&::-webkit-scrollbar]:hidden"
        style={{ maxWidth: HAITECH_HOME.maxWidth }}
      >
        <DeferredCategoriesMegaMenu
          triggerVariant="brand-red"
          label="Productos"
          showIcon={false}
        />

        <ul className="flex min-w-0 items-center gap-3 sm:gap-3.5 xl:gap-5">
          {HAITECH_PRIMARY_CATEGORIES_LEFT.map((item) => (
            <li key={item.label} className="shrink-0">
              <CategoryNavLink to={item.to} label={item.label} />
            </li>
          ))}
        </ul>

        <span className="mx-1 hidden h-4 w-px shrink-0 bg-white/30 sm:block" aria-hidden="true" />

        <ul className="flex min-w-0 flex-1 items-center gap-3 sm:gap-3.5 xl:gap-5">
          {HAITECH_PRIMARY_CATEGORIES_RIGHT.map((item) => (
            <li key={item.label} className="shrink-0">
              <CategoryNavLink to={item.to} label={item.label} />
            </li>
          ))}
        </ul>

        <a
          href={HAITECH_NAV_QUOTE_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'ml-auto inline-flex h-[38px] shrink-0 items-center gap-1.5 bg-[#E30613] px-2.5 text-[12px] font-semibold text-white sm:px-3.5 sm:text-[12.5px]',
            'transition-colors hover:bg-[#c90511]',
          )}
        >
          <Icon path={mdiWhatsapp} size={0.7} className="shrink-0 text-white" aria-hidden="true" />
          <span className="sm:hidden">WhatsApp</span>
          <span className="hidden sm:inline">Comprar por Whatsapp</span>
        </a>
      </div>
    </nav>
  );
}

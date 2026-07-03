import { cn } from '@/lib/utils';

/** Barra de menú principal mockup (fondo rojo marca). */
export const MAIN_NAV_BAR_CLASS = 'hidden bg-[#E30613] lg:block';

/** Barra de menú principal legacy (fondo claro, enlaces oscuros). */
export const MAIN_NAV_LIGHT_BAR_CLASS = 'hidden border-t border-border/60 bg-white lg:block';

export const MAIN_NAV_ROW_CLASS = 'container flex h-[3.25rem] items-center justify-between gap-3 sm:h-14';

export const DARK_NAV_ICON_CLASS = 'size-3.5 shrink-0';

export const MAIN_NAV_LINKS_ROW_CLASS = 'flex min-w-0 flex-1 items-center gap-5 overflow-x-auto sm:gap-6 lg:gap-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const MAIN_NAV_CATEGORIES_BUTTON_CLASS = cn(
  'inline-flex shrink-0 items-center gap-2 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm',
  'transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
);

export const MAIN_NAV_WHATSAPP_BUTTON_CLASS = cn(
  'inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white shadow-sm',
  'transition-colors hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
);

export const MAIN_NAV_ICON_CLASS = 'size-4 shrink-0';

export const MAIN_NAV_ICON_COMPACT_CLASS = 'size-3.5 shrink-0';

export type MainNavRowVariant = 'default' | 'secondary' | 'light' | 'light-compact';

export function navChevronClass(navRow: MainNavRowVariant, open: boolean) {
  return cn(
    'shrink-0 transition-transform',
    navRow === 'light' || navRow === 'light-compact' ? 'size-3.5 opacity-80' : 'size-3',
    open && 'rotate-180',
  );
}

export function mainNavLinkClass(isActive: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-[#0f1f3d] transition-colors',
    'hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    isActive && 'text-red-600',
  );
}

export function darkNavLinkClass(isActive: boolean) {
  return cn(
    'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap py-0.5 text-[0.8125rem] font-normal text-white/90 transition-colors',
    'hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]',
    isActive && 'text-white',
    isActive &&
      'after:absolute after:-bottom-2.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#E30613]',
  );
}

export function darkNavSecondaryLinkClass(isActive: boolean) {
  return cn(
    'relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap py-1 text-[0.8125rem] font-normal text-white/90 transition-colors',
    'hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1A1A]',
    isActive && 'text-white',
    isActive &&
      'after:absolute after:-bottom-px after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#E30613]',
  );
}

export function darkNavSecondarySubmenuTriggerClass(isRouteActive: boolean, isOpen: boolean) {
  return cn(
    darkNavSecondaryLinkClass(isRouteActive),
    isOpen && !isRouteActive && 'text-white',
  );
}

export function darkNavSubmenuTriggerClass(isRouteActive: boolean, isOpen: boolean) {
  return cn(
    darkNavLinkClass(isRouteActive),
    isOpen && !isRouteActive && 'text-white',
  );
}

const SUBMENU_PANEL_ANIMATION_CLASS =
  'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-1';

export { SUBMENU_PANEL_ANIMATION_CLASS };

export function mainNavContactClass(isActive: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#0f1f3d] transition-colors',
    'hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    isActive && 'text-red-600',
  );
}

export const MAIN_NAV_BADGE_CLASS = cn(
  'inline-flex shrink-0 items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700',
  'transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
);

export function mainNavLinkCompactClass(isActive: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-normal text-[#0f1f3d] transition-colors',
    'hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    isActive && 'text-red-600',
  );
}

export function lightNavSubmenuTriggerClass(isRouteActive: boolean, isOpen: boolean) {
  return cn(
    mainNavLinkClass(isRouteActive),
    isOpen && !isRouteActive && 'text-red-600',
  );
}

export function lightNavSubmenuTriggerCompactClass(isRouteActive: boolean, isOpen: boolean) {
  return cn(
    mainNavLinkCompactClass(isRouteActive),
    isOpen && !isRouteActive && 'text-red-600',
  );
}

/** @deprecated Barra roja anterior; conservado por mega menús legacy. */
export const MAIN_NAV_DIVIDER_CLASS = 'w-px shrink-0 self-stretch bg-white/25';

/** @deprecated */
export const MAIN_NAV_HOME_BUTTON_CLASS = '';

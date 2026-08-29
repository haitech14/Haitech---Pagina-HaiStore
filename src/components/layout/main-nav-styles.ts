import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/** Barra de menú principal mockup (fondo rojo marca). */
export const MAIN_NAV_BAR_CLASS = 'hidden bg-[#E30613] lg:block';

/** Barra de menú principal legacy (fondo claro, enlaces oscuros). */
export const MAIN_NAV_LIGHT_BAR_CLASS = 'hidden border-t border-border/60 bg-white lg:block';

export const MAIN_NAV_ROW_CLASS = 'container flex h-[3.25rem] items-center justify-between gap-3 sm:h-14';

export const DARK_NAV_ICON_CLASS = 'size-3.5 shrink-0';

export const MAIN_NAV_LINKS_ROW_CLASS = 'flex min-w-0 flex-1 items-center gap-5 overflow-x-auto sm:gap-6 lg:gap-7 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';

export const MAIN_NAV_CATEGORIES_BUTTON_CLASS = cn(
  'inline-flex shrink-0 items-center gap-1.5 self-stretch rounded-none bg-[#1a1a1a] px-2.5 text-sm font-semibold text-white',
  'transition-colors hover:bg-[#2a2a2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1a]/40 focus-visible:ring-inset',
);

export const MAIN_NAV_WHATSAPP_BUTTON_CLASS = cn(
  'inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#25D366] px-3.5 py-2 text-sm font-semibold text-white shadow-sm',
  'transition-colors hover:bg-[#20bd5a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
);

export const MAIN_NAV_ICON_CLASS = 'size-4 shrink-0';

export const MAIN_NAV_ICON_COMPACT_CLASS = 'size-3.5 shrink-0';

export type MainNavRowVariant =
  | 'default'
  | 'secondary'
  | 'light'
  | 'light-compact'
  | 'haitech-black'
  | 'haitech-white';

export function navChevronClass(navRow: MainNavRowVariant, open: boolean) {
  return cn(
    'shrink-0 transition-transform',
    navRow === 'light' || navRow === 'light-compact' || navRow === 'haitech-white'
      ? 'size-3.5 opacity-80'
      : navRow === 'haitech-black'
        ? 'size-3.5'
        : 'size-3',
    open && 'rotate-180',
  );
}

export function mainNavLinkClass(isActive: boolean) {
  return cn(
    'relative inline-flex shrink-0 items-center gap-1 whitespace-nowrap py-1 text-[0.8125rem] font-medium text-[#1b2433] transition-colors',
    'hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613] focus-visible:ring-offset-2',
    isActive && 'text-[#E30613]',
    isActive &&
      'after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#E30613]',
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

/** Enlaces planos de la barra blanca HAITECH (home storefront). */
export function haitechWhiteNavLinkClass(isActive: boolean) {
  return cn(
    'inline-flex h-[38px] shrink-0 items-center whitespace-nowrap px-3 text-[13px] font-semibold text-[#111111] transition-colors',
    'hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/30',
    isActive && 'text-[#E30613]',
  );
}

/** Triggers con mega menú en la barra blanca HAITECH. */
export function haitechWhiteSubmenuTriggerClass(isRouteActive: boolean, isOpen: boolean) {
  return cn(
    'inline-flex h-[38px] shrink-0 items-center gap-1 whitespace-nowrap px-3 text-[13px] font-semibold text-[#111111] transition-colors',
    'hover:text-[#E30613] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E30613]/30',
    (isRouteActive || isOpen) && 'text-[#E30613]',
  );
}

/** Enlaces planos de la barra negra HAITECH (home storefront). */
export function haitechBlackNavLinkClass(isActive: boolean) {
  return cn(
    'inline-flex h-[38px] shrink-0 items-center whitespace-nowrap px-3 text-[13px] font-semibold text-white transition-colors',
    'hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
    isActive && 'text-white',
  );
}

/** Triggers con mega menú en la barra negra HAITECH (rojo al abrir o en ruta activa). */
export function haitechBlackSubmenuTriggerClass(isRouteActive: boolean, isOpen: boolean) {
  return cn(
    'inline-flex h-[38px] shrink-0 items-center gap-1 whitespace-nowrap px-3 text-[13px] font-semibold text-white transition-colors',
    'hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
    (isRouteActive || isOpen) && 'bg-[#E30613] hover:bg-[#c90511]',
    isOpen && 'bg-[#c90511]',
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

/**
 * Dimensiones compartidas de los mega menús del header (Productos, Toner, etc.).
 * El panel usa width:max-content y solo se limita con maxWidth al espacio disponible.
 */
export const MEGA_MENU_MIN_WIDTH = 420;
/** Casi todo el viewport bajo la nav sticky, para no cortar columnas largas. */
export const MEGA_MENU_MAX_HEIGHT = 'min(56rem, calc(100dvh - 3.25rem))';

export const MEGA_MENU_DROPDOWN_CLASS = cn(
  'z-50 w-max overflow-x-hidden overflow-y-auto overscroll-contain rounded-2xl border border-black/[0.06] bg-white p-0',
  'shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22),0_8px_16px_-8px_rgba(15,23,42,0.12)]',
  '[scrollbar-width:thin] [scrollbar-color:#D1D5DB_transparent]',
  SUBMENU_PANEL_ANIMATION_CLASS,
);

export function clampMegaMenuWidth(available: number): number {
  return Math.max(MEGA_MENU_MIN_WIDTH, available);
}

export type MegaMenuDropdownLayout = {
  /** Tope del panel (viewport / container). El ancho real lo define el contenido. */
  maxWidth: number;
  marginLeft: number;
  /** @deprecated Preferir maxWidth + w-max; se conserva para callers legacy. */
  width?: number;
};

/** Tope de ancho y alineación; el panel crece con el contenido hasta maxWidth. */
export function computeMegaMenuDropdownLayout(
  trigger: HTMLElement,
  options?: { minWidth?: number; maxWidth?: number },
): MegaMenuDropdownLayout {
  const container = trigger.closest('.container');
  const containerRect = container?.getBoundingClientRect();
  const triggerRect = trigger.getBoundingClientRect();
  const left = Math.max(12, containerRect?.left ?? triggerRect.left);
  const rightMargin = containerRect
    ? Math.max(12, window.innerWidth - containerRect.right)
    : 12;
  const available = Math.max(MEGA_MENU_MIN_WIDTH, window.innerWidth - left - rightMargin);
  const maxWidth =
    options?.maxWidth !== undefined ? Math.min(available, options.maxWidth) : available;

  return { maxWidth, marginLeft: 0 };
}

export function megaMenuDropdownStyle(
  layout: MegaMenuDropdownLayout | number | undefined,
): CSSProperties | undefined {
  if (layout === undefined) return undefined;
  if (typeof layout === 'number') {
    return { width: 'max-content', maxWidth: layout, maxHeight: MEGA_MENU_MAX_HEIGHT };
  }
  return {
    width: 'max-content',
    maxWidth: layout.maxWidth,
    maxHeight: MEGA_MENU_MAX_HEIGHT,
    ...(layout.marginLeft !== 0 ? { marginLeft: layout.marginLeft } : {}),
  };
}

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
    isOpen && !isRouteActive && 'text-[#E30613]',
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

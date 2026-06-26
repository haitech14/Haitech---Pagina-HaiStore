import { cn } from '@/lib/utils';

/** Barra de menú principal (fondo claro, enlaces oscuros). */
export const MAIN_NAV_BAR_CLASS = 'hidden border-t border-border/60 bg-white lg:block';

export const MAIN_NAV_ROW_CLASS = 'container flex h-11 items-center justify-between gap-4 sm:h-12';

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

export function mainNavLinkClass(isActive: boolean) {
  return cn(
    'inline-flex shrink-0 items-center whitespace-nowrap text-sm font-medium text-[#0f1f3d] transition-colors',
    'hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    isActive && 'font-semibold text-red-600',
  );
}

export function mainNavContactClass(isActive: boolean) {
  return cn(
    'inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#0f1f3d] transition-colors',
    'hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
    isActive && 'font-semibold text-red-600',
  );
}

export const MAIN_NAV_BADGE_CLASS = cn(
  'inline-flex shrink-0 items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700',
  'transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2',
);

/** @deprecated Barra roja anterior; conservado por mega menús legacy. */
export const MAIN_NAV_DIVIDER_CLASS = 'w-px shrink-0 self-stretch bg-white/25';

/** @deprecated */
export const MAIN_NAV_HOME_BUTTON_CLASS = '';

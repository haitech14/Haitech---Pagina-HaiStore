import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wrench } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { HeaderNavChevron } from '@/components/layout/header-nav-chevron';
import {
  DARK_NAV_ICON_CLASS,
  darkNavSecondarySubmenuTriggerClass,
  darkNavSubmenuTriggerClass,
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  SUBMENU_PANEL_ANIMATION_CLASS,
} from '@/components/layout/main-nav-styles';
import { SERVICE_HUB_TABS } from '@/lib/service-hub';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

const SERVICE_NAV_ITEMS = SERVICE_HUB_TABS.filter((tab) => tab.slug !== 'alquiler');

export function ServicesNavDropdown({
  navRow = 'default',
  showIcon = true,
}: {
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
}) {
  const location = useLocation();
  const isServicesRoute =
    location.pathname.startsWith('/servicio-tecnico') ||
    location.pathname.startsWith('/outsourcing') ||
    location.pathname.startsWith('/servicios-corporativos') ||
    (location.pathname === '/servicios' &&
      new URLSearchParams(location.search).get('seccion') !== 'alquiler');

  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    setOpen(true);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const navTriggerClass =
    navRow === 'light-compact'
      ? lightNavSubmenuTriggerCompactClass
      : navRow === 'light'
        ? lightNavSubmenuTriggerClass
        : navRow === 'secondary'
          ? darkNavSecondarySubmenuTriggerClass
          : darkNavSubmenuTriggerClass;

  const iconClass =
    navRow === 'light-compact' ? 'size-3.5 shrink-0' : navRow === 'light' ? 'size-4 shrink-0' : DARK_NAV_ICON_CLASS;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          ref={triggerRef}
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          className={navTriggerClass(isServicesRoute, open)}
        >
          {showIcon ? <Wrench className={iconClass} strokeWidth={1.75} aria-hidden="true" /> : null}
          Servicios
          <HeaderNavChevron navRow={navRow} open={open} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          'z-50 min-w-[14rem] rounded-lg border border-border/70 p-1.5 shadow-xl',
          SUBMENU_PANEL_ANIMATION_CLASS,
        )}
      >
        <ul className="flex flex-col gap-0.5">
          {SERVICE_NAV_ITEMS.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/servicios?seccion=${item.slug}`}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

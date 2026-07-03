import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { HeaderNavChevron } from '@/components/layout/header-nav-chevron';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  DARK_NAV_ICON_CLASS,
  MAIN_NAV_ICON_CLASS,
  darkNavSecondarySubmenuTriggerClass,
  darkNavSubmenuTriggerClass,
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  SUBMENU_PANEL_ANIMATION_CLASS,
} from '@/components/layout/main-nav-styles';
import type { HeaderNavSubmenuConfig } from '@/data/header-nav-submenus';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

const submenuLinkClass =
  'block rounded-md px-3 py-2 text-sm font-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

type HeaderNavDropdownProps = {
  config: HeaderNavSubmenuConfig;
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
};

export function HeaderNavDropdown({
  config,
  navRow = 'default',
  showIcon = true,
}: HeaderNavDropdownProps) {
  const location = useLocation();
  const isRouteActive = config.matchActive(location);
  const Icon = config.icon;

  const [open, setOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    navRow === 'light-compact' ? 'size-3.5 shrink-0' : navRow === 'light' ? MAIN_NAV_ICON_CLASS : DARK_NAV_ICON_CLASS;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-haspopup="true"
          aria-expanded={open}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          onFocus={openMenu}
          className={navTriggerClass(isRouteActive, open)}
        >
          {showIcon ? <Icon className={iconClass} strokeWidth={1.75} aria-hidden="true" /> : null}
          {config.label}
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
          {config.items.map((item) => (
            <li key={item.label}>
              {item.external || item.href.startsWith('http') || item.href.startsWith('mailto:') || item.href.startsWith('tel:') ? (
                <a
                  href={item.href}
                  target={item.external || item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.external || item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  onClick={() => setOpen(false)}
                  className={submenuLinkClass}
                >
                  {item.label}
                </a>
              ) : (
                <Link to={item.href} onClick={() => setOpen(false)} className={submenuLinkClass}>
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

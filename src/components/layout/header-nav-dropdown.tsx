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
import type { HeaderNavSubmenuConfig, HeaderNavSubmenuItem } from '@/data/header-nav-submenus';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

const submenuLinkClass =
  'block rounded-md px-3 py-2 text-sm font-normal text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

const submenuHeadingClass =
  'px-3 pb-1 pt-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground';

const submenuInfoClass =
  'block rounded-md px-3 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600';

function isExternalSubmenuHref(href: string, external?: boolean): boolean {
  return Boolean(external || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:'));
}

function submenuItemKey(item: HeaderNavSubmenuItem, index: number): string {
  if (item.kind === 'info') return `${item.kind}-${item.label}-${item.value}`;
  return `${item.kind ?? 'link'}-${item.label}-${index}`;
}

function HeaderNavSubmenuItemContent({
  item,
  onNavigate,
}: {
  item: HeaderNavSubmenuItem;
  onNavigate: () => void;
}) {
  if (item.kind === 'heading') {
    return <p className={submenuHeadingClass}>{item.label}</p>;
  }

  if (item.kind === 'info') {
    const content = (
      <div className="flex flex-col gap-0.5 text-left">
        <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
        <span className="text-sm text-foreground">{item.value}</span>
      </div>
    );

    if (item.href) {
      const external = isExternalSubmenuHref(item.href, item.external);
      return (
        <a
          href={item.href}
          target={external && item.href.startsWith('http') ? '_blank' : undefined}
          rel={external && item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
          onClick={onNavigate}
          className={submenuInfoClass}
        >
          {content}
        </a>
      );
    }

    return <div className={cn(submenuInfoClass, 'cursor-default')}>{content}</div>;
  }

  const external = isExternalSubmenuHref(item.href, item.external);
  if (external) {
    return (
      <a
        href={item.href}
        target={item.href.startsWith('http') ? '_blank' : undefined}
        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        onClick={onNavigate}
        className={submenuLinkClass}
      >
        {item.label}
      </a>
    );
  }

  return (
    <Link to={item.href} onClick={onNavigate} className={submenuLinkClass}>
      {item.label}
    </Link>
  );
}

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
          {config.items.map((item, index) => (
            <li key={submenuItemKey(item, index)} role={item.kind === 'heading' ? 'presentation' : undefined}>
              <HeaderNavSubmenuItemContent item={item} onNavigate={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

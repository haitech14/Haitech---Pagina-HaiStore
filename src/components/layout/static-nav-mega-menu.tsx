import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
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
import type { NavMegaMenuModel } from '@/lib/mega-menu-from-store-categories';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;
const MEGA_MENU_MIN_WIDTH = 720;
const MEGA_MENU_MAX_WIDTH = 860;

type StaticNavMegaMenuProps = {
  label: string;
  icon: LucideIcon;
  menu: NavMegaMenuModel;
  isRouteActive: boolean;
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
};

export function StaticNavMegaMenu({
  label,
  icon: Icon,
  menu,
  isRouteActive,
  navRow = 'default',
  showIcon = true,
}: StaticNavMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState(menu.defaultCategorySlug);
  const [menuWidth, setMenuWidth] = useState<number | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const columnGroups = useMemo(
    () => menu.getColumnGroups(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  const updateMenuWidth = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const container = trigger.closest('.container');
    const containerRect = container?.getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    const left = containerRect?.left ?? triggerRect.left;
    const rightMargin = containerRect
      ? Math.max(12, window.innerWidth - containerRect.right)
      : 12;
    const available = window.innerWidth - left - rightMargin;
    setMenuWidth(
      Math.min(MEGA_MENU_MAX_WIDTH, Math.max(MEGA_MENU_MIN_WIDTH, available)),
    );
  }, []);

  useEffect(() => {
    const slugs = menu.sidebarItems.map((item) => item.slug);
    if (!slugs.includes(activeCategorySlug)) {
      setActiveCategorySlug(menu.defaultCategorySlug);
    }
  }, [activeCategorySlug, menu.defaultCategorySlug, menu.sidebarItems]);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    clearCloseTimer();
    updateMenuWidth();
    setOpen(true);
  }, [clearCloseTimer, updateMenuWidth]);

  useEffect(() => {
    if (!open) return;
    updateMenuWidth();
    window.addEventListener('resize', updateMenuWidth);
    return () => window.removeEventListener('resize', updateMenuWidth);
  }, [open, updateMenuWidth]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  const closeMenu = () => setOpen(false);

  const navTriggerClass =
    navRow === 'light-compact'
      ? lightNavSubmenuTriggerCompactClass
      : navRow === 'light'
        ? lightNavSubmenuTriggerClass
        : navRow === 'secondary'
          ? darkNavSecondarySubmenuTriggerClass
          : darkNavSubmenuTriggerClass;

  const navIconClass =
    navRow === 'light-compact'
      ? 'size-3.5 shrink-0'
      : navRow === 'light'
        ? MAIN_NAV_ICON_CLASS
        : DARK_NAV_ICON_CLASS;

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
          className={navTriggerClass(isRouteActive, open)}
        >
          {showIcon ? <Icon className={navIconClass} strokeWidth={1.75} aria-hidden="true" /> : null}
          {label}
          <HeaderNavChevron navRow={navRow} open={open} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={cn(
          'z-50 max-w-none overflow-hidden rounded-lg border border-border/70 p-0 shadow-xl',
          SUBMENU_PANEL_ANIMATION_CLASS,
        )}
        style={menuWidth ? { width: menuWidth, maxHeight: 'min(40rem, 82vh)' } : undefined}
      >
        <CatalogMegaMenuPanel
          activeCategorySlug={activeCategorySlug}
          onCategoryChange={setActiveCategorySlug}
          sidebarItems={menu.sidebarItems}
          columnGroups={columnGroups}
          showBrandStrip={menu.categoryShowsBrandStrip(activeCategorySlug)}
          onNavigate={closeMenu}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

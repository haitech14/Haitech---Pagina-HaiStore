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
  computeMegaMenuDropdownLayout,
  DARK_NAV_ICON_CLASS,
  MAIN_NAV_ICON_CLASS,
  darkNavSecondarySubmenuTriggerClass,
  darkNavSubmenuTriggerClass,
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  MEGA_MENU_DROPDOWN_CLASS,
  type MegaMenuDropdownLayout,
  megaMenuDropdownStyle,
} from '@/components/layout/main-nav-styles';
import {
  buildDesktopMegaMenuColumns,
  type NavMegaMenuModel,
} from '@/lib/mega-menu-from-store-categories';

const HOVER_CLOSE_DELAY_MS = 180;

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
  const [menuLayout, setMenuLayout] = useState<MegaMenuDropdownLayout | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const allColumnGroups = useMemo(
    () => buildDesktopMegaMenuColumns(menu, 'sidebar-as-columns'),
    [menu],
  );

  const columnGroups = useMemo(() => {
    const group = allColumnGroups.find((item) => item.slug === activeCategorySlug);
    return group ? [group] : [];
  }, [allColumnGroups, activeCategorySlug]);

  const featuredContent = useMemo(
    () => menu.getFeaturedContent(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  const updateMenuWidth = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setMenuLayout(computeMegaMenuDropdownLayout(trigger));
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
    setActiveCategorySlug(menu.defaultCategorySlug);
    setOpen(true);
  }, [clearCloseTimer, menu.defaultCategorySlug, updateMenuWidth]);

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
        className={MEGA_MENU_DROPDOWN_CLASS}
        style={megaMenuDropdownStyle(menuLayout)}
      >
        <CatalogMegaMenuPanel
          activeCategorySlug={activeCategorySlug}
          onCategoryChange={setActiveCategorySlug}
          sidebarItems={menu.sidebarItems}
          columnGroups={columnGroups}
          featuredContent={featuredContent}
          onNavigate={closeMenu}
          desktopContentMode="summary"
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

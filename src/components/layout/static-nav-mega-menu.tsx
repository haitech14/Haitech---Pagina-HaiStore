import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { HaitechMockupMegaMenuPanel } from '@/components/layout/haitech-mockup-mega-menu-panel';
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
  haitechBlackSubmenuTriggerClass,
  haitechWhiteSubmenuTriggerClass,
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  MEGA_MENU_DROPDOWN_CLASS,
  type MegaMenuDropdownLayout,
  megaMenuDropdownStyle,
} from '@/components/layout/main-nav-styles';
import {
  buildAlquilerMockupMegaMenu,
  buildRepuestosMockupMegaMenu,
  buildServicioTecnicoMockupMegaMenu,
  buildTonerMockupMegaMenu,
  type HaitechMockupMenuKind,
} from '@/data/haitech-mega-menu-mockup';
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
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact' | 'haitech-black' | 'haitech-white';
  showIcon?: boolean;
  mockupMenuKind?: HaitechMockupMenuKind;
  /** Si se define, el clic navega a esta ruta (el menú se abre al hover). */
  triggerHref?: string;
};

function isHaitechClickNavRow(
  navRow: StaticNavMegaMenuProps['navRow'],
): navRow is 'haitech-black' | 'haitech-white' {
  return navRow === 'haitech-black' || navRow === 'haitech-white';
}

export function StaticNavMegaMenu({
  label,
  icon: Icon,
  menu,
  isRouteActive,
  navRow = 'default',
  showIcon = true,
  mockupMenuKind,
  triggerHref,
}: StaticNavMegaMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState(menu.defaultCategorySlug);
  const [menuLayout, setMenuLayout] = useState<MegaMenuDropdownLayout | undefined>(undefined);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const allColumnGroups = useMemo(
    () => buildDesktopMegaMenuColumns(menu, 'sidebar-as-columns'),
    [menu],
  );

  const clickOnlyNav = isHaitechClickNavRow(navRow);
  const enableHover = !clickOnlyNav || Boolean(triggerHref);

  const columnGroups = useMemo(() => {
    if (clickOnlyNav) return allColumnGroups;
    const group = allColumnGroups.find((item) => item.slug === activeCategorySlug);
    return group ? [group] : [];
  }, [activeCategorySlug, allColumnGroups, clickOnlyNav]);

  const featuredContent = useMemo(
    () => menu.getFeaturedContent(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  const activeCategoryLabels = useMemo(() => {
    const item = menu.sidebarItems.find((entry) => entry.slug === activeCategorySlug);
    return item?.label ? [item.label] : [];
  }, [menu.sidebarItems, activeCategorySlug]);

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

  const handleOpenChange = useCallback(
    (next: boolean) => {
      // Con triggerHref el clic navega; no abrir menú solo por toggle de click.
      if (next && triggerHref) return;
      if (next) {
        clearCloseTimer();
        updateMenuWidth();
        setActiveCategorySlug(menu.defaultCategorySlug);
      }
      setOpen(next);
    },
    [clearCloseTimer, menu.defaultCategorySlug, triggerHref, updateMenuWidth],
  );

  const navTriggerClass =
    navRow === 'light-compact'
      ? lightNavSubmenuTriggerCompactClass
      : navRow === 'light'
        ? lightNavSubmenuTriggerClass
        : navRow === 'secondary'
          ? darkNavSecondarySubmenuTriggerClass
          : navRow === 'haitech-white'
            ? haitechWhiteSubmenuTriggerClass
            : navRow === 'haitech-black'
              ? haitechBlackSubmenuTriggerClass
              : darkNavSubmenuTriggerClass;

  const navIconClass =
    navRow === 'light-compact'
      ? 'size-3.5 shrink-0'
      : navRow === 'light' || navRow === 'haitech-white'
        ? MAIN_NAV_ICON_CLASS
        : DARK_NAV_ICON_CLASS;

  const useHaitechMockupPanel = isHaitechClickNavRow(navRow) && mockupMenuKind;
  const mockupData = useMemo(() => {
    if (!useHaitechMockupPanel || !mockupMenuKind) return null;
    if (mockupMenuKind === 'toner') return buildTonerMockupMegaMenu(menu);
    if (mockupMenuKind === 'repuestos') return buildRepuestosMockupMegaMenu(menu);
    if (mockupMenuKind === 'servicio-tecnico') return buildServicioTecnicoMockupMegaMenu();
    return buildAlquilerMockupMegaMenu();
  }, [menu, mockupMenuKind, useHaitechMockupPanel]);

  const hoverProps = enableHover
    ? {
        onMouseEnter: openMenu,
        onMouseLeave: scheduleClose,
        onFocus: openMenu,
      }
    : {};

  const triggerClassName = navTriggerClass(isRouteActive, open);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
      <DropdownMenuTrigger asChild>
        {triggerHref ? (
          <Link
            ref={(node) => {
              triggerRef.current = node;
            }}
            to={triggerHref}
            aria-haspopup="true"
            aria-expanded={open}
            {...hoverProps}
            onClick={closeMenu}
            className={triggerClassName}
          >
            {showIcon ? <Icon className={navIconClass} strokeWidth={1.75} aria-hidden="true" /> : null}
            {label}
            <HeaderNavChevron navRow={navRow} open={open} />
          </Link>
        ) : (
          <button
            ref={(node) => {
              triggerRef.current = node;
            }}
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            {...hoverProps}
            className={triggerClassName}
          >
            {showIcon ? <Icon className={navIconClass} strokeWidth={1.75} aria-hidden="true" /> : null}
            {label}
            <HeaderNavChevron navRow={navRow} open={open} />
          </button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={navRow === 'haitech-black' ? 0 : 4}
        {...(enableHover
          ? {
              onMouseEnter: openMenu,
              onMouseLeave: scheduleClose,
            }
          : {})}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={MEGA_MENU_DROPDOWN_CLASS}
        style={megaMenuDropdownStyle(menuLayout)}
      >
        {mockupData ? (
          <HaitechMockupMegaMenuPanel data={mockupData} onNavigate={closeMenu} />
        ) : (
          <CatalogMegaMenuPanel
            activeCategorySlug={activeCategorySlug}
            onCategoryChange={setActiveCategorySlug}
            sidebarItems={menu.sidebarItems}
            columnGroups={columnGroups}
            featuredContent={featuredContent}
            onNavigate={closeMenu}
            desktopContentMode={clickOnlyNav ? 'grid' : 'summary'}
            activeCategoryLabels={activeCategoryLabels}
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

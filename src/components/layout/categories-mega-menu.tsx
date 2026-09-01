import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Package } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { HaitechMockupMegaMenuPanel } from '@/components/layout/haitech-mockup-mega-menu-panel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PRODUCTOS_NAV_SUBMENU } from '@/data/header-nav-submenus';
import { EQUIPOS_MEGA_MENU_MOCKUP } from '@/data/haitech-mega-menu-mockup';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildDesktopMegaMenuColumns, buildProductosNavMegaMenu } from '@/lib/mega-menu-from-store-categories';
import { prefetchStoreRoute } from '@/lib/prefetch-store-route';
import {
  collectInventoryLabels,
  findStoreCategoryBySlug,
} from '@/lib/store-category-display';
import { HeaderNavChevron } from '@/components/layout/header-nav-chevron';
import {
  computeMegaMenuDropdownLayout,
  DARK_NAV_ICON_CLASS,
  MAIN_NAV_CATEGORIES_BUTTON_CLASS,
  MAIN_NAV_ICON_CLASS,
  MAIN_NAV_ICON_COMPACT_CLASS,
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
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;

function isHaitechClickNavRow(
  navRow: CategoriesMegaMenuProps['navRow'],
): navRow is 'haitech-black' | 'haitech-white' {
  return navRow === 'haitech-black' || navRow === 'haitech-white';
}

interface CategoriesMegaMenuProps {
  triggerVariant?: 'button' | 'nav' | 'categories-button' | 'brand-red';
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact' | 'haitech-black' | 'haitech-white';
  showIcon?: boolean;
  label?: string;
  /** Si se define, el clic navega a esta ruta (el menú se abre al hover). */
  triggerHref?: string;
}

export function CategoriesMegaMenu({
  triggerVariant = 'button',
  navRow = 'default',
  showIcon = true,
  label = 'Equipos',
  triggerHref,
}: CategoriesMegaMenuProps) {
  const location = useLocation();
  const isCatalogRoute = PRODUCTOS_NAV_SUBMENU.matchActive(location);
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildProductosNavMegaMenu(categoryTree), [categoryTree]);

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
    const node = findStoreCategoryBySlug(categoryTree, activeCategorySlug);
    if (node) {
      const labels = collectInventoryLabels(node);
      if (labels.length > 0) return labels;
      if (node.name.trim()) return [node.name.trim()];
    }
    const item = menu.sidebarItems.find((entry) => entry.slug === activeCategorySlug);
    return item?.label ? [item.label] : [];
  }, [categoryTree, activeCategorySlug, menu.sidebarItems]);

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
    prefetchStoreRoute();
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
      ? MAIN_NAV_ICON_COMPACT_CLASS
      : navRow === 'light' || navRow === 'haitech-white'
        ? MAIN_NAV_ICON_CLASS
        : DARK_NAV_ICON_CLASS;

  const panelClassName = MEGA_MENU_DROPDOWN_CLASS;
  const panelStyle = megaMenuDropdownStyle(menuLayout);
  const useHaitechMockupPanel = clickOnlyNav;

  const mockupPanel = useHaitechMockupPanel ? (
    <HaitechMockupMegaMenuPanel data={EQUIPOS_MEGA_MENU_MOCKUP} onNavigate={closeMenu} />
  ) : null;

  const catalogPanel = (
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
  );

  if (triggerVariant === 'nav') {
    const hoverProps = enableHover
      ? {
          onMouseEnter: openMenu,
          onMouseLeave: scheduleClose,
          onFocus: openMenu,
        }
      : {};

    return (
      <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={false}>
        <DropdownMenuTrigger asChild>
          {triggerHref ? (
            <Link
              ref={(node) => {
                triggerRef.current = node;
              }}
              to={triggerHref}
              aria-label={label}
              aria-haspopup="true"
              aria-expanded={open}
              {...hoverProps}
              onClick={closeMenu}
              className={navTriggerClass(isCatalogRoute, open)}
            >
              {showIcon ? (
                <Package className={navIconClass} strokeWidth={1.75} aria-hidden="true" />
              ) : null}
              {label}
              <HeaderNavChevron navRow={navRow} open={open} />
            </Link>
          ) : (
            <button
              ref={(node) => {
                triggerRef.current = node;
              }}
              type="button"
              aria-label={label}
              aria-haspopup="true"
              aria-expanded={open}
              {...hoverProps}
              className={navTriggerClass(isCatalogRoute, open)}
            >
              {showIcon ? (
                <Package className={navIconClass} strokeWidth={1.75} aria-hidden="true" />
              ) : null}
              {label}
              <HeaderNavChevron navRow={navRow} open={open} />
            </button>
          )}
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={navRow === 'haitech-black' ? 0 : 4}
          alignOffset={0}
          avoidCollisions={false}
          {...(enableHover
            ? {
                onMouseEnter: openMenu,
                onMouseLeave: scheduleClose,
              }
            : {})}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={panelClassName}
          style={panelStyle}
        >
          {useHaitechMockupPanel ? mockupPanel : catalogPanel}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {triggerVariant === 'brand-red' ? (
          <button
            ref={(node) => {
              triggerRef.current = node;
            }}
            type="button"
            aria-label={label}
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className={cn(
              'inline-flex h-full min-h-[42px] items-center gap-2 bg-[#E30613] px-4 text-[13px] font-semibold text-white',
              'transition-colors hover:bg-[#c90511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
              (open || isCatalogRoute) && 'bg-[#c90511]',
            )}
          >
            {showIcon ? <Menu className="size-4 shrink-0" aria-hidden="true" /> : null}
            {label}
            <ChevronDown
              aria-hidden="true"
              className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
            />
          </button>
        ) : triggerVariant === 'categories-button' ? (
          <button
            ref={(node) => {
              triggerRef.current = node;
            }}
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className={cn(
              MAIN_NAV_CATEGORIES_BUTTON_CLASS,
              (open || isCatalogRoute) && 'bg-[#2a2a2a]',
            )}
          >
            <Menu className={MAIN_NAV_ICON_CLASS} aria-hidden="true" />
            {label}
          </button>
        ) : (
          <Button
            ref={(node) => {
              triggerRef.current = node;
            }}
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className="h-full gap-2 rounded-none bg-red-700 text-white hover:bg-red-800 focus-visible:ring-white/50 data-[state=open]:bg-red-800"
          >
            <Menu aria-hidden="true" />
            {label}
            <ChevronDown
              aria-hidden="true"
              className={cn('size-4 transition-transform', open && 'rotate-180')}
            />
          </Button>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        side="bottom"
        sideOffset={0}
        alignOffset={0}
        avoidCollisions={false}
        onMouseEnter={openMenu}
        onMouseLeave={scheduleClose}
        onCloseAutoFocus={(event) => event.preventDefault()}
        className={panelClassName}
        style={panelStyle}
      >
        {useHaitechMockupPanel ? mockupPanel : catalogPanel}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Package } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PRODUCTOS_NAV_SUBMENU } from '@/data/header-nav-submenus';
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
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  MEGA_MENU_DROPDOWN_CLASS,
  type MegaMenuDropdownLayout,
  megaMenuDropdownStyle,
} from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

const CatalogMegaMenuPanel = lazy(() =>
  import('@/components/layout/catalog-mega-menu-panel').then((m) => ({
    default: m.CatalogMegaMenuPanel,
  })),
);

const HOVER_CLOSE_DELAY_MS = 180;

function MegaMenuPanelFallback() {
  return (
    <div className="h-64 w-[min(100vw,56rem)] animate-pulse bg-muted/30" aria-hidden="true" />
  );
}

interface CategoriesMegaMenuProps {
  triggerVariant?: 'button' | 'nav' | 'categories-button';
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
  label?: string;
}

export function CategoriesMegaMenu({
  triggerVariant = 'button',
  navRow = 'default',
  showIcon = true,
  label = 'Equipos',
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

  const columnGroups = useMemo(() => {
    const group = allColumnGroups.find((item) => item.slug === activeCategorySlug);
    return group ? [group] : [];
  }, [allColumnGroups, activeCategorySlug]);

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
      ? MAIN_NAV_ICON_COMPACT_CLASS
      : navRow === 'light'
        ? MAIN_NAV_ICON_CLASS
        : DARK_NAV_ICON_CLASS;

  const panelClassName = MEGA_MENU_DROPDOWN_CLASS;
  const panelStyle = megaMenuDropdownStyle(menuLayout);

  if (triggerVariant === 'nav') {
    return (
      <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
        <div
          ref={(node) => {
            triggerRef.current = node;
          }}
          onMouseEnter={openMenu}
          onMouseLeave={scheduleClose}
          className={navTriggerClass(isCatalogRoute, open)}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={label}
              aria-haspopup="true"
              aria-expanded={open}
              onFocus={openMenu}
              onClick={() => {
                clearCloseTimer();
              }}
              className="inline-flex items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              {showIcon ? (
                <Package className={navIconClass} strokeWidth={1.75} aria-hidden="true" />
              ) : null}
              {label}
              <HeaderNavChevron navRow={navRow} open={open} />
            </button>
          </DropdownMenuTrigger>
        </div>

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
          {open ? (
            <Suspense fallback={<MegaMenuPanelFallback />}>
              <CatalogMegaMenuPanel
                activeCategorySlug={activeCategorySlug}
                onCategoryChange={setActiveCategorySlug}
                sidebarItems={menu.sidebarItems}
                columnGroups={columnGroups}
                featuredContent={featuredContent}
                onNavigate={closeMenu}
                desktopContentMode="summary"
                activeCategoryLabels={activeCategoryLabels}
              />
            </Suspense>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {triggerVariant === 'categories-button' ? (
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
            Categorías
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
        {open ? (
          <Suspense fallback={<MegaMenuPanelFallback />}>
            <CatalogMegaMenuPanel
              activeCategorySlug={activeCategorySlug}
              onCategoryChange={setActiveCategorySlug}
              sidebarItems={menu.sidebarItems}
              columnGroups={columnGroups}
              featuredContent={featuredContent}
              onNavigate={closeMenu}
              desktopContentMode="summary"
              activeCategoryLabels={activeCategoryLabels}
            />
          </Suspense>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

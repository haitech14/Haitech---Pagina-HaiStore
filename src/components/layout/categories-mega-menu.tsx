import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, Menu, Package } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { buildLandingCatalogMegaMenu } from '@/lib/mega-menu-from-store-categories';
import { HeaderNavChevron } from '@/components/layout/header-nav-chevron';
import {
  DARK_NAV_ICON_CLASS,
  MAIN_NAV_CATEGORIES_BUTTON_CLASS,
  MAIN_NAV_ICON_CLASS,
  MAIN_NAV_ICON_COMPACT_CLASS,
  darkNavSecondarySubmenuTriggerClass,
  darkNavSubmenuTriggerClass,
  lightNavSubmenuTriggerClass,
  lightNavSubmenuTriggerCompactClass,
  SUBMENU_PANEL_ANIMATION_CLASS,
} from '@/components/layout/main-nav-styles';
import { cn } from '@/lib/utils';

const HOVER_CLOSE_DELAY_MS = 180;
/** Ancho del panel «Todas las categorías» (más compacto que el contenedor en pantallas anchas). */
const MEGA_MENU_MIN_WIDTH = 720;
const MEGA_MENU_MAX_WIDTH = 860;

interface CategoriesMegaMenuProps {
  triggerVariant?: 'button' | 'nav' | 'categories-button';
  navRow?: 'default' | 'secondary' | 'light' | 'light-compact';
  showIcon?: boolean;
}

export function CategoriesMegaMenu({
  triggerVariant = 'button',
  navRow = 'default',
  showIcon = true,
}: CategoriesMegaMenuProps) {
  const location = useLocation();
  const isCatalogRoute =
    location.pathname.startsWith('/categoria') ||
    location.pathname.startsWith('/tienda') ||
    location.pathname.startsWith('/producto');

  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildLandingCatalogMegaMenu(categoryTree), [categoryTree]);

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
      ? MAIN_NAV_ICON_COMPACT_CLASS
      : navRow === 'light'
        ? MAIN_NAV_ICON_CLASS
        : DARK_NAV_ICON_CLASS;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        {triggerVariant === 'categories-button' ? (
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className={cn(
              MAIN_NAV_CATEGORIES_BUTTON_CLASS,
              (open || isCatalogRoute) && 'bg-red-700',
            )}
          >
            <Menu className={MAIN_NAV_ICON_CLASS} aria-hidden="true" />
            Todas las categorías
          </button>
        ) : triggerVariant === 'nav' ? (
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="true"
            aria-expanded={open}
            onMouseEnter={openMenu}
            onMouseLeave={scheduleClose}
            onFocus={openMenu}
            className={navTriggerClass(isCatalogRoute, open)}
          >
            {showIcon ? (
              <Package className={navIconClass} strokeWidth={1.75} aria-hidden="true" />
            ) : null}
            Productos
            <HeaderNavChevron navRow={navRow} open={open} />
          </button>
        ) : (
          <Button
            ref={triggerRef}
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

import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Grid3x3, Headphones, Home, Tag, User } from 'lucide-react';

import { CatalogMegaMenuPanel } from '@/components/layout/catalog-mega-menu-panel';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  MOBILE_BOTTOM_NAV_HEIGHT_PX,
  useSetMobileBottomNavInset,
} from '@/context/mobile-bottom-inset-context';
import { HAITECH_HOME_TOPBAR } from '@/data/haitech-home-shell';
import { HAITECH_OPEN_CATEGORIES_EVENT } from '@/lib/haitech-mobile-nav-events';
import { buildProductosNavMegaMenu } from '@/lib/mega-menu-from-store-categories';
import { shouldShowMobileBottomNav } from '@/lib/mobile-bottom-nav';
import { useStoreCategoriesTree } from '@/hooks/use-store-categories';
import { cn } from '@/lib/utils';

type MobileNavSheet = 'categories' | null;

const navItemClass =
  'flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1 text-[0.625rem] font-semibold leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2';

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { data: categoryTree = [] } = useStoreCategoriesTree();
  const menu = useMemo(() => buildProductosNavMegaMenu(categoryTree), [categoryTree]);

  const [activeSheet, setActiveSheet] = useState<MobileNavSheet>(null);
  const [activeCategorySlug, setActiveCategorySlug] = useState(menu.defaultCategorySlug);

  const visible = shouldShowMobileBottomNav(pathname);
  useSetMobileBottomNavInset(visible ? MOBILE_BOTTOM_NAV_HEIGHT_PX : 0);

  const columnGroups = useMemo(
    () => menu.getColumnGroups(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  const featuredContent = useMemo(
    () => menu.getFeaturedContent(activeCategorySlug),
    [menu, activeCategorySlug],
  );

  useEffect(() => {
    setActiveSheet(null);
  }, [pathname]);

  useEffect(() => {
    const slugs = menu.sidebarItems.map((item) => item.slug);
    if (!slugs.includes(activeCategorySlug)) {
      setActiveCategorySlug(menu.defaultCategorySlug);
    }
  }, [activeCategorySlug, menu.defaultCategorySlug, menu.sidebarItems]);

  useEffect(() => {
    const onOpenCategories = () => setActiveSheet('categories');
    window.addEventListener(HAITECH_OPEN_CATEGORIES_EVENT, onOpenCategories);
    return () => window.removeEventListener(HAITECH_OPEN_CATEGORIES_EVENT, onOpenCategories);
  }, []);

  if (!visible) return null;

  const closeSheet = () => setActiveSheet(null);
  const handleNavigate = () => closeSheet();

  return (
    <>
      <nav
        aria-label="Navegación principal móvil"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E8E8E8] bg-white lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="flex items-stretch gap-0.5 px-1 py-1.5">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
              )
            }
          >
            <Home className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Inicio</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setActiveSheet('categories')}
            aria-expanded={activeSheet === 'categories'}
            aria-controls="mobile-nav-categories-sheet"
            className={cn(
              navItemClass,
              activeSheet === 'categories' ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
            )}
          >
            <Grid3x3 className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Categorías</span>
          </button>

          <NavLink
            to="/tienda"
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
              )
            }
          >
            <Tag className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Ofertas</span>
          </NavLink>

          <a
            href={HAITECH_HOME_TOPBAR.supportHref}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(navItemClass, 'text-[#6B6B6B] hover:text-[#222]')}
          >
            <Headphones className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Soporte</span>
          </a>

          <NavLink
            to="/mi-cuenta"
            className={({ isActive }) =>
              cn(
                navItemClass,
                isActive ? 'text-[#E30613]' : 'text-[#6B6B6B] hover:text-[#222]',
              )
            }
          >
            <User className="size-5 shrink-0" aria-hidden="true" strokeWidth={1.75} />
            <span>Cuenta</span>
          </NavLink>
        </div>
      </nav>

      <Sheet open={activeSheet === 'categories'} onOpenChange={(open) => !open && closeSheet()}>
        <SheetContent
          id="mobile-nav-categories-sheet"
          side="bottom"
          className="flex max-h-[85dvh] flex-col gap-0 p-0"
          aria-describedby={undefined}
        >
          <SheetHeader className="border-b border-border px-4 py-3 text-left">
            <SheetTitle className="text-base">Categorías</SheetTitle>
          </SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <CatalogMegaMenuPanel
              layout="mobile"
              activeCategorySlug={activeCategorySlug}
              onCategoryChange={setActiveCategorySlug}
              sidebarItems={menu.sidebarItems}
              columnGroups={columnGroups}
              featuredContent={featuredContent}
              onNavigate={handleNavigate}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
